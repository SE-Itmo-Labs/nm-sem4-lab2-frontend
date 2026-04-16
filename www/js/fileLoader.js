// www/js/fileLoader.js

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('jsonFileInput');
    if (!fileInput) return;

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                populateFormFromJson(data);
                showFileStatus('Файл успешно загружен!', '#00aa00'); // Зеленый
            } catch (err) {
                console.error(err);
                showFileStatus('Ошибка: неверный формат JSON', '#ff0000'); // Красный
            }
        };
        
        reader.onerror = function() {
            showFileStatus('Ошибка при чтении файла', '#ff0000');
        };
        
        reader.readAsText(file);


        event.target.value = '';
    });
});

function populateFormFromJson(data) {
    if (!data || !data.type) {
        throw new Error('Отсутствует обязательное поле "type" (eq или sys)');
    }

    if (data.type === 'eq') {

        switchTab('equations');


        if (data.function) {
            const funcSelect = document.getElementById('eqFunctionSelect');
            funcSelect.value = data.function;
            funcSelect.dispatchEvent(new Event('change'));
        }
        
        if (data.method) document.getElementById('eqMethodSelect').value = data.method;
        if (data.intervalA !== undefined) document.getElementById('eqIntervalA').value = data.intervalA;
        if (data.intervalB !== undefined) document.getElementById('eqIntervalB').value = data.intervalB;
        if (data.x0 !== undefined) document.getElementById('eqX0Input').value = data.x0;
        if (data.epsilon !== undefined) document.getElementById('eqEpsilonInput').value = data.epsilon;

    } else if (data.type === 'sys') {

        switchTab('systems');


        if (data.function) {
            const sysSelect = document.getElementById('sysSelect');
            sysSelect.value = data.function;
            sysSelect.dispatchEvent(new Event('change'));
        }
        
        if (data.x0 !== undefined) document.getElementById('sysX0Input').value = data.x0;
        if (data.y0 !== undefined) document.getElementById('sysY0Input').value = data.y0;
        if (data.epsilon !== undefined) document.getElementById('sysEpsilonInput').value = data.epsilon;
        
    } else {
        throw new Error(`Неизвестный тип: ${data.type}`);
    }
}

function showFileStatus(msg, color) {
    const statusEl = document.getElementById('fileLoadStatus');
    if (statusEl) {
        statusEl.textContent = msg;
        statusEl.style.color = color;

        
        setTimeout(() => { statusEl.textContent = ''; }, 3000);
    }
}