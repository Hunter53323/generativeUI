<template>
  <div class="task-details">
    <div class="progress-section">
      <h4>训练进度</h4>
      <el-progress 
        :percentage="task.progress"
        :status="getProgressStatus(task.status)"
      />
      <div class="metrics">
        <div class="metric-item">
          <span class="label">当前轮数:</span>
          <span class="value">45/100</span>
        </div>
        <div class="metric-item">
          <span class="label">Loss:</span>
          <span class="value">0.0234</span>
        </div>
        <div class="metric-item">
          <span class="label">Accuracy:</span>
          <span class="value">95.6%</span>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <h4>训练曲线</h4>
      <div ref="chartRef" class="train-chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chart = null

const getProgressStatus = (status) => {
  if (status === 'completed') return 'success'
  if (status === 'failed') return 'exception'
  if (status === 'stopped') return 'warning'
  return ''
}

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  const option = {
    title: {
      text: '训练指标',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Loss', 'Accuracy'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 100 }, (_, i) => i + 1)
    },
    yAxis: [
      {
        type: 'value',
        name: 'Loss',
        position: 'left'
      },
      {
        type: 'value',
        name: 'Accuracy',
        position: 'right',
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: 'Loss',
        type: 'line',
        data: Array.from({ length: 100 }, () => Math.random() * 2)
      },
      {
        name: 'Accuracy',
        type: 'line',
        yAxisIndex: 1,
        data: Array.from({ length: 100 }, () => Math.random() * 100)
      }
    ]
  }
  
  chart.setOption(option)
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  chart?.dispose()
})
</script>

<style scoped>
.task-details {
  padding: 20px;
}

.progress-section {
  margin: 24px 0;
}

.progress-section h4,
.chart-section h4 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #303133;
}

.metrics {
  margin-top: 16px;
  display: flex;
  gap: 24px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-item .label {
  color: #909399;
}

.metric-item .value {
  font-family: monospace;
  font-size: 16px;
  color: #303133;
}

.train-chart {
  height: 300px;
  margin-top: 16px;
}
</style> 