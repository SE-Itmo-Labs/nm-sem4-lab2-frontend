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