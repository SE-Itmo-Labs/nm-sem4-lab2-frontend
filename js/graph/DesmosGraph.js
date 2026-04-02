/**
 * Класс для управления одним графиком Desmos
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