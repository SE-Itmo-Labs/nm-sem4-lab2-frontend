/**
 * Менеджер для управления графиками
 */
class GraphManager {
    constructor() {
        this.mainGraph = null;
        this.selectElement = null;
        this.descriptionElement = null;
        this.captionElement = null;
        this.rootExpressionIds = []; // Храним ID точек корня
    }

    async createMainGraph(elementId, config) {
        this.mainGraph = new DesmosGraph(elementId, config);
        await this.mainGraph.init();
        return this.mainGraph;
    }

    switchToGraph(graphType) {
        if (!this.mainGraph) {
            console.error('Main graph not initialized');
            return;
        }

        this.mainGraph.clearExpressions();
        this.rootExpressionIds = []; // Очищаем ID корней

        switch(graphType) {
            case 'g1':
            case 'var13_full':
                this._setupFullGraph();
                break;
            case 'system':
            case 'sys13':
                this._setupSystemGraph();
                break;
            default:
                console.warn(`Unknown graph type: ${graphType}`);
                this._setupFullGraph();
        }
    }

    _setupFullGraph() {
        const func = FUNCTIONS_CONFIG['var13'];
        this.mainGraph.setViewport(func.viewport);

        this.mainGraph.addExpression({
            id: 'func1',
            latex: `f(x) = ${func.latex}`,
            color: '#c74440'
        });
        this.mainGraph.addExpression({ id: 'xaxis', latex: 'y = 0', color: '#000000', lineWidth: 1 });
        this.mainGraph.addExpression({ id: 'yaxis', latex: 'x = 0', color: '#000000', lineWidth: 1 });
    }

    _setupSystemGraph() {
        const sys = SYSTEMS_CONFIG['sys13'];
        this.mainGraph.setViewport(sys.viewport);

        sys.equations.forEach((eq, i) => {
            this.mainGraph.addExpression({
                id: `sys_eq${i+1}`,
                latex: eq.latex,
                color: eq.color
            });
        });

        this.mainGraph.addExpression({
            id: 'solution',
            latex: `(${sys.solution.x}, ${sys.solution.y})`,
            color: '#ff0000',
            pointSize: Desmos.PointSize?.LARGE || 'large'
        });
    }

    /**
     * Отобразить функцию без корней (чистый график)
     */
    renderFunction(funcConfig) {
        if (!this.mainGraph) {
            console.error('❌ Graph not initialized');
            return;
        }

        // 1. Сохраняем координаты корня, если он есть
        let savedRoot = null;
        if (this.rootExpressionIds.includes('root_point') && this.mainGraph.calculator) {
            const exprs = this.mainGraph.calculator.expressions?.list || [];
            const rootExpr = exprs.find(e => e.id === 'root_point');
            if (rootExpr?.latex) {
                // Парсим координаты из латекса вида "R=(x,y)" или "(x,y)"
                const match = rootExpr.latex.match(/\(([^,]+),\s*([^)]+)\)/);
                if (match) {
                    savedRoot = {
                        x: parseFloat(match[1]),
                        y: parseFloat(match[2])
                    };
                }
            }
        }

        // 2. Очищаем все выражения и сбрасываем трекинг
        this.mainGraph.clearExpressions();
        this.rootExpressionIds = [];

        // 3. Устанавливаем viewport из конфига функции
        this.mainGraph.setViewport(funcConfig.viewport);

        // 4. Добавляем саму функцию
        this.mainGraph.addExpression({
            id: 'func_curve',
            latex: funcConfig.latex,  // ← Важно: без "f(x) =", просто выражение
            color: '#c74440',
            hidden: false
        });

        // 5. Добавляем оси координат
        this.mainGraph.addExpression({
            id: 'xaxis',
            latex: 'y = 0',
            color: '#000000',
            lineWidth: 1,
            hidden: false
        });
        this.mainGraph.addExpression({
            id: 'yaxis',
            latex: 'x = 0',
            color: '#000000',
            lineWidth: 1,
            hidden: false
        });

