import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useServerManagerStore } from './serverManager'
import { useModelManageStore } from './modelmanage'
import { ElMessage } from 'element-plus'

export const useModelTrainStore = defineStore('modelTrain', () => {
  const serverManager = useServerManagerStore()
  const modelManage = useModelManageStore()
  
  // 训练任务列表
  const trainTasks = ref([
    {
      id: 'TRAIN' + Math.floor(Math.random() * 1000000),  // 生成6位数的任务ID
      name: '生成式电机控制模型',
      dataset: 'MySQL数据集',
      modelType: 'generative',
      server: 'train-server-1',
      status: 'completed',
      progress: 100
    },
    {
      id: 'TRAIN' + Math.floor(Math.random() * 1000000),
      name: '生成式电机控制模型',
      dataset: 'CSV数据集',
      modelType: 'generative',
      server: 'deploy-server-1',
      status: 'completed',
      progress: 100
    },
    {
      id: 'TRAIN' + Math.floor(Math.random() * 1000000),
      name: '生成式风机控制模型',
      dataset: '设备数据集',
      modelType: 'generative',
      server: 'deploy-server-2',
      status: 'pending',
      progress: 0
    }
  ])

  // 存储定时器
  const progressTimers = {}

  // 添加新任务
  const addTask = (task) => {
    trainTasks.value.push({
      id: 'TRAIN' + Math.floor(Math.random() * 1000000),  // 生成新的任务ID
      ...task,
      status: 'pending',
      progress: 0
    })
  }

  // 开始任务
  const startTask = (taskId) => {
    const task = trainTasks.value.find(t => t.id === taskId)
    if (!task) return

    // 如果已经有定时器在运行，先清除
    if (progressTimers[taskId]) {
      clearInterval(progressTimers[taskId])
    }

    // 更新任务状态
    task.status = 'running'
    task.progress = 0
    
    // 更新服务器状态
    serverManager.updateWorkStatus(task.server, serverManager.WORK_STATUS.TRAINING)
    
    // 启动进度更新定时器
    progressTimers[taskId] = setInterval(() => {
      if (task.progress < 100) {
        task.progress += 1
        // task.progress += 10  // 每次增加10%
      }
      if (task.progress >= 100) {
        completeTask(taskId)
      }
    }, 5000)
    // }, 1000)  // 每秒更新一次，总共10秒完成
    
    ElMessage.success('已启动训练任务')
  }

  // 停止任务
  const stopTask = (taskId) => {
    const task = trainTasks.value.find(t => t.id === taskId)
    if (!task) return

    // 清除定时器
    if (progressTimers[taskId]) {
      clearInterval(progressTimers[taskId])
      delete progressTimers[taskId]
    }
    
    // 更新任务状态
    task.status = 'stopped'
    
    // 更新服务器状态
    serverManager.updateWorkStatus(task.server, serverManager.WORK_STATUS.IDLE)
    
    ElMessage.success('已停止训练任务')
  }

  // 完成任务
  const completeTask = (taskId) => {
    const task = trainTasks.value.find(t => t.id === taskId)
    if (!task) return

    // 清除定时器
    if (progressTimers[taskId]) {
      clearInterval(progressTimers[taskId])
      delete progressTimers[taskId]
    }
    
    // 更新任务状态
    task.status = 'completed'
    task.progress = 100
    
    // 更新服务器状态
    serverManager.updateWorkStatus(task.server, serverManager.WORK_STATUS.IDLE)
    
    // 添加到模型库
    const newModel = {
      id: Date.now(),
      name: task.name,
      type: task.modelType.toLowerCase(),
      description: `由训练任务 "${task.name}" 生成的模型，使用 ${task.dataset} 训练。`,
      uploadTime: new Date().toLocaleString(),
      size: '2.8MB',
      author: '系统'
    }
    
    modelManage.addModel(newModel)
    
    ElMessage.success('训练任务已完成，模型已添加到模型库')
  }

  // 删除任务
  const deleteTask = (taskId) => {
    const task = trainTasks.value.find(t => t.id === taskId)
    if (!task) return

    // 如果任务正在运行，先停止任务
    if (task.status === 'running') {
      stopTask(taskId)
    }
    
    trainTasks.value = trainTasks.value.filter(t => t.id !== taskId)
    ElMessage.success('删除成功')
  }

  // 检查任务是否可以开始
  const canStartTask = (taskId) => {
    const task = trainTasks.value.find(t => t.id === taskId)
    if (!task) return false
    
    return serverManager.isServerAvailable(task.server, 'training')
  }

  return {
    trainTasks,
    addTask,
    startTask,
    stopTask,
    deleteTask,
    canStartTask
  }
}) 