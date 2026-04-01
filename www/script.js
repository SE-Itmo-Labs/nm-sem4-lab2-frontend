document.addEventListener('DOMContentLoaded', function() {
    var elt = document.getElementById('calculator');

    var calculator = Desmos.GraphingCalculator(elt, {
        expressions: false,           // Скрыть панель выражений
        settingsMenu: false,          // Скрыть меню настроек
        zoomButtons: false,           // Скрыть кнопки зума
        trace: false,                 // Отключить трассировку
        showGrid: true,               // Показать сетку
        showXAxis: true,              // Показать ось X
        showYAxis: true,              // Показать ось Y
        xAxisNumbers: true,           // Показать числа на оси X
        yAxisNumbers: true,           // Показать числа на оси Y
        lockedViewport: false,        // Разрешить перемещение (можно поставить true для полной блокировки)
        allowUndo: false,             // Отключить отмену действий
        border: false,                // Убрать рамку
        // Установить начальный вид
        viewport: {
            xmin: -10,
            ymin: -200,
            xmax: 6,
            ymax: 200
        }
    });

    // Добавляем функцию для отображения
    calculator.setExpression({
        id: 'func1',
        latex: 'f(x) = x^3 + 4.81x^2 - 17.37x + 5.38',
        color: Desmos.Colors[0]
    });

    // Добавляем оси координат для наглядности
    calculator.setExpression({
        id: 'xaxis',
        latex: 'y = 0',
        color: '#000000',
        lineStyle: Desmos.LineStyle.SOLID,
        lineWidth: 2
    });

    calculator.setExpression({
        id: 'yaxis',
        latex: 'x = 0',
        color: '#000000',
        lineStyle: Desmos.LineStyle.SOLID,
        lineWidth: 2
    });

    // Отмечаем интервалы изоляции корней
    calculator.setExpression({
        id: 'root1',
        latex: 'x = -7.291',
        color: Desmos.Colors[1],
        lineStyle: Desmos.LineStyle.DASHED
    });

    calculator.setExpression({
        id: 'root2',
        latex: 'x = 0.345',
        color: Desmos.Colors[2],
        lineStyle: Desmos.LineStyle.DASHED
    });

    calculator.setExpression({
        id: 'root3',
        latex: 'x = 2.136',
        color: Desmos.Colors[3],
        lineStyle: Desmos.LineStyle.DASHED
    });
});