/**
 * Точка входа приложения
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing LabWork App v1.0...');

    const graphManager = new GraphManager();
    const formManager = new FormManager();

    try {
        // Инициализация графика
        await graphManager.createMainGraph('calculator', {
            viewport: { xmin: -3, ymin: -5, xmax: 3, ymax: 10 }
        });
        console.log('✅ Graph initialized');

        // Инициализация формы
        formManager.init(graphManager);

        // Сохраняем для отладки
        window.graphManager = graphManager;
        window.formManager = formManager;

    } catch (e) {
        console.error('❌ Failed to initialize:', e);
        document.getElementById('plot-area').innerHTML =
            '<div style="color:red;padding:20px">⚠️ Ошибка загрузки. Проверьте консоль.</div>';
    }
});

/**
 * Менеджер формы: валидация, сбор данных, отправка на API
 */
class FormManager {
    constructor() {
        this.form = null;
        this.graphManager = null;
        this.formData = {
            function: '',
            method: '',
            intervalA: null,
            intervalB: null,
            x0: null,
            y0: null,
            epsilon: 0.0001
        };
    }

    init(graphManager) {
        this.form = document.getElementById('calcForm');
        this.graphManager = graphManager;

        if (!this.form) {
            console.error('Form not found');
            return;
        }

        // Привязка событий
        this.bindEvents();

        // Инициализация выбора функции
        this.initFunctionSelector();
    }

    bindEvents() {
        // Отправка формы
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Сброс формы
        this.form.addEventListener('reset', () => {
            setTimeout(() => {
                this.hideStatus();
                this.hideResults();
            }, 100);
        });

        // Валидация числовых полей в реальном времени
        const numberInputs = document.querySelectorAll('.number-input');
        numberInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateNumberInput(e.target);
            });

            input.addEventListener('blur', (e) => {
                this.normalizeNumberInput(e.target);
            });
        });
    }

    initFunctionSelector() {
        const funcSelect = document.getElementById('functionSelect');
        if (!funcSelect) return;

        funcSelect.addEventListener('change', (e) => {
            const funcId = e.target.value;
            if (funcId && FUNCTIONS_CONFIG[funcId]) {
                this.graphManager.renderFunction(FUNCTIONS_CONFIG[funcId]);
                document.getElementById('graphCaption').textContent =
                    FUNCTIONS_CONFIG[funcId].name;
            }
        });
    }

    /**
     * Валидация числового поля
     */
    validateNumberInput(input) {
        let value = input.value;

        // Замена запятой на точку
        value = value.replace(',', '.');

        // Разрешаем только цифры, точку и минус в начале
        if (!/^[-+]?[0-9]*\.?[0-9]{0,4}$/.test(value) && value !== '') {
            input.classList.add('error');
            return false;
        }

        input.classList.remove('error');
        input.value = value;
        return true;
    }

    /**
     * Нормализация числа (округление до 4 знаков)
     */
    normalizeNumberInput(input) {
        let value = input.value.trim();
        if (!value) return;

        // Замена запятой
        value = value.replace(',', '.');

        // Парсинг числа
        const num = parseFloat(value);
        if (isNaN(num)) {
            input.classList.add('error');
            return;
        }

        // Округление до 4 знаков
        input.value = num.toFixed(4).replace(/\.?0+$/, '');
    }

    /**
     * Сбор данных из формы
     */
    collectFormData() {
        const data = {
            function: document.getElementById('functionSelect').value,
            method: document.getElementById('methodSelect').value,
            intervalA: this.parseNumber(document.getElementById('intervalA').value),
            intervalB: this.parseNumber(document.getElementById('intervalB').value),
            x0: this.parseNumber(document.getElementById('x0Input').value),
            y0: this.parseNumber(document.getElementById('y0Input').value),
            epsilon: this.parseNumber(document.getElementById('epsilonInput').value) || 0.0001
        };

        return data;
    }

    /**
     * Парсинг числа (запятая -> точка)
     */
    parseNumber(value) {
        if (!value || value.trim() === '') return null;
        const normalized = value.replace(',', '.');
        const num = parseFloat(normalized);
        return isNaN(num) ? null : num;
    }

    /**
     * Обработка отправки формы
     */
    async handleSubmit() {
        // Очистить старую точку корня перед новым расчетом
        if (this.graphManager) {
            this.graphManager.clearRootMarker();
        }

        // ✅ СОБРАТЬ ДАННЫЕ ИЗ ФОРМЫ
        const data = this.collectFormData();

        // Валидация
        if (!this.validateData(data)) {
            return;
        }

        // Сохранение
        this.formData = data;

        // Отправка на API
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
            console.error('API Error:', error);

            // 🔥 Обработка сетевых ошибок (CORS, нет интернета, неверный URL)
            if (error.message.includes('Failed to fetch')) {
                this.showStatus('❌ Не удалось соединиться с сервером. Проверьте интернет или CORS.', 'error');
            } else {
                this.showStatus(`❌ Ошибка: ${error.message}`, 'error');
            }
        }
    }

    /**
     * Валидация данных
     */
    validateData(data) {
        // Проверка функции
        if (!data.function) {
            this.showStatus('⚠️ Выберите функцию', 'error');
            return false;
        }

        // Проверка метода
        if (!data.method) {
            this.showStatus('⚠️ Выберите метод решения', 'error');
            return false;
        }

        // Проверка интервала
        if (data.intervalA === null || data.intervalB === null) {
            this.showStatus('⚠️ Введите границы интервала [a, b]', 'error');
            return false;
        }

        if (data.intervalA >= data.intervalB) {
            this.showStatus('⚠️ Левая граница должна быть меньше правой', 'error');
            return false;
        }

        // Проверка точности
        if (data.epsilon <= 0 || data.epsilon > 1) {
            this.showStatus('⚠️ Точность должна быть в диапазоне (0, 1]', 'error');
            return false;
        }

        return true;
    }

    /**
     * Отправка данных на реальный API бэкенда
     */
    async sendToAPI(data) {
        // ✅ URL твоего задеплоенного бэкенда
        const API_URL = 'https://itmo.ssngn.ru/lab5/api/calculate';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
                // Важно для CORS с кукими/авторизацией (если понадобится)
                mode: 'cors',
                credentials: 'omit'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            // ✅ Бэкенд возвращает {success: true, data: {...}}
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data
                };
            } else {
                // Обработка ошибки от бэкенда
                return {
                    success: false,
                    error: result.error || 'Неизвестная ошибка сервера'
                };
            }

        } catch (error) {
            console.error('API Error:', error);
            throw error; // Пробрасываем ошибку выше для обработки в handleSubmit
        }
    }

    displayResults(data) {
        console.log('📊 displayResults вызван с данными:', data);

        // ... обновление UI ...

        if (this.graphManager && data.root !== undefined) {
            const x = data.root;
            const y = data.fValue ?? 0;

            console.log('📍 Вызов markRoot:', { x, y });
            console.log('🔧 Состояние графика:', {
                calculator: !!this.graphManager.mainGraph?.calculator,
                rootIds: this.graphManager.rootExpressionIds
            });

            this.graphManager.markRoot(x, y);
        }
    }


    /**
     * Показать статус
     */
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('formStatus');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = `status-message show ${type}`;
    }

    /**
     * Скрыть статус
     */
    hideStatus() {
        const statusEl = document.getElementById('formStatus');
        if (statusEl) {
            statusEl.className = 'status-message';
        }
    }

    /**
     * Скрыть результаты
     */
    hideResults() {
        const panel = document.getElementById('resultsPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
}