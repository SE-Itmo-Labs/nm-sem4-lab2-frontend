let eqGraphManager = null;
let sysGraphManager = null;

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (tabName === 'equations') {
        document.getElementById('equationsTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else {
        document.getElementById('systemsTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        eqGraphManager = new GraphManager();
        await eqGraphManager.createMainGraph('eqCalculator', {
            viewport: { xmin: -3, ymin: -5, xmax: 3, ymax: 10 }
        });

        sysGraphManager = new GraphManager();
        await sysGraphManager.createMainGraph('sysCalculator', {
            viewport: { xmin: -1, ymin: -2, xmax: 3, ymax: 2 }
        });

        initEquationForm();
        initSystemForm();

        window.eqGraphManager = eqGraphManager;
        window.sysGraphManager = sysGraphManager;
    } catch (e) {
        console.error('Initialization failed:', e);
    }

    const pirateVideo = document.getElementById('pirateVideo');
    if (pirateVideo) {
        pirateVideo.addEventListener('mouseenter', () => {
            pirateVideo.playbackRate = 3.0;
        });
        pirateVideo.addEventListener('mouseleave', () => {
            pirateVideo.playbackRate = 1.0;
        });
    }
});

function initEquationForm() {
    const form = document.getElementById('equationForm');
    form.addEventListener('submit', handleEquationSubmit);
    form.addEventListener('reset', () => {
        setTimeout(() => {
            document.getElementById('eqFormStatus').className = 'status-message';
            document.getElementById('eqResultsPanel').style.display = 'none';
        }, 100);
    });

    document.getElementById('eqFunctionSelect').addEventListener('change', function() {
        const funcId = this.value;
        if (funcId && FUNCTIONS_CONFIG[funcId]) {
            eqGraphManager.renderFunction(FUNCTIONS_CONFIG[funcId]);
            document.getElementById('eqGraphCaption').textContent = FUNCTIONS_CONFIG[funcId].name;
        }
    });
}

function initSystemForm() {
    const form = document.getElementById('systemForm');
    form.addEventListener('submit', handleSystemSubmit);
    form.addEventListener('reset', () => {
        setTimeout(() => {
            document.getElementById('sysFormStatus').className = 'status-message';
            document.getElementById('sysResultsPanel').style.display = 'none';
        }, 100);
    });

    document.getElementById('sysSelect').addEventListener('change', function() {
        const sysId = this.value;
        if (sysId && SYSTEMS_CONFIG[sysId]) {
            sysGraphManager.renderSystem(SYSTEMS_CONFIG[sysId]);
            document.getElementById('sysGraphCaption').textContent = SYSTEMS_CONFIG[sysId].name;
        }
    });
}

async function handleEquationSubmit(e) {
    e.preventDefault();

    const data = {
        function: document.getElementById('eqFunctionSelect').value,
        method: document.getElementById('eqMethodSelect').value,
        intervalA: parseFloat(document.getElementById('eqIntervalA').value),
        intervalB: parseFloat(document.getElementById('eqIntervalB').value),
        x0: parseFloat(document.getElementById('eqX0Input').value) || null,
        epsilon: parseFloat(document.getElementById('eqEpsilonInput').value) || 0.0001
    };

    if (!data.function || !data.method || data.intervalA == null || data.intervalB == null) {
        showStatus('eqFormStatus', 'Заполните все обязательные поля', 'error');
        return;
    }

    try {
        showStatus('eqFormStatus', 'Отправка данных...', 'info');
        const response = await fetch('https://itmo.ssngn.ru/lab5/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success && result.data) {
            showStatus('eqFormStatus', 'Расчёт завершён успешно!', 'success');
            displayEquationResults(result);
        } else {
            showStatus('eqFormStatus', 'Ошибка: ' + result.error, 'error');
        }
    } catch (error) {
        showStatus('eqFormStatus', 'Ошибка соединения: ' + error.message, 'error');
    }
}

async function handleSystemSubmit(e) {
    e.preventDefault();

    const data = {
        function: document.getElementById('sysSelect').value,
        method: 'newton',
        x0: parseFloat(document.getElementById('sysX0Input').value),
        y0: parseFloat(document.getElementById('sysY0Input').value),
        epsilon: parseFloat(document.getElementById('sysEpsilonInput').value) || 0.0001
    };

    if (!data.function || data.x0 == null || data.y0 == null) {
        showStatus('sysFormStatus', 'Заполните все обязательные поля', 'error');
        return;
    }

    try {
        showStatus('sysFormStatus', 'Отправка данных...', 'info');
        const response = await fetch('https://itmo.ssngn.ru/lab5/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success && result.data) {
            showStatus('sysFormStatus', 'Расчёт завершён успешно!', 'success');
            displaySystemResults(result.data, result.iterations);
        } else {
            showStatus('sysFormStatus', 'Ошибка: ' + result.error, 'error');
        }
    } catch (error) {
        showStatus('sysFormStatus', 'Ошибка соединения: ' + error.message, 'error');
    }
}

function displayEquationResults(data) {
    eqGraphManager.markRoot(data.data.root, data.data.fValue);

    console.log(data);

    document.getElementById('eqResultRoot').textContent = data.data.root.toFixed(6);
    document.getElementById('eqResultFValue').textContent = data.data.fValue.toFixed(10);
    document.getElementById('eqResultIterations').textContent = data.data.iterations;
    document.getElementById('eqResultsPanel').style.display = 'block';
}

function displaySystemResults(data, iterations) {
    sysGraphManager.markRoot(data.solution.x, data.solution.y);

    let lastDeltaX = 0;
    let lastDeltaY = 0;
    if (iterations && iterations.length > 0) {
        const lastStep = iterations[iterations.length - 1].values;
        lastDeltaX = lastStep.deltaX || 0;
        lastDeltaY = lastStep.deltaY || 0;
    }

    document.getElementById('sysResultX').textContent = data.solution.x.toFixed(6);
    document.getElementById('sysResultY').textContent = data.solution.y.toFixed(6);
    document.getElementById('sysResultIterations').textContent = data.iterations;
    document.getElementById('sysResultDeltaX').textContent = lastDeltaX.toExponential(6);
    document.getElementById('sysResultDeltaY').textContent = lastDeltaY.toExponential(6);
    document.getElementById('sysResultF1').textContent = Functions.fSys1(data.solution.x, data.solution.y).toExponential(6);
    document.getElementById('sysResultF2').textContent = Functions.fSys2(data.solution.x, data.solution.y).toExponential(6);
    document.getElementById('sysResultsPanel').style.display = 'block';
}

function showStatus(elementId, message, type) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.className = 'status-message show ' + type;
}

const Functions = {
    fSys1: (x, y) => Math.sin(y) + 2 * x - 2.0,
    fSys2: (x, y) => y + Math.cos(x - 1.0) - 0.7
};