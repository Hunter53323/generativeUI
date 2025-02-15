<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { DEVICE_PARAMS_CONFIG } from '@/constants/deviceControl'
import { useDeviceControlStore } from '@/stores/deviceControl'
import * as echarts from 'echarts'

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const deviceControlStore = useDeviceControlStore()
const chartInstance = ref(null)

const initChart = () => {
  const chartDom = document.getElementById(`deviceChart-${props.device.id}`)
  if (!chartDom) return
  
  chartInstance.value = echarts.init(chartDom)
  updateChart()
}

const updateChart = () => {
  if (!chartInstance.value) return

  const deviceConfig = DEVICE_PARAMS_CONFIG[props.device.type]
  const history = deviceControlStore.getDeviceHistory(props.device.id)
  
  const series = deviceConfig.chartParams.map(paramKey => {
    const param = deviceConfig.controlParams.find(p => p.key === paramKey)
    return {
      name: param.label,
      type: 'line',
      smooth: true,
      data: history.map(item => [
        item.timestamp,
        item.values[paramKey]
      ])
    }
  })

  const option = {
    title: {
      text: '实时运行参数'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: deviceConfig.chartParams.map(paramKey => 
        deviceConfig.controlParams.find(p => p.key === paramKey).label
      )
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series
  }

  chartInstance.value.setOption(option)
}

// 监听数据变化更新图表
watch(
  () => deviceControlStore.getDeviceHistory(props.device.id),
  () => updateChart(),
  { deep: true }
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chartInstance.value?.resize())
})

onUnmounted(() => {
  chartInstance.value?.dispose()
  window.removeEventListener('resize', () => chartInstance.value?.resize())
})
</script>

<template>
  <div :id="`deviceChart-${device.id}`" class="chart-container"></div>
</template>

<style scoped>
.chart-container {
  height: 400px;
  width: 100%;
}
</style> 