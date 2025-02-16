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

const getParamConfig = (paramKey) => {
  const deviceConfig = DEVICE_PARAMS_CONFIG[props.device.type]
  return deviceConfig.controlParams.find(p => p.key === paramKey)
}

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
  
  // 按秒聚合数据
  const aggregatedData = {}
  history.forEach(item => {
    const second = Math.floor(item.timestamp / 1000) * 1000
    if (!aggregatedData[second]) {
      aggregatedData[second] = {
        count: 0,
        values: {}
      }
    }
    
    deviceConfig.chartParams.forEach(paramKey => {
      if (!aggregatedData[second].values[paramKey]) {
        aggregatedData[second].values[paramKey] = 0
      }
      aggregatedData[second].values[paramKey] += item.values[paramKey]
    })
    aggregatedData[second].count++
  })

  // 计算每秒平均值
  const timePoints = Object.keys(aggregatedData).sort()
  const series = deviceConfig.chartParams.map(paramKey => {
    const paramConfig = getParamConfig(paramKey)
    return {
      name: `${paramConfig.label}(${paramConfig.unit})`,
      type: 'line',
      smooth: true,
      data: timePoints.map(time => [
        Number(time),
        aggregatedData[time].values[paramKey] / aggregatedData[time].count
      ])
    }
  })

  const option = {
    title: {
      text: '运行参数图表'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const time = new Date(params[0].value[0]).toLocaleTimeString()
        let result = `${time}<br/>`
        params.forEach(param => {
          result += `${param.seriesName}: ${param.value[1].toFixed(2)}<br/>`
        })
        return result
      }
    },
    legend: {
      data: deviceConfig.chartParams.map(paramKey => {
        const paramConfig = getParamConfig(paramKey)
        return `${paramConfig.label}(${paramConfig.unit})`
      })
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: [
      {
        type: 'value',
        name: '转速(RPM)',
        splitLine: { show: true },
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '其他参数',
        splitLine: { show: false },
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: series.map(s => ({
      ...s,
      yAxisIndex: s.name.includes('转速') ? 0 : 1
    }))
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