const SYSTEMS_CONFIG = {
    'sys13': {
        name: '{ sin(y)+2x=2; y+cos(x-1)=0.7 }',
        equations: [
            { latex: 'y = 2 - 2x', color: '#c74440', description: 'f₁(x,y) = 0' },
            { latex: 'y = 0.7 - \\cos(x - 1)', color: '#2d70b3', description: 'f₂(x,y) = 0' }
        ],
        viewport: { xmin: -1, ymin: -2, xmax: 3, ymax: 2 }
    }
};