import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { RUNNING_STATUS, DEVICE_PARAMS_CONFIG, generateRandomValue } from '@/constants/deviceControl'

export const useDeviceControlStore = defineStore('deviceControl', () => {
  // 设备运行状态
  const runningDevices = ref({})
  // 设备参数历史数据
  const deviceHistory = ref({})
  // 设备控制参数
  const deviceParams = ref({})
  // 更新间隔
  const updateInterval = ref(1000)
  // 存储定时器
  const timers = ref({})

  // 初始化设备参数
  const initDeviceParams = (deviceId, type) => {
    if (!deviceParams.value[deviceId]) {
      const config = DEVICE_PARAMS_CONFIG[type]
      if (config) {
        deviceParams.value[deviceId] = config.controlParams.reduce((acc, param) => {
          acc[param.key] = param.default
          return acc
        }, {})
      }
    }
  }

  // 启动设备
  const startDevice = (deviceId, type) => {
    if (!runningDevices.value[deviceId]) {
      runningDevices.value[deviceId] = RUNNING_STATUS.RUNNING
      initDeviceParams(deviceId, type)
      startDataCollection(deviceId, type)
    }
  }

  // 停止设备
  const stopDevice = (deviceId) => {
    runningDevices.value[deviceId] = RUNNING_STATUS.STOPPED
    if (timers.value[deviceId]) {
      clearInterval(timers.value[deviceId])
      delete timers.value[deviceId]
    }
  }

  // 开始数据采集
  const startDataCollection = (deviceId, type) => {
    if (!deviceHistory.value[deviceId]) {
      deviceHistory.value[deviceId] = []
    }

    timers.value[deviceId] = setInterval(() => {
      const config = DEVICE_PARAMS_CONFIG[type]
      const timestamp = new Date()
      const newData = {
        timestamp,
        values: {}
      }

      config.controlParams.forEach(param => {
        newData.values[param.key] = generateRandomValue(
          param,
          runningDevices.value[deviceId] === RUNNING_STATUS.RUNNING
        )
      })

      deviceHistory.value[deviceId].push(newData)
      // 只保留最近100个数据点
      if (deviceHistory.value[deviceId].length > 100) {
        deviceHistory.value[deviceId].shift()
      }
    }, updateInterval.value)
  }

  // 更新设备参数
  const updateDeviceParam = (deviceId, paramKey, value) => {
    if (deviceParams.value[deviceId]) {
      deviceParams.value[deviceId][paramKey] = value
    }
  }

  // 获取设备运行状态
  const getDeviceStatus = (deviceId) => {
    return runningDevices.value[deviceId] || RUNNING_STATUS.STOPPED
  }

  // 获取设备历史数据
  const getDeviceHistory = (deviceId) => {
    return deviceHistory.value[deviceId] || []
  }

  // 获取设备当前参数
  const getDeviceParams = (deviceId) => {
    return deviceParams.value[deviceId] || {}
  }

  // 清理所有定时器
  const clearAllTimers = () => {
    Object.values(timers.value).forEach(timer => clearInterval(timer))
    timers.value = {}
  }

  return {
    runningDevices,
    deviceHistory,
    deviceParams,
    startDevice,
    stopDevice,
    updateDeviceParam,
    getDeviceStatus,
    getDeviceHistory,
    getDeviceParams,
    clearAllTimers
  }
}) 