/**
 * Точка входа приложения
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📊 Initializing graphs...');

    const graphManager = new GraphManager();

    try {
        await graphManager.createMainGraph('calculator', {
            viewport: { xmin: -10, ymin: -200, xmax: 6, ymax: 200 }
        });
        console.log('✅ Graph initialized');

        graphManager.initDropdown('graphSelect', 'graph-description', 'graph-caption');
        window.graphManager = graphManager;
    } catch (e) {
        console.error('❌ Failed to initialize:', e);
        document.getElementById('plot-area').innerHTML =
            '<div style="color:red;padding:20px">⚠️ Ошибка загрузки графика. Проверьте консоль.</div>';
    }
});