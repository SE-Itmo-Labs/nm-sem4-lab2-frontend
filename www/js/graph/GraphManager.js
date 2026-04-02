class GraphManager {
    constructor() {
        this.mainGraph = null;
        this.rootExpressionIds = [];
    }

    async createMainGraph(elementId, config) {
        this.mainGraph = new DesmosGraph(elementId, config);
        await this.mainGraph.init();
        return this.mainGraph;
    }

    renderFunction(funcConfig) {
        if (!this.mainGraph) return;

        this.mainGraph.clearExpressions();
        this.rootExpressionIds = [];
        this.mainGraph.setViewport(funcConfig.viewport);

        this.mainGraph.addExpression({ id: 'func_curve', latex: funcConfig.latex, color: '#c74440' });
        this.mainGraph.addExpression({ id: 'xaxis', latex: 'y = 0', color: '#000000', lineWidth: 1 });
        this.mainGraph.addExpression({ id: 'yaxis', latex: 'x = 0', color: '#000000', lineWidth: 1 });
    }

    markRoot(x, y, changeViewport = true) {
        if (!this.mainGraph?.calculator) return;

        this.clearRootMarker();
        const xR = Math.round(x * 10000) / 10000;
        const yR = Math.round(y * 10000) / 10000;

        // this.mainGraph.addExpression({
        //     id: 'root_point', latex: `R=(${xR},${yR})`, color: '#ff0000', label: 'Корень', showLabel: true
        // });
        this.mainGraph.addExpression({
            id: 'root_dot', latex: `(${xR},${yR})`, color: '#ff0000'
        });
        this.mainGraph.addExpression({
            id: 'root_coords', latex: `\\text{(${xR.toFixed(4)}; ${yR.toFixed(6)})}`, color: '#ff0000'
        });

        this.rootExpressionIds.push('root_point', 'root_dot', 'root_coords');

        if (changeViewport) {
            setTimeout(() => {
                this.mainGraph.calculator.setMathBounds({
                    left: xR - 1.5, right: xR + 1.5,
                    bottom: Math.min(yR - 1.5, -0.5), top: Math.max(yR + 1.5, 0.5)
                });
            }, 150);
        }
    }

    clearRootMarker() {
        if (!this.mainGraph?.calculator) return;
        this.rootExpressionIds.forEach(id => {
            try { this.mainGraph.calculator.removeExpression({ id }); } catch(e) {}
        });
        this.rootExpressionIds = [];
    }
}