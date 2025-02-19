<template>
  <div class="task-details">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="任务ID">{{ task.id }}</el-descriptions-item>
      <el-descriptions-item label="任务名称">{{ task.name }}</el-descriptions-item>
      <el-descriptions-item label="模型类型">{{ getModelTypeLabel(task.modelType) }}</el-descriptions-item>
      <el-descriptions-item label="训练数据集">{{ task.dataset }}</el-descriptions-item>
      <el-descriptions-item label="训练服务器">{{ serverManager.getServerById(task.server)?.name }}</el-descriptions-item>
      <el-descriptions-item label="当前状态">
        <el-tag :type="getStatusType(task.status)">{{ task.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="训练进度">
        <el-progress :percentage="task.progress" />
      </el-descriptions-item>
    </el-descriptions>

    <!-- 训练指标 -->
    <div class="metrics-section">
      <h4>训练指标</h4>
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="label">当前轮数</span>
          <span class="value">{{ Math.floor(task.progress / 100 * maxEpochs) }} / {{ maxEpochs }}</span>
        </div>
        <div class="metric-item">
          <span class="label">训练Loss</span>
          <span class="value">{{ currentLoss.toFixed(6) }}</span>
        </div>
        <div class="metric-item">
          <span class="label">验证Loss</span>
          <span class="value">{{ validationLoss.toFixed(6) }}</span>
        </div>
        <div class="metric-item">
          <span class="label">准确率</span>
          <span class="value">{{ (accuracy * 100).toFixed(4) }}%</span>
        </div>
      </div>
    </div>

    <!-- 训练曲线 -->
    <div class="chart-section">
      <h4>训练曲线</h4>
      <div class="chart-container" ref="chartRef"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useServerManagerStore } from '@/stores/serverManager'
import * as echarts from 'echarts'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const serverManager = useServerManagerStore()
const chartRef = ref(null)
let chart = null

// 训练参数
const maxEpochs = 100
const currentLoss = ref(2.0)
const validationLoss = ref(2.0)
const accuracy = ref(0.5)
const lossHistory = ref([])
const valLossHistory = ref([])
const epochs = ref([])

// 根据任务ID生成随机种子
const getRandomSeed = (taskId) => {
  // 从任务ID中提取数字部分作为种子
  const numericId = parseInt(taskId.replace('TRAIN', ''))
  return (numericId % 10000) / 10000
}

// 添加一个计算noise scale的辅助函数
const calculateNoiseScale = (epoch, isValidation = false) => {
  const baseScale = isValidation ? 0.4 : 0.3
  const minScale = isValidation ? 0.002 : 0.001
  
  if (epoch < 30) {
    return baseScale
  } else if (epoch >= 70) {
    return minScale
  } else {
    // 30-70轮之间线性过渡
    const progress = (epoch - 30) / 40  // 40是过渡区间的长度
    return baseScale - (baseScale - minScale) * progress
  }
}

// 修改初始化或重置图表数据
const resetChartData = () => {
  epochs.value = []
  lossHistory.value = []
  valLossHistory.value = []
  currentLoss.value = 2.5 + (Math.random() - 0.5) * 0.5  // 初始值在2.25-2.75之间
  validationLoss.value = currentLoss.value + 0.3 + Math.random() * 0.2  // 比训练loss高0.3-0.5
  accuracy.value = 0.5
}

// 修改生成完成状态的训练曲线数据
const generateCompletedTrainingData = () => {
  const seed = getRandomSeed(props.task.id)
  epochs.value = Array.from({ length: maxEpochs }, (_, i) => i + 1)
  
  // 生成训练Loss曲线
  const finalLoss = 0.0001 + seed * 0.0001
  const decayRate = 15 + seed * 5
  
  // 确保初始loss在2.5左右
  lossHistory.value = epochs.value.map(epoch => {
    const progress = epoch / maxEpochs
    let loss
    
    if (epoch === 0) {
      // 第一个epoch的loss固定在2.5左右
      loss = 2.5 + (Math.random() - 0.5) * 0.5
    } else {
      // 后续epochs的loss
      const baseLoss = 2.5 * Math.exp(-decayRate * progress) + finalLoss
      
      // 45轮之后波动几乎为0
      const noiseScale = calculateNoiseScale(epoch)
      const noise = (Math.random() - 0.5) * noiseScale
      loss = Math.max(baseLoss + noise, 0.0001)
    }
    return loss
  })
  
  // 生成验证Loss曲线
  valLossHistory.value = lossHistory.value.map((loss, epoch) => {
    const progress = epoch / maxEpochs
    let valLoss
    
    if (epoch === 0) {
      // 第一个epoch的验证loss比训练loss高0.3-0.5
      valLoss = loss + 0.3 + Math.random() * 0.2
    } else {
      // 45轮之后波动几乎为0
      const noiseScale = calculateNoiseScale(epoch, true)
      const noise = (Math.random() - 0.5) * noiseScale
      
      // gap也随着epoch逐渐减小
      const gap = epoch < 30 
        ? 0.3 * (1 - progress * 0.8)
        : epoch >= 70 
          ? 0.01
          : 0.3 * (1 - progress * 0.8) * (1 - (epoch - 30) / 40) + 0.01
      
      valLoss = Math.max(loss + gap + noise, 0.0002)
    }
    return valLoss
  })
  
  currentLoss.value = lossHistory.value[lossHistory.value.length - 1]
  validationLoss.value = valLossHistory.value[valLossHistory.value.length - 1]
  accuracy.value = 0.97 + (seed * 0.02)
}

// 修改更新训练指标的函数
const updateMetrics = () => {
  if (props.task.status === 'running') {
    const progress = props.task.progress / 100
    const seed = getRandomSeed(props.task.id)
    const decayRate = 15 + seed * 5
    const finalLoss = 0.0001 + seed * 0.0001
    const currentEpoch = Math.floor(progress * maxEpochs)
    
    let newLoss
    if (currentEpoch === 0) {
      // 第一个epoch保持在2.5左右
      newLoss = 2.5 + (Math.random() - 0.5) * 0.5
    } else {
      const baseLoss = 2.5 * Math.exp(-decayRate * progress) + finalLoss
      
      // 45轮之后波动几乎为0
      const noiseScale = calculateNoiseScale(currentEpoch)
      const noise = (Math.random() - 0.5) * noiseScale
      newLoss = Math.max(baseLoss + noise, 0.0001)
    }
    
    let newValLoss
    if (currentEpoch === 0) {
      // 第一个epoch的验证loss比训练loss高0.3-0.5
      newValLoss = newLoss + 0.3 + Math.random() * 0.2
    } else {
      // 45轮之后波动几乎为0
      const noiseScale = calculateNoiseScale(currentEpoch, true)
      const noise = (Math.random() - 0.5) * noiseScale
      
      // gap也随着epoch逐渐减小
      const gap = currentEpoch < 30 
        ? 0.3 * (1 - progress * 0.8)
        : currentEpoch >= 70 
          ? 0.01
          : 0.3 * (1 - progress * 0.8) * (1 - (currentEpoch - 30) / 40) + 0.01
      
      newValLoss = Math.max(newLoss + gap + noise, 0.0002)
    }
    
    currentLoss.value = newLoss
    validationLoss.value = newValLoss
    accuracy.value = 0.7 + (0.27 + seed * 0.02) * (1 - Math.exp(-8 * progress))
    
    if (currentEpoch > epochs.value.length) {
      epochs.value.push(currentEpoch)
      lossHistory.value.push(newLoss)
      valLossHistory.value.push(newValLoss)
      updateChart()
    }
  }
}

// 修改监听任务变化的逻辑
watch(() => props.task, (newTask) => {
  resetChartData()  // 重置数据
  nextTick(() => {
    if (chart) {
      chart.dispose()  // 销毁旧图表
      chart = null
    }
    // 确保DOM已更新后再初始化图表
    nextTick(() => {
      initChart()  // 重新初始化图表
      if (newTask.status === 'completed') {
        generateCompletedTrainingData()
        updateChart()
      } else if (newTask.status === 'running') {
        updateMetrics()
      }
    })
  })
}, { deep: true })

// 修改图表初始化函数
const initChart = () => {
  if (!chartRef.value) return
  
  // 确保DOM已经准备好
  chart = echarts.init(chartRef.value)
  const option = {
    title: {
      text: '训练损失曲线',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return params.map(param => {
          return `${param.seriesName}: ${param.value.toFixed(6)}`
        }).join('<br/>')
      }
    },
    legend: {
      data: ['训练Loss', '验证Loss'],
      top: 30
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '5%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      name: '轮数',
      data: epochs.value,
      nameLocation: 'middle',
      nameGap: 25
    },
    yAxis: {
      type: 'value',
      name: 'Loss',
      nameLocation: 'middle',
      nameGap: 40,
      min: 0,
      max: 3.0,  // 增加最大值以显示更高的初始loss
      axisLabel: {
        formatter: val => val.toFixed(4)
      }
    },
    series: [
      {
        name: '训练Loss',
        type: 'line',
        data: lossHistory.value,
        smooth: false,
        showSymbol: false,
        lineStyle: {
          width: 2
        }
      },
      {
        name: '验证Loss',
        type: 'line',
        data: valLossHistory.value,
        smooth: false,
        showSymbol: false,
        lineStyle: {
          width: 2
        }
      }
    ]
  }
  chart.setOption(option)
  // 立即触发一次resize
  chart.resize()
}

// 修改图表更新函数
const updateChart = () => {
  if (!chart) {
    initChart()
    return
  }
  
  nextTick(() => {
    chart.setOption({
      xAxis: {
        data: epochs.value
      },
      series: [
        {
          name: '训练Loss',
          data: lossHistory.value
        },
        {
          name: '验证Loss',
          data: valLossHistory.value
        }
      ]
    })
  })
}

// 修改组件挂载时的初始化逻辑
onMounted(() => {
  // 确保DOM已经渲染完成
  nextTick(() => {
    initChart()
    if (props.task.status === 'completed') {
      generateCompletedTrainingData()
      updateChart()
    } else if (props.task.status === 'running') {
      updateMetrics()
    }
  })
})

// 修改组件卸载时的清理逻辑
onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
  // 移除resize事件监听
  window.removeEventListener('resize', () => {
    if (chart) {
      chart.resize()
    }
  })
})

const getModelTypeLabel = (type) => {
  const typeMap = {
    'generative': '生成式模型',
    'neural_network': '神经网络模型',
    'reinforcement': '强化学习模型'
  }
  return typeMap[type] || type
}

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'info',
    'running': 'primary',
    'completed': 'success',
    'failed': 'danger',
    'stopped': 'warning'
  }
  return statusMap[status] || 'info'
}
</script>

<style scoped>
.task-details {
  padding: 20px;
}

.metrics-section {
  margin-top: 24px;
}

.metrics-section h4 {
  margin-bottom: 16px;
  color: #606266;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-item {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-item .label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.metric-item .value {
  color: #303133;
  font-size: 20px;
  font-weight: bold;
}

.chart-section {
  margin-top: 24px;
  width: 100%;
  min-height: 450px;
}

.chart-section h4 {
  margin-bottom: 16px;
  color: #606266;
}

.chart-container {
  height: 400px;
  width: 100%;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
</style> 