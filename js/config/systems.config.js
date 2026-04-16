const SYSTEMS_CONFIG = {
    's1': {
        name: '{ 0.5x^2 + 2y^2 = 1; y = e^x - 1 }',
        equations: [
            { latex: '0.5x^2 + 2y^2 = 1', color: '#c74440', description: '' },
            { latex: 'y = e^x - 1', color: '#2d70b3', description: '' }
        ],
        viewport: { xmin: -2, ymin: -1.5, xmax: 2, ymax: 1.5 }
    },
    's2': {
        name: '{ y = sin(2x) + cos(10x); x^3 + y^2 = 1 }',
        equations: [
            { latex: 'y = \\sin(2x) + \\cos(10x)', color: '#c74440', description: '' },
            { latex: 'x^3 + y^2 = 1', color: '#2d70b3', description:  '' }
        ],
        viewport: { xmin: -2, ymin: -2, xmax: 2, ymax: 2 }
    },
    's3': {
        name: '{ y = sin(2x); x = cos(3y) }',
        equations: [
            { latex: 'y = \\sin(2x)', color: '#c74440', description: '' },
            { latex: 'x = \\cos(3y)', color: '#2d70b3', description: '' }
        ],
        viewport: { xmin: -5, ymin: -8, xmax: 5, ymax: 8 }
    }
};