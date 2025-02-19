import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export const useServerManagerStore = defineStore('serverManager', () => {
  // 服务器列表
  const servers = ref([])
  
  // 服务器状态类型
  const SERVER_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    MAINTENANCE: 'maintenance'
  }

  // 服务器工作状态
  const WORK_STATUS = {
    IDLE: '空闲',      // 空闲
    TRAINING: '训练中', // 训练中
    DEPLOYING: '摊销中' // 摊销中
  }

  // 服务器类型
  const SERVER_TYPES = {
    GPU: 'gpu',
    CPU: 'cpu',
    TPU: 'tpu'
  }

  // 计算可用的服务器
  const availableServers = computed(() => 
    servers.value.filter(server => server.status === SERVER_STATUS.ONLINE)
  )

  // 计算训练服务器（GPU服务器）
  const trainingServers = computed(() => 
    servers.value.filter(server => 
      server.type === SERVER_TYPES.GPU && 
      server.status === SERVER_STATUS.ONLINE &&
      server.workStatus !== WORK_STATUS.DEPLOYING
    )
  )

  // 计算部署服务器（GPU服务器）
  const deploymentServers = computed(() => 
    servers.value.filter(server => 
      server.type === SERVER_TYPES.GPU && 
      server.status === SERVER_STATUS.ONLINE &&
      server.workStatus !== WORK_STATUS.TRAINING
    )
  )

  // 根据工作状态获取负载范围
  const getLoadRangeByWorkStatus = (workStatus) => {
    switch (workStatus) {
      case WORK_STATUS.IDLE:
        return {
          cpu: { min: 5, max: 20 },
          memory: { min: 10, max: 30 },
          gpu: { min: 0, max: 15 }
        }
      case WORK_STATUS.TRAINING:
        return {
          cpu: { min: 60, max: 85 },
          memory: { min: 70, max: 90 },
          gpu: { min: 75, max: 95 }
        }
      case WORK_STATUS.DEPLOYING:
        return {
          cpu: { min: 40, max: 65 },
          memory: { min: 45, max: 70 },
          gpu: { min: 30, max: 60 }
        }
      default:
        return {
          cpu: { min: 0, max: 10 },
          memory: { min: 0, max: 10 },
          gpu: { min: 0, max: 10 }
        }
    }
  }

  // 生成随机负载
  const generateMetrics = (workStatus) => {
    const range = getLoadRangeByWorkStatus(workStatus)
    return {
      cpu: Math.floor(Math.random() * (range.cpu.max - range.cpu.min) + range.cpu.min),
      memory: Math.floor(Math.random() * (range.memory.max - range.memory.min) + range.memory.min),
      gpu: Math.floor(Math.random() * (range.gpu.max - range.gpu.min) + range.gpu.min),
      temperature: Math.floor(Math.random() * 20 + 35) // 35-55度
    }
  }

  // 添加服务器
  const addServer = (server) => {
    if (servers.value.some(s => s.id === server.id)) {
      ElMessage.warning('服务器已存在')
      return false
    }
    servers.value.push({
      ...server,
      status: SERVER_STATUS.ONLINE,
      workStatus: WORK_STATUS.IDLE,
      lastUpdated: new Date().toISOString(),
      metrics: generateMetrics(WORK_STATUS.IDLE)
    })
    return true
  }

  // 更新服务器状态
  const updateServerStatus = (serverId, status) => {
    const server = servers.value.find(s => s.id === serverId)
    if (server) {
      server.status = status
      server.lastUpdated = new Date().toISOString()
      return true
    }
    return false
  }

  // 更新服务器指标
  const updateServerMetrics = (serverId, metrics) => {
    const server = servers.value.find(s => s.id === serverId)
    if (server) {
      server.metrics = {
        ...server.metrics,
        ...metrics
      }
      server.lastUpdated = new Date().toISOString()
      return true
    }
    return false
  }

  // 更新服务器工作状态
  const updateWorkStatus = (serverId, workStatus) => {
    const server = servers.value.find(s => s.id === serverId)
    if (server) {
      server.workStatus = workStatus
      server.lastUpdated = new Date().toISOString()
      // 更新对应的资源使用情况
      server.metrics = generateMetrics(workStatus)
      return true
    }
    return false
  }

  // 删除服务器
  const removeServer = (serverId) => {
    const index = servers.value.findIndex(s => s.id === serverId)
    if (index !== -1) {
      servers.value.splice(index, 1)
      return true
    }
    return false
  }

  // 获取服务器详情
  const getServerById = (serverId) => {
    return servers.value.find(s => s.id === serverId)
  }

  // 检查服务器是否可用于特定任务
  const isServerAvailable = (serverId, taskType) => {
    const server = getServerById(serverId)
    if (!server) return false
    
    if (server.status !== SERVER_STATUS.ONLINE) return false
    
    // 检查服务器负载
    if (taskType === 'training' && server.metrics.gpu > 80) return false
    if (server.metrics.cpu > 90 || server.metrics.memory > 90) return false
    
    return true
  }

  // 获取工作状态显示文本
  const getWorkStatusText = (workStatus) => {
    const textMap = {
      [WORK_STATUS.IDLE]: '空闲',
      [WORK_STATUS.TRAINING]: '训练中',
      [WORK_STATUS.DEPLOYING]: '摊销中'
    }
    return textMap[workStatus] || workStatus
  }

  // 获取工作状态标签类型
  const getWorkStatusType = (workStatus) => {
    const typeMap = {
      [WORK_STATUS.IDLE]: 'success',
      [WORK_STATUS.TRAINING]: 'danger',
      [WORK_STATUS.DEPLOYING]: 'warning'
    }
    return typeMap[workStatus] || 'info'
  }

  // 初始化服务器列表
  const initializeServers = () => {
    const initialServers = [
      {
        id: 'train-server-1',
        name: '训练服务器1',
        type: 'gpu',
        ip: '192.168.10.101',
        port: '22',
        status: SERVER_STATUS.ONLINE,
        workStatus: WORK_STATUS.IDLE,
        lastUpdated: new Date().toISOString(),
        metrics: generateMetrics(WORK_STATUS.IDLE)
      },
      {
        id: 'deploy-server-1',
        name: '摊销服务器1',
        type: 'gpu',
        ip: '192.168.10.102',
        port: '22',
        status: SERVER_STATUS.ONLINE,
        workStatus: WORK_STATUS.IDLE,
        lastUpdated: new Date().toISOString(),
        metrics: generateMetrics(WORK_STATUS.IDLE)
      },
      {
        id: 'deploy-server-2',
        name: '摊销服务器2',
        type: 'gpu',
        ip: '192.168.10.103',
        port: '22',
        status: SERVER_STATUS.ONLINE,
        workStatus: WORK_STATUS.IDLE,
        lastUpdated: new Date().toISOString(),
        metrics: generateMetrics(WORK_STATUS.IDLE)
      }
    ]
    servers.value = initialServers
  }

  // 初始化
  initializeServers()

  // 模拟定期更新服务器状态
  if (typeof window !== 'undefined') {
    setInterval(() => {
      servers.value.forEach(server => {
        // 根据当前工作状态更新指标
        server.metrics = generateMetrics(server.workStatus)
        server.lastUpdated = new Date().toISOString()
      })
    }, 5000)
  }

  return {
    servers,
    SERVER_STATUS,
    WORK_STATUS,
    SERVER_TYPES,
    availableServers,
    trainingServers,
    deploymentServers,
    addServer,
    updateServerStatus,
    updateServerMetrics,
    updateWorkStatus,
    removeServer,
    getServerById,
    isServerAvailable,
    getWorkStatusText,
    getWorkStatusType,
    initializeServers
  }
}) 