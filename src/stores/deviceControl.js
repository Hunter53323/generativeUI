import { defineStore } from 'pinia'
import { ref } from 'vue'

const DEVICE_DEFAULTS = {
  stepper_motor: {
    speed: 1500,
    current: 2.5,
    voltage: 48,
    power: 0.12,
    position: 180
  },
  async_motor: {
    speed: 1500,
    current: 10,
    voltage: 380,
    power: 5.5,
    frequency: 50,
    slip: 3.5
  },
  pmsm_motor: {
    speed: 3000,
    current: 8,
    voltage: 380,
    power: 4.0,
    torque: 12.5,
    efficiency: 96
  },
  fan: {
    speed: 2900,
    airflow: 5000,
    pressure: 800,
    power: 7.5
  },
  pump: {
    speed: 2900,
    flow: 50,
    head: 32,
    power: 5.5
  },
  compressor: {
    speed: 3000,
    pressure: 0.8,
    temperature: 75,
    power: 11
  }
}

export const useDeviceControlStore = defineStore('deviceControl', () => {
  const deviceStatus = ref({})
  const deviceParams = ref({})
  const deviceHistory = ref({})
  const updateIntervals = ref({})

  const getDeviceStatus = (deviceId) => deviceStatus.value[deviceId] || 'stopped'
  const getDeviceParams = (deviceId) => deviceParams.value[deviceId] || {}
  const getDeviceHistory = (deviceId) => deviceHistory.value[deviceId] || []

  const addRandomVariation = (value, percentage = 0.1) => {
    const variation = (Math.random() - 0.5) * 2 * (value * percentage)
    return value + variation
  }

  const updateDeviceData = (deviceId, deviceType) => {
    const currentParams = { ...deviceParams.value[deviceId] }
    const timestamp = Date.now()

    // 根据设备类型更新参数
    switch (deviceType) {
      case 'stepper_motor': {
        // 添加转速小幅波动
        currentParams.speed = Number((currentParams.speed * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
        currentParams.current = Number(addRandomVariation(currentParams.current, 0.05).toFixed(2))
        currentParams.voltage = Number(addRandomVariation(currentParams.voltage, 0.02).toFixed(2))
        currentParams.power = Number((currentParams.current * currentParams.voltage / 1000).toFixed(2))
        currentParams.position = Number(addRandomVariation(currentParams.position, 0.02).toFixed(2))
        break
      }
      case 'async_motor': {
        currentParams.speed = Number((currentParams.speed * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
        currentParams.current = Number(addRandomVariation(currentParams.current, 0.05).toFixed(2))
        currentParams.voltage = Number(addRandomVariation(currentParams.voltage, 0.02).toFixed(2))
        currentParams.power = Number((currentParams.current * currentParams.voltage * 1.732 * 0.85 / 1000).toFixed(2))
        currentParams.frequency = Number(addRandomVariation(currentParams.frequency, 0.02).toFixed(2))
        currentParams.slip = Number(addRandomVariation(currentParams.slip, 0.05).toFixed(2))
        break
      }
      case 'pmsm_motor': {
        currentParams.speed = Number((currentParams.speed * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
        currentParams.current = Number(addRandomVariation(currentParams.current, 0.05).toFixed(2))
        currentParams.voltage = Number(addRandomVariation(currentParams.voltage, 0.02).toFixed(2))
        currentParams.power = Number((currentParams.current * currentParams.voltage * 1.732 * 0.95 / 1000).toFixed(2))
        currentParams.torque = Number(addRandomVariation(currentParams.torque, 0.05).toFixed(2))
        currentParams.efficiency = Number(addRandomVariation(currentParams.efficiency, 0.01).toFixed(2))
        break
      }
      case 'fan': {
        // 添加转速小幅波动
        currentParams.speed = Number((currentParams.speed * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
        currentParams.airflow = Number(addRandomVariation(currentParams.airflow, 0.05).toFixed(2))
        currentParams.pressure = Number(addRandomVariation(currentParams.pressure, 0.05).toFixed(2))
        currentParams.power = Number(addRandomVariation(currentParams.power, 0.05).toFixed(2))
        break
      }
      case 'pump': {
        // 添加转速小幅波动
        currentParams.speed = Number((currentParams.speed * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
        currentParams.flow = Number(addRandomVariation(currentParams.flow, 0.05).toFixed(2))
        currentParams.head = Number(addRandomVariation(currentParams.head, 0.05).toFixed(2))
        currentParams.power = Number(addRandomVariation(currentParams.power, 0.05).toFixed(2))
        break
      }
      case 'compressor': {
        // 添加转速小幅波动
        currentParams.speed = Number((currentParams.speed * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
        currentParams.pressure = Number(addRandomVariation(currentParams.pressure, 0.05).toFixed(2))
        currentParams.temperature = Number(addRandomVariation(currentParams.temperature, 0.05).toFixed(2))
        currentParams.power = Number(addRandomVariation(currentParams.power, 0.05).toFixed(2))
        break
      }
    }

    deviceParams.value[deviceId] = currentParams
    if (!deviceHistory.value[deviceId]) {
      deviceHistory.value[deviceId] = []
    }
    deviceHistory.value[deviceId].push({
      timestamp,
      values: { ...currentParams }
    })

    // 只保留最近5分钟的数据
    const fiveMinutesAgo = timestamp - 5 * 60 * 1000
    deviceHistory.value[deviceId] = deviceHistory.value[deviceId].filter(
      item => item.timestamp > fiveMinutesAgo
    )
  }

  const startDevice = (deviceId, deviceType) => {
    deviceStatus.value[deviceId] = 'running'
    deviceParams.value[deviceId] = { ...DEVICE_DEFAULTS[deviceType] }
    
    // 启动数据更新
    if (updateIntervals.value[deviceId]) {
      clearInterval(updateIntervals.value[deviceId])
    }
    updateIntervals.value[deviceId] = setInterval(() => {
      updateDeviceData(deviceId, deviceType)
    }, 100)
  }

  const stopDevice = (deviceId) => {
    deviceStatus.value[deviceId] = 'stopped'
    if (updateIntervals.value[deviceId]) {
      clearInterval(updateIntervals.value[deviceId])
      delete updateIntervals.value[deviceId]
    }
  }

  const updateDeviceParam = (deviceId, paramKey, value) => {
    if (!deviceParams.value[deviceId]) {
      deviceParams.value[deviceId] = {}
    }
    deviceParams.value[deviceId][paramKey] = value
  }

  return {
    getDeviceStatus,
    getDeviceParams,
    getDeviceHistory,
    startDevice,
    stopDevice,
    updateDeviceParam
  }
}) 