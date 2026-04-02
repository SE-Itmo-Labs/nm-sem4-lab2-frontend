/**
 * Менеджер для управления графиками
 */
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

        // this._updateDescription(graphType);
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

    // _updateDescription(graphType) {
    //     if (!this.descriptionElement) return;
    //
    //     const map = {
    //         'full': { title: 'Полный график', roots: 'x₁≈-7.291, x₂≈0.345, x₃≈2.136' },
    //         'var13_full': { title: 'Полный график', roots: 'x₁≈-7.291, x₂≈0.345, x₃≈2.136' },
    //         'root1': { title: 'Корень x₁ (хорды)', interval: '[-9; -4]', result: 'x₁ ≈ -7.291' },
    //         'var13_x1': { title: 'Корень x₁ (хорды)', interval: '[-9; -4]', result: 'x₁ ≈ -7.291' },
    //         'root2': { title: 'Корень x₂ (Ньютон)', interval: '[-4; 1.5]', result: 'x₂ ≈ 0.345' },
    //         'var13_x2': { title: 'Корень x₂ (Ньютон)', interval: '[-4; 1.5]', result: 'x₂ ≈ 0.345' },
    //         'root3': { title: 'Корень x₃ (итерации)', interval: '[1.5; 5]', result: 'x₃ ≈ 2.136' },
    //         'var13_x3': { title: 'Корень x₃ (итерации)', interval: '[1.5; 5]', result: 'x₃ ≈ 2.136' },
    //         'system': { title: 'Система уравнений', sys: '{ sin(y+2x)=2; y+cos(x-1)=0.7 }', sol: 'x≈1.146, y≈-0.289' },
    //         'sys13': { title: 'Система уравнений', sys: '{ sin(y+2x)=2; y+cos(x-1)=0.7 }', sol: 'x≈1.146, y≈-0.289' }
    //     };
    //
    //     const data = map[graphType] || map['full'];
    //     let html = `<h3>${data.title}</h3><p><b>Функция:</b> f(x) = x³ + 4.81x² - 17.37x + 5.38</p>`;
    //
    //     if (data.roots) html += `<p><b>Корни:</b> ${data.roots}</p>`;
    //     if (data.interval) html += `<p><b>Интервал:</b> ${data.interval}</p><p><b>Результат:</b> ${data.result}</p>`;
    //     if (data.sys) html += `<p><b>Система:</b> ${data.sys}</p><p><b>Решение:</b> ${data.sol}</p>`;
    //
    //     this.descriptionElement.innerHTML = html;
    //
    //     if (this.captionElement) {
    //         const captions = {
    //             'full': 'Рис. 1. Полный график функции',
    //             'root1': 'Рис. 2. Интервал корня x₁',
    //             'root2': 'Рис. 3. Интервал корня x₂',
    //             'root3': 'Рис. 4. Интервал корня x₃',
    //             'system': 'Рис. 5. Система уравнений'
    //         };
    //         this.captionElement.textContent = captions[graphType] || captions['full'];
    //     }
    // }

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