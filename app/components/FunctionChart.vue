<template>
  <div class="function-chart">
    <h3>{{ title }}</h3>

    <div class="controls">
      <select v-model="selectedFunctionIndex" @change="updateChart">
        <option v-for="(func, i) in functions" :key="i" :value="i">
          {{ func.label }}
        </option>
      </select>

      <label>X:
        <input type="number" v-model.number="xMin" @change="updateChart" />
        до
        <input type="number" v-model.number="xMax" @change="updateChart" />
      </label>
    </div>

    <canvas ref="canvasRef" class="chart-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  title: { type: String, default: 'График функции' }
})

const canvasRef = ref(null)
const chartRef = ref(null)
const selectedFunctionIndex = ref(0)
const xMin = ref(-5)
const xMax = ref(5)

const functions = [
  { label: 'y = x³ + 1.46x² - 3.4x + 1', fn: (x) => x**3 + 1.46*x**2 - 3.4*x + 1 },
  { label: 'y = 2x⁴ - 0.46x³ - 3.9x² + 0.3', fn: (x) => 2*x**4 - 0.46*x**3 - 3.9*x**2 + 0.3 },
  { label: 'y = 0.7 - cos(x-1)', fn: (x) => 0.7 - Math.cos(x - 1) },
  { label: 'y = log(x²)', fn: (x) => x !== 0 ? Math.log10(x*x) : null },
  { label: 'y = 2^(3x) - 3', fn: (x) => 2**(3*x) - 3 },
  { label: 'y = x²', fn: (x) => x*x },
  { label: 'y = sin(x)', fn: (x) => Math.sin(x) },
  { label: 'y = cos(x)', fn: (x) => Math.cos(x) }
]

const generateData = () => {
  const points = []
  const step = (xMax.value - xMin.value) / 500

  for (let i = 0; i <= 500; i++) {
    const x = xMin.value + i * step
    const y = functions[selectedFunctionIndex.value].fn(x)
    if (y !== null && isFinite(y)) {
      points.push({ x, y })
    }
  }
  return points
}

const createChart = () => {
  if (chartRef.value) {
    chartRef.value.destroy()
  }

  const ctx = canvasRef.value.getContext('2d')
  chartRef.value = new Chart(ctx, {
    type: 'scatter',
  {
    datasets: [{
      data: generateData(),
      borderColor: '#2196F3',
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      showLine: true,
      fill: false,
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
        maintainAspectRatio: false,
        plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `x: ${ctx.parsed.x.toFixed(3)}, y: ${ctx.parsed.y.toFixed(3)}`
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
            position: 'center',
            min: xMin.value,
            max: xMax.value,
            grid: { color: 'rgba(0,0,0,0.1)' },
        ticks: { callback: (v) => v.toFixed(1) }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.1)' },
        ticks: { callback: (v) => v.toFixed(1) }
      }
    }
  }
})
}

const updateChart = () => {
  if (chartRef.value) {
    chartRef.value.data.datasets[0].data = generateData()
    chartRef.value.options.scales.x.min = xMin.value
    chartRef.value.options.scales.x.max = xMax.value
    chartRef.value.update()
  }
}

onMounted(() => {
  if (canvasRef.value) {
    createChart()
  }
})

watch(selectedFunctionIndex, updateChart)
</script>

<style scoped>
.function-chart {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

h3 {
  text-align: center;
  margin-bottom: 15px;
  color: #2c3e50;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

select, input {
  padding: 8px 12px;
  border: 1.5px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

select {
  min-width: 300px;
  border-color: #2196F3;
}

.chart-canvas {
  width: 100%;
  height: 500px;
}
</style>