        // 6. Восстанавливаем точку корня, если она была
        if (savedRoot) {
            // Небольшая задержка, чтобы график успел отрисоваться
            setTimeout(() => {
                this.markRoot(savedRoot.x, savedRoot.y, false); // false = не менять viewport
            }, 150);
        }

        console.log('📈 Function rendered:', funcConfig.name);
    }

    /**
     * Отметить найденный корень на графике красной точкой
     */
    markRoot(x, y, changeViewport = true) {
        if (!this.mainGraph?.calculator) {
            console.error('❌ Graph calculator not ready');
            return;
        }

        // 1. Очищаем старые маркеры
        this.clearRootMarker();

        // 2. Округляем для чистоты
        const xRounded = Math.round(x * 10000) / 10000;
        const yRounded = Math.round(y * 10000) / 10000;

        console.log('🎯 Добавляем точку корня:', { x: xRounded, y: yRounded });

        // 3. Добавляем точку как именованную переменную (надёжнее для Desmos)
        this.mainGraph.addExpression({
            id: 'root_point',
            latex: `R=(${xRounded},${yRounded})`,  // ← Имя переменной R помогает стилизации
            color: '#ff0000',
            label: 'Корень',
            showLabel: true
        });
        this.rootExpressionIds.push('root_point');

        // 4. Добавляем крупный маркер поверх для видимости
        this.mainGraph.addExpression({
            id: 'root_dot',
            latex: `(${xRounded},${yRounded})`,
            color: '#ff0000'
        });
        this.rootExpressionIds.push('root_dot');

        // 5. Подпись с координатами
        this.mainGraph.addExpression({
            id: 'root_coords',
            latex: `\\text{(${xRounded.toFixed(4)}; ${yRounded.toFixed(6)})}`,
            color: '#ff0000'
        });
        this.rootExpressionIds.push('root_coords');

        // 6. Опционально: центрируем вид на точке (с задержкой для стабильности)
        if (changeViewport) {
            setTimeout(() => {
                const padding = 1.5;
                this.mainGraph.calculator.setMathBounds({
                    left: xRounded - padding,
                    right: xRounded + padding,
                    bottom: Math.min(yRounded - padding, -0.5),  // не даём ужать по Y слишком сильно
                    top: Math.max(yRounded + padding, 0.5)
                });
            }, 150);
        }

        // 7. Отладка: проверяем через 300мс, добавилась ли точка
        setTimeout(() => {
            const exprs = this.mainGraph.calculator.expressions?.list || [];
            const rootExists = exprs.some(e => e.id === 'root_point' || e.id === 'root_dot');
            console.log('🔍 Проверка точки через 300мс:', rootExists ? '✓ найдена' : '✗ не найдена');
            if (!rootExists) {
                console.warn('⚠️ Точка не отобразилась. Проверьте:');
                console.warn('  - Координаты:', xRounded, yRounded);
                console.warn('  - Viewport:', this.mainGraph.calculator.mathBounds);
                console.warn('  - Все выражения:', exprs.map(e => ({id: e.id, latex: e.latex})));
            }
        }, 300);
    }
    /**
     * Очистить точку корня
     */
    clearRootMarker() {
        if (!this.mainGraph || !this.mainGraph.calculator) {
            return;
        }

        // Удаляем все сохраненные ID точек корня
        this.rootExpressionIds.forEach(id => {
            try {
                this.mainGraph.calculator.removeExpression({ id: id });
            } catch(e) {
                // Игнорируем ошибки, если выражение не найдено
            }
        });

        this.rootExpressionIds = [];
    }

    initDropdown(selectId, descriptionId, captionId) {
        this.selectElement = document.getElementById(selectId);
        this.descriptionElement = document.getElementById(descriptionId);
        this.captionElement = document.getElementById(captionId);

        if (!this.selectElement) {
            console.error('Dropdown not found');
            return;
        }

        this.selectElement.addEventListener('change', (e) => {
            this.switchToGraph(e.target.value);
        });

        this.switchToGraph(this.selectElement.value);
    }
}