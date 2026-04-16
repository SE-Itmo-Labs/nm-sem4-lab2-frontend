

function downloadResults(type) {
    let content = "=== РЕЗУЛЬТАТЫ ВЫЧИСЛЕНИЙ ===\n\n";

    if (type === 'eq') {
        const funcName = document.getElementById('eqGraphCaption').textContent;
        const root = document.getElementById('eqResultRoot').textContent;
        const fValue = document.getElementById('eqResultFValue').textContent;
        const iterations = document.getElementById('eqResultIterations').textContent;

        content += `Уравнение: ${funcName}\n`;
        content += `Корень x: ${root}\n`;
        content += `Значение f(x): ${fValue}\n`;
        content += `Итераций: ${iterations}\n`;

    } else if (type === 'sys') {
        const sysName = document.getElementById('sysGraphCaption').textContent;
        const rootX = document.getElementById('sysResultX').textContent;
        const rootY = document.getElementById('sysResultY').textContent;
        const iterations = document.getElementById('sysResultIterations').textContent;
        const deltaX = document.getElementById('sysResultDeltaX').textContent;
        const deltaY = document.getElementById('sysResultDeltaY').textContent;
        const f1 = document.getElementById('sysResultF1').textContent;
        const f2 = document.getElementById('sysResultF2').textContent;

        content += `Система: ${sysName}\n`;
        content += `Корень x: ${rootX}\n`;
        content += `Корень y: ${rootY}\n`;
        content += `Итераций: ${iterations}\n`;
        content += `Погрешность x: ${deltaX}\n`;
        content += `Погрешность y: ${deltaY}\n`;
        content += `F1(x*, y*): ${f1}\n`;
        content += `F2(x*, y*): ${f2}\n`;
    } else {
        console.error("Неизвестный тип для скачивания:", type);
        return;
    }

    content += "\n=============================\n";

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${type}.txt`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}