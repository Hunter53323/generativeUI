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

// 限制显示最近2分钟的数据，每秒一个数据点
const TIME_WINDOW = 2 * 60 * 1000 // 2分钟
const DATA_INTERVAL = 1000 // 1秒

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
  
  // 只保留最近2分钟的数据
  const currentTime = Date.now()
  const cutoffTime = currentTime - TIME_WINDOW
  const recentHistory = history.filter(item => item.timestamp >= cutoffTime)

  // 按秒聚合数据
  const aggregatedData = {}
  recentHistory.forEach(item => {
    const second = Math.floor(item.timestamp / DATA_INTERVAL) * DATA_INTERVAL
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
      aggregatedData[second].values[paramKey] += Number(item.values[paramKey] || 0)
    })
    aggregatedData[second].count++
  })

  // 计算每秒平均值
  const timePoints = Object.keys(aggregatedData).sort()
  const series = deviceConfig.chartParams.map(paramKey => {
    const paramConfig = getParamConfig(paramKey)
    return {
      name: paramConfig.label,
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: timePoints.map(time => [
        Number(time),
        Number((aggregatedData[time].values[paramKey] / aggregatedData[time].count).toFixed(2))
      ])
    }
  })

  const option = {
    title: {
      text: '运行参数',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const time = new Date(params[0].value[0]).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        let result = `${time}<br/>`
        params.forEach(param => {
          const paramConfig = getParamConfig(deviceConfig.chartParams[param.seriesIndex])
          result += `${param.seriesName}: ${param.value[1]} ${paramConfig.unit || ''}<br/>`
        })
        return result
      }
    },
    legend: {
      data: deviceConfig.chartParams.map(paramKey => getParamConfig(paramKey).label),
      top: 30
    },
    grid: {
      top: 70,
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      boundaryGap: false,
      axisLabel: {
        formatter: (value) => {
          return new Date(value).toLocaleTimeString('zh-CN', {
            minute: '2-digit',
            second: '2-digit'
          })
        }
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
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
  height: 300px;
  width: 100%;
  background-color: #fff;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
}
</style> 