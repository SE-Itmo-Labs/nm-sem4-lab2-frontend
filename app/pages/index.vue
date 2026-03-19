<template>
  <main class="container">
    <h1>📈 Построение графиков функций</h1>
    <FunctionChart
        title="График функции"
        :default-function-index="2"
        :default-x-min="-4"
        :default-x-max="3"
        :default-y-min="-5"
        :default-y-max="5"
    />
  </main>
</template>

<script setup>
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 40px;
}
</style>