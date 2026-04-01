/**
 * Конфигурация функций — Вариант 13 + дополнительные
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