document.addEventListener('DOMContentLoaded', async function() {
    const graphManager = new GraphManager();
    const formManager = new FormManager();

    try {
        await graphManager.createMainGraph('calculator', {
            viewport: { xmin: -3, ymin: -5, xmax: 3, ymax: 10 }
        });
        formManager.init(graphManager);

        window.graphManager = graphManager;
        window.formManager = formManager;
    } catch (e) {
        console.error('Initialization failed:', e);
        document.getElementById('plot-area').innerHTML =
            '<div style="color:red;padding:20px">Ошибка загрузки. Проверьте консоль.</div>';
    }
});

class FormManager {
    constructor() {
        this.form = null;
        this.graphManager = null;
        this.formData = { function: '', method: '', intervalA: null, intervalB: null, x0: null, y0: null, epsilon: 0.0001 };
    }

    init(graphManager) {
        this.form = document.getElementById('calcForm');
        this.graphManager = graphManager;
        if (!this.form) return;

        this.form.addEventListener('submit', e => { e.preventDefault(); this.handleSubmit(); });
        this.form.addEventListener('reset', () => { setTimeout(() => { this.hideStatus(); this.hideResults(); }, 100); });

        document.querySelectorAll('.number-input').forEach(input => {
            input.addEventListener('input', e => this.validateNumberInput(e.target));
            input.addEventListener('blur', e => this.normalizeNumberInput(e.target));
        });

        const funcSelect = document.getElementById('functionSelect');
        if (funcSelect) {
            funcSelect.addEventListener('change', e => {
                const funcId = e.target.value;
                if (funcId && FUNCTIONS_CONFIG[funcId]) {
                    this.graphManager.renderFunction(FUNCTIONS_CONFIG[funcId]);
                    document.getElementById('graphCaption').textContent = FUNCTIONS_CONFIG[funcId].name;
                }
            });
        }
    }

    validateNumberInput(input) {
        let value = input.value.replace(',', '.');
        if (!/^[-+]?[0-9]*\.?[0-9]{0,4}$/.test(value) && value !== '') {
            input.classList.add('error');
            return false;
        }
        input.classList.remove('error');
        input.value = value;
        return true;
    }

    normalizeNumberInput(input) {
        let value = input.value.trim();
        if (!value) return;
        value = value.replace(',', '.');
        const num = parseFloat(value);
        if (isNaN(num)) return input.classList.add('error');
        input.value = num.toFixed(4).replace(/\.?0+$/, '');
    }

    collectFormData() {
        return {
            function: document.getElementById('functionSelect').value,
            method: document.getElementById('methodSelect').value,
            intervalA: this.parseNumber(document.getElementById('intervalA').value),
            intervalB: this.parseNumber(document.getElementById('intervalB').value),
            x0: this.parseNumber(document.getElementById('x0Input').value),
            y0: this.parseNumber(document.getElementById('y0Input').value),
            epsilon: this.parseNumber(document.getElementById('epsilonInput').value) || 0.0001
        };
    }

    parseNumber(value) {
        if (!value || value.trim() === '') return null;
        const num = parseFloat(value.replace(',', '.'));
        return isNaN(num) ? null : num;
    }

    async handleSubmit() {
        if (this.graphManager) this.graphManager.clearRootMarker();
        const data = this.collectFormData();
        if (!this.validateData(data)) return;

        this.formData = data;
        try {
            this.showStatus('🔄 Отправка данных на сервер...', 'info');
            const result = await this.sendToAPI(data);
            if (result.success) {
                this.showStatus('✅ Расчёт завершён успешно!', 'success');
                this.displayResults(result.data);
            } else {
                this.showStatus(`❌ Ошибка: ${result.error}`, 'error');
            }
        } catch (error) {
            const msg = error.message.includes('Failed to fetch')
                ? 'Не удалось соединиться с сервером. Проверьте интернет или CORS.'
                : `Ошибка: ${error.message}`;
            this.showStatus(msg, 'error');
        }
    }

    validateData(data) {
        if (!data.function) return this.showStatus('Выберите функцию', 'error'), false;
        if (!data.method) return this.showStatus('Выберите метод решения', 'error'), false;
        if (data.intervalA === null || data.intervalB === null) return this.showStatus('Введите границы интервала [a, b]', 'error'), false;
        if (data.intervalA >= data.intervalB) return this.showStatus('Левая граница должна быть меньше правой', 'error'), false;

        if (data.epsilon < 0.0001 || data.epsilon > 0.9999) {
            return this.showStatus('Точность должна быть в диапазоне [0.0001; 0.9999]', 'error'), false;
        }
        return true;
    }

    async sendToAPI(data) {
        const API_URL = 'https://itmo.ssngn.ru/lab5/api/calculate';
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data),
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        if (result.success && result.data) return { success: true, data: result.data };
        return { success: false, error: result.error || 'Неизвестная ошибка сервера' };
    }

    displayResults(data) {
        if (this.graphManager && data.root !== undefined) {
            this.graphManager.markRoot(data.root, data.fValue ?? 0);
        }
    }

    showStatus(message, type = 'info') {
        const el = document.getElementById('formStatus');
        if (el) { el.textContent = message; el.className = `status-message show ${type}`; }
    }

    hideStatus() {
        const el = document.getElementById('formStatus');
        if (el) el.className = 'status-message';
    }

    hideResults() {
        const panel = document.getElementById('resultsPanel');
        if (panel) panel.style.display = 'none';
    }
}