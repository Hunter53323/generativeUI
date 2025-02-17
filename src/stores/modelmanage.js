import { ref } from 'vue'

// 模型库数据
export const modelLibrary = ref([
  {
    id: 1,
    name: '生成式电机控制模型 V1.0',
    type: 'control',
    description: '基于生成式AI的电机控制模型',
    uploadTime: '2024-01-15 14:30:00',
    size: '2.5MB',
    author: '张工'
  },
  {
    id: 2,
    name: '生成式电机控制模型 V2.0',
    type: 'control',
    description: '改进版生成式电机控制模型',
    uploadTime: '2024-01-16 09:15:00',
    size: '3.1MB',
    author: '李工'
  }
])

// 已部署的模型库
export const deployedModels = ref([
  {
    id: 1,
    originalName: '生成式电机控制模型 V1.0',
    name: '生成式电机控制模型 V1.0_20240115143000',
    type: 'control',
    format: 'iec61499',
    server: 'server1',
    deployTime: '2024-01-15 14:30:00',
    downloadUrl: '/models/control_61499.fbt'
  }
])

// 当前选中的模型
export const selectedModel = ref(null)

// 验证状态
export const validationState = ref({
  hasValidated: false,
  hasEvaluated: false,
  validationResults: [
    { metric: '数据一致性', status: 'pending', details: '未验证' },
    { metric: '模型完整性', status: 'pending', details: '未验证' },
    { metric: '输入输出格式', status: 'pending', details: '未验证' }
  ],
  performanceData: {
    overshoot: 0,
    settlingTime: 0,
    steadyError: 0,
    responseTime: 0
  }
})

// 常量定义
export const modelTypes = [
  { value: 'control', label: '控制模型' },
  { value: 'diagnostic', label: '故障诊断' },
  { value: 'maintenance', label: '预测性维护' }
]

export const serverOptions = [
  { value: 'server1', label: '机架服务器1' },
  { value: 'server2', label: '机架服务器2' }
]

export const exportFormats = [
  { value: 'iec61499', label: 'IEC 61499' },
  { value: 'iec61131', label: 'IEC 61131' },
  { value: 'c', label: 'C文件' }
]

// 辅助函数
export const getRandomFloat = (base, range) => {
  return +(base + (Math.random() - 0.5) * range).toFixed(1)
}

// 添加新模型
export const addModel = (model) => {
  modelLibrary.value.push({
    id: Date.now(),
    ...model,
    uploadTime: new Date().toLocaleString(),
    size: '2.8MB',
    author: '当前用户'
  })
}

// 删除模型
export const deleteModel = (modelId) => {
  modelLibrary.value = modelLibrary.value.filter(m => m.id !== modelId)
  if (selectedModel.value?.id === modelId) {
    selectedModel.value = null
    validationState.value.hasValidated = false
    validationState.value.performanceData = {
      overshoot: 0,
      settlingTime: 0,
      steadyError: 0,
      responseTime: 0
    }
  }
}

// 部署状态
export const deploymentState = ref({
  isDeploying: false,
  startTime: null,
  progress: 0,
  timer: null
})

// 添加已部署模型
export const addDeployedModel = (model) => {
  deployedModels.value.push(model)
}

// 开始部署
export const startDeployment = () => {
  deploymentState.value.isDeploying = true
  deploymentState.value.startTime = Date.now()
  deploymentState.value.progress = 0
  
  // 每秒更新进度
  deploymentState.value.timer = setInterval(() => {
    const elapsed = Date.now() - deploymentState.value.startTime
    const progress = Math.min(Math.floor((elapsed / 60000) * 100), 100)
    deploymentState.value.progress = progress
    
    if (progress >= 100) {
      clearInterval(deploymentState.value.timer)
      deploymentState.value.isDeploying = false
      deploymentState.value.timer = null
    }
  }, 1000)
}

// 取消部署
export const cancelDeployment = () => {
  if (deploymentState.value.timer) {
    clearInterval(deploymentState.value.timer)
  }
  deploymentState.value.isDeploying = false
  deploymentState.value.progress = 0
  deploymentState.value.timer = null
}

// 更新验证状态和性能数据
export const updateValidationState = () => {
  validationState.value.hasValidated = true
  // 随机生成验证结果，70%概率通过验证
  validationState.value.validationResults = validationState.value.validationResults.map(item => {
    const isSuccess = Math.random() < 0.7
    return {
      metric: item.metric,
      status: isSuccess ? 'success' : 'warning',
      details: isSuccess ? '通过验证' : '需要调整'
    }
  })
  
  validationState.value.performanceData = {
    overshoot: getRandomFloat(4.5, 1),
    settlingTime: Math.round(getRandomFloat(150, 20)),
    steadyError: getRandomFloat(0.5, 0.2),
    responseTime: Math.round(getRandomFloat(50, 10))
  }
}

// 重置验证状态
export const resetValidationState = () => {
  validationState.value.hasValidated = false
  validationState.value.hasEvaluated = false
  validationState.value.validationResults = [
    { metric: '数据一致性', status: 'pending', details: '未验证' },
    { metric: '模型完整性', status: 'pending', details: '未验证' },
    { metric: '输入输出格式', status: 'pending', details: '未验证' }
  ]
  validationState.value.performanceData = {
    overshoot: 0,
    settlingTime: 0,
    steadyError: 0,
    responseTime: 0
  }
}

// 性能评估状态
export const performanceState = ref({
  isEvaluating: false,
  startTime: null,
  progress: 0,
  timer: null
})

// 开始性能评估
export const startPerformanceEvaluation = () => {
  performanceState.value.isEvaluating = true
  performanceState.value.startTime = Date.now()
  performanceState.value.progress = 0
  
  // 每秒更新进度
  performanceState.value.timer = setInterval(() => {
    const elapsed = Date.now() - performanceState.value.startTime
    const progress = Math.min(Math.floor((elapsed / 60000) * 100), 100)
    performanceState.value.progress = progress
    
    if (progress >= 100) {
      clearInterval(performanceState.value.timer)
      performanceState.value.isEvaluating = false
      performanceState.value.timer = null
    }
  }, 1000)
}

// 取消性能评估
export const cancelPerformanceEvaluation = () => {
  if (performanceState.value.timer) {
    clearInterval(performanceState.value.timer)
  }
  performanceState.value.isEvaluating = false
  performanceState.value.progress = 0
  performanceState.value.timer = null
} 