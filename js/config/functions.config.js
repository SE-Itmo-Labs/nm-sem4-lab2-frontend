const FUNCTIONS_CONFIG = {
    'g1': {
        name: 'f(x) = 0.4x⁴ - (x - 0.1)² + 0.2',
        latex: '0.4x^4 - (x - 0.1)^2 + 0.2',
        viewport: { xmin: -3, ymin: -5, xmax: 3, ymax: 10 },
        description: 'Полином 4-й степени'
    },
    'g2': {
        name: 'f(x) = e^x + 4x² - 22.8x',
        latex: 'e^x + 4x^2 - 22.8x',
        viewport: { xmin: -2, ymin: -10, xmax: 4, ymax: 20 },
        description: 'Экспонента и квадратичная функция'
    },
    'g3': {
        name: 'f(x) = sin(x²) + 0.3x',
        latex: '\\sin(x^2) + 0.3x',
        viewport: { xmin: -4, ymin: -5, xmax: 4, ymax: 5 },
        description: 'Трансцендентная функция'
    }
};