/**
 * === КОНФИГУРАЦИИ (должны быть вверху!) ===
 */

/**
 * Конфигурация функций — Вариант 13 (основной) + дополнительные
 */
const FUNCTIONS_CONFIG = {
    'var13': {
        name: 'f(x) = x³ + 4.81x² - 17.37x + 5.38 (Вариант 13)',
        latex: 'x^3 + 4.81x^2 - 17.37x + 5.38',
        roots: {
            x1: { value: -7.291, interval: [-9, -4], method: 'Хорд' },
            x2: { value: 0.345, interval: [-4, 1.5], method: 'Ньютона' },
            x3: { value: 2.136, interval: [1.5, 5], method: 'Простой итерации' }
        },
        viewport: { xmin: -10, ymin: -200, xmax: 6, ymax: 200 }
    },
    'func1': {
        name: 'f(x) = 2x³ + 3.41x² - 23.74x + 2.95',
        latex: '2x^3 + 3.41x^2 - 23.74x + 2.95',
        roots: {
            x1: { value: -4.234, interval: [-5, -3], method: 'Хорд' },
            x2: { value: 0.125, interval: [0, 1], method: 'Ньютона' },
            x3: { value: 2.856, interval: [2, 4], method: 'Простой итерации' }
        },
        viewport: { xmin: -6, ymin: -50, xmax: 5, ymax: 50 }
    },
    'func2': {
        name: 'f(x) = sin(x) - x/2 + 1',
        latex: '\\sin(x) - x/2 + 1',
        roots: {
            x1: { value: -1.456, interval: [-2, -1], method: 'Хорд' },
            x2: { value: 2.345, interval: [2, 3], method: 'Ньютона' }
        },
        viewport: { xmin: -3, ymin: -3, xmax: 4, ymax: 3 }
    },
    'func3': {
        name: 'f(x) = e^{-x} - x² + 2',
        latex: 'e^{-x} - x^2 + 2',
        roots: {
            x1: { value: -1.123, interval: [-2, 0], method: 'Ньютона' },
            x2: { value: 1.567, interval: [1, 2], method: 'Простой итерации' }
        },
        viewport: { xmin: -3, ymin: -5, xmax: 3, ymax: 5 }
    },
    'func4': {
        name: 'f(x) = x³ - 3.125x² - 3.5x + 2.458',
        latex: 'x^3 - 3.125x^2 - 3.5x + 2.458',
        roots: {
            x1: { value: -1.234, interval: [-2, -1], method: 'Хорд' },
            x2: { value: 0.567, interval: [0, 1], method: 'Ньютона' },
            x3: { value: 3.792, interval: [3, 4], method: 'Простой итерации' }
        },
        viewport: { xmin: -3, ymin: -10, xmax: 5, ymax: 10 }
    }
};

/**
 * Конфигурация систем уравнений
 */
const SYSTEMS_CONFIG = {
    'sys13': {
        name: 'Система варианта 13',
        equations: [
            { latex: 'y = 2 - \\sin(2x)', color: Desmos.Colors?.[0] || '#c74440' },
            { latex: 'y = 0.7 - \\cos(x - 1)', color: Desmos.Colors?.[1] || '#2d70b3' }
        ],
        solution: { x: 1.146, y: -0.289 },
        viewport: { xmin: -1, ymin: -2, xmax: 3, ymax: 2 },
        method: 'Простая итерация'
    }
};

/**
 * === КЛАССЫ ===
 */

class DesmosGraph {
    constructor(elementId, config = {}) {
        this.elementId = elementId;
        this.element = document.getElementById(elementId);
        this.calculator = null;
        this.expressions = [];
        this.config = {
            expressions: false,
            settingsMenu: false,
            zoomButtons: false,
            trace: false,
            showGrid: true,
            showXAxis: true,
            showYAxis: true,
            xAxisNumbers: true,
            yAxisNumbers: true,
            lockedViewport: false,
            allowUndo: false,
            border: false,
            viewport: { xmin: -10, ymin: -10, xmax: 10, ymax: 10 },
            ...config
        };
    }

    init() {
        return new Promise((resolve, reject) => {
            if (!this.element) {
                console.error(`Element "${this.elementId}" not found`);
                reject('Element not found');
                return;
            }

            // Ждём готовности Desmos API
            if (typeof Desmos === 'undefined' || !Desmos.GraphingCalculator) {
                console.warn('Desmos API not ready, waiting...');
                const checkInterval = setInterval(() => {
                    if (Desmos?.GraphingCalculator) {
                        clearInterval(checkInterval);
                        this._createCalculator(resolve);
                    }
                }, 100);
                setTimeout(() => {
                    clearInterval(checkInterval);
                    reject('Desmos API timeout');
                }, 5000);
            } else {
                this._createCalculator(resolve);
            }
        });
    }

    _createCalculator(callback) {
        try {
            this.calculator = Desmos.GraphingCalculator(this.element, this.config);
            this.setViewport(this.config.viewport);
            callback();
        } catch (e) {
            console.error('Failed to create Desmos calculator:', e);
        }
    }

    setViewport(viewport) {
        if (this.calculator) {
            this.calculator.setMathBounds({
                left: viewport.xmin,
                right: viewport.xmax,
                bottom: viewport.ymin,
                top: viewport.ymax
            });
        }
    }

    addExpression(expr) {
        if (this.calculator) {
            this.calculator.setExpression(expr);
            this.expressions.push(expr.id);
        }
    }

    clearExpressions() {
        if (this.calculator) {
            this.expressions.forEach(id => {
                try { this.calculator.removeExpression({ id }); } catch(e) {}
            });
            this.expressions = [];
        }
    }

    destroy() {
        this.clearExpressions();
        if (this.calculator) {
            this.calculator.destroy();
        }
    }
}

class GraphManager {
    constructor() {
        this.mainGraph = null;
        this.selectElement = null;
        this.descriptionElement = null;
        this.captionElement = null;
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

        switch(graphType) {
            case 'full':
            case 'var13_full':
                this._setupFullGraph();
                break;
            case 'root1':
            case 'var13_x1':
                this._setupRootGraph('x1');
                break;
            case 'root2':
            case 'var13_x2':
                this._setupRootGraph('x2');
                break;
            case 'root3':
            case 'var13_x3':
                this._setupRootGraph('x3');
                break;
            case 'system':
            case 'sys13':
                this._setupSystemGraph();
                break;
            default:
                console.warn(`Unknown graph type: ${graphType}`);
                this._setupFullGraph(); // fallback
        }

        this._updateDescription(graphType);
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

        Object.entries(func.roots).forEach(([name, data], i) => {
            this.mainGraph.addExpression({
                id: name,
                latex: `x = ${data.value}`,
                color: ['#2d70b3', '#388c46', '#6042a6'][i] || '#c74440',
                lineStyle: Desmos.LineStyle?.DASHED || 'dashed'
            });
        });
    }

    _setupRootGraph(rootName) {
        const func = FUNCTIONS_CONFIG['var13'];
        const root = func.roots[rootName];
        if (!root) return;

        const [a, b] = root.interval;
        const padding = (b - a) * 0.3;
        this.mainGraph.setViewport({
            xmin: a - padding, ymin: -50, xmax: b + padding, ymax: 50
        });

        this.mainGraph.addExpression({
            id: 'func1',
            latex: `f(x) = ${func.latex}`,
            color: '#c74440'
        });
        this.mainGraph.addExpression({ id: 'int_a', latex: `x = ${a}`, color: '#ff0000', lineStyle: 'dotted' });
        this.mainGraph.addExpression({ id: 'int_b', latex: `x = ${b}`, color: '#ff0000', lineStyle: 'dotted' });
        this.mainGraph.addExpression({
            id: 'root',
            latex: `x = ${root.value}`,
            color: '#2d70b3',
            lineStyle: Desmos.LineStyle?.DASHED || 'dashed'
        });
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

    _updateDescription(graphType) {
        if (!this.descriptionElement) return;

        const map = {
            'full': { title: 'Полный график', roots: 'x₁≈-7.291, x₂≈0.345, x₃≈2.136' },
            'var13_full': { title: 'Полный график', roots: 'x₁≈-7.291, x₂≈0.345, x₃≈2.136' },
            'root1': { title: 'Корень x₁ (хорды)', interval: '[-9; -4]', result: 'x₁ ≈ -7.291' },
            'var13_x1': { title: 'Корень x₁ (хорды)', interval: '[-9; -4]', result: 'x₁ ≈ -7.291' },
            'root2': { title: 'Корень x₂ (Ньютон)', interval: '[-4; 1.5]', result: 'x₂ ≈ 0.345' },
            'var13_x2': { title: 'Корень x₂ (Ньютон)', interval: '[-4; 1.5]', result: 'x₂ ≈ 0.345' },
            'root3': { title: 'Корень x₃ (итерации)', interval: '[1.5; 5]', result: 'x₃ ≈ 2.136' },
            'var13_x3': { title: 'Корень x₃ (итерации)', interval: '[1.5; 5]', result: 'x₃ ≈ 2.136' },
            'system': { title: 'Система уравнений', sys: '{ sin(y+2x)=2; y+cos(x-1)=0.7 }', sol: 'x≈1.146, y≈-0.289' },
            'sys13': { title: 'Система уравнений', sys: '{ sin(y+2x)=2; y+cos(x-1)=0.7 }', sol: 'x≈1.146, y≈-0.289' }
        };

        const data = map[graphType] || map['full'];
        let html = `<h3>${data.title}</h3><p><b>Функция:</b> f(x) = x³ + 4.81x² - 17.37x + 5.38</p>`;

        if (data.roots) html += `<p><b>Корни:</b> ${data.roots}</p>`;
        if (data.interval) html += `<p><b>Интервал:</b> ${data.interval}</p><p><b>Результат:</b> ${data.result}</p>`;
        if (data.sys) html += `<p><b>Система:</b> ${data.sys}</p><p><b>Решение:</b> ${data.sol}</p>`;

        this.descriptionElement.innerHTML = html;

        if (this.captionElement) {
            const captions = {
                'full': 'Рис. 1. Полный график функции',
                'root1': 'Рис. 2. Интервал корня x₁',
                'root2': 'Рис. 3. Интервал корня x₂',
                'root3': 'Рис. 4. Интервал корня x₃',
                'system': 'Рис. 5. Система уравнений'
            };
            this.captionElement.textContent = captions[graphType] || captions['full'];
        }
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

        // Инициализируем с текущим значением
        this.switchToGraph(this.selectElement.value);
    }
}

/**
 * === ИНИЦИАЛИЗАЦИЯ ===
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📊 Initializing graphs...');

    const graphManager = new GraphManager();

    try {
        await graphManager.createMainGraph('calculator', {
            viewport: { xmin: -10, ymin: -200, xmax: 6, ymax: 200 }
        });
        console.log('✅ Graph initialized');

        graphManager.initDropdown('graphSelect', 'graph-description', 'graph-caption');
        window.graphManager = graphManager; // для отладки
    } catch (e) {
        console.error('❌ Failed to initialize:', e);
        document.getElementById('plot-area').innerHTML =
            '<div style="color:red;padding:20px">⚠️ Ошибка загрузки графика. Проверьте консоль.</div>';
    }
});