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
  const deviceUpdateRates = ref({}) // 每个设备的更新频率

  const getDeviceStatus = (deviceId) => deviceStatus.value[deviceId] || 'stopped'
  const getDeviceParams = (deviceId) => deviceParams.value[deviceId] || {}
  const getDeviceHistory = (deviceId) => deviceHistory.value[deviceId] || []
  const getDeviceUpdateRate = (deviceId) => deviceUpdateRates.value[deviceId] || 0

  const addRandomVariation = (value, percentage = 0.1) => {
    const variation = (Math.random() - 0.5) * 2 * (value * percentage)
    return value + variation
  }

  const updateDeviceData = (deviceId, deviceType) => {
    const currentParams = { ...deviceParams.value[deviceId] }
    const timestamp = Date.now()
    
    // 获取目标转速和电压
    const targetSpeed = currentParams.targetSpeed
    const targetVoltage = currentParams.targetVoltage
    
    // 计算当前值与目标值的差值
    const speedDiff = targetSpeed - currentParams.speed
    const voltageDiff = targetVoltage - currentParams.voltage
    
    // 定义调整步长
    const speedStep = 20       // 每次最多变化20 RPM
    const voltageStep = 2      // 每次最多变化2V
    
    // 逐步调整转速
    if (Math.abs(speedDiff) > speedStep) {
      currentParams.speed = Number((currentParams.speed + Math.sign(speedDiff) * speedStep).toFixed(2))
    } else {
      currentParams.speed = Number(targetSpeed.toFixed(2))
    }
    
    // 逐步调整电压
    if (Math.abs(voltageDiff) > voltageStep) {
      currentParams.voltage = Number((currentParams.voltage + Math.sign(voltageDiff) * voltageStep).toFixed(2))
    } else {
      currentParams.voltage = Number(targetVoltage.toFixed(2))
    }

    // 添加小幅波动
    currentParams.speed = Number((currentParams.speed * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
    currentParams.voltage = Number((currentParams.voltage * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))

    // 根据设备类型更新其他参数
    const speedRatio = currentParams.speed / DEVICE_DEFAULTS[deviceType].speed
    switch (deviceType) {
      case 'stepper_motor': {
        currentParams.current = Number((speedRatio * DEVICE_DEFAULTS[deviceType].current * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        currentParams.power = Number((currentParams.current * currentParams.voltage / 1000).toFixed(2))
        currentParams.position = Number((speedRatio * 360 * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2))
        break
      }
      case 'async_motor': {
        currentParams.current = Number((speedRatio * DEVICE_DEFAULTS[deviceType].current * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        currentParams.power = Number((currentParams.current * currentParams.voltage * 1.732 * 0.85 / 1000).toFixed(2))
        currentParams.frequency = Number((speedRatio * 50 * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2))
        currentParams.slip = Number(addRandomVariation(currentParams.slip, 0.05).toFixed(2))
        break
      }
      case 'pmsm_motor': {
        currentParams.current = Number((speedRatio * DEVICE_DEFAULTS[deviceType].current * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        currentParams.power = Number((currentParams.current * currentParams.voltage * 1.732 * 0.95 / 1000).toFixed(2))
        currentParams.torque = Number((speedRatio * DEVICE_DEFAULTS[deviceType].torque * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        currentParams.efficiency = Number(addRandomVariation(currentParams.efficiency, 0.01).toFixed(2))
        break
      }
      case 'fan': {
        currentParams.airflow = Number((speedRatio * DEVICE_DEFAULTS[deviceType].airflow * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        currentParams.pressure = Number((Math.pow(speedRatio, 2) * DEVICE_DEFAULTS[deviceType].pressure * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        currentParams.power = Number((Math.pow(speedRatio, 3) * DEVICE_DEFAULTS[deviceType].power * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        break
      }
      case 'pump': {
        currentParams.flow = Number((speedRatio * DEVICE_DEFAULTS[deviceType].flow * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        currentParams.head = Number((Math.pow(speedRatio, 2) * DEVICE_DEFAULTS[deviceType].head * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        currentParams.power = Number((Math.pow(speedRatio, 3) * DEVICE_DEFAULTS[deviceType].power * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        break
      }
      case 'compressor': {
        currentParams.pressure = Number((speedRatio * DEVICE_DEFAULTS[deviceType].pressure * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        currentParams.temperature = Number((speedRatio * DEVICE_DEFAULTS[deviceType].temperature * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        currentParams.power = Number((Math.pow(speedRatio, 3) * DEVICE_DEFAULTS[deviceType].power * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2))
        break
      }
    }

    deviceParams.value[deviceId] = currentParams
    
    // 更新历史数据
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

  const updateDeviceRate = (deviceId) => {
    // 确保更新频率有初始值
    if (!deviceUpdateRates.value[deviceId]) {
      deviceUpdateRates.value[deviceId] = 0
    }
    deviceUpdateRates.value[deviceId] = Math.floor(50 + Math.random() * 50)
  }

  const startDevice = (deviceId, deviceType) => {
    deviceStatus.value[deviceId] = 'running'
    // 初始化参数为0，而不是直接设置为默认值
    deviceParams.value[deviceId] = {
      ...DEVICE_DEFAULTS[deviceType],
      speed: 0,          // 从0开始
      current: 0,
      voltage: 0,
      power: 0,
      // 根据设备类型设置其他参数为0
      ...(deviceType === 'stepper_motor' && { position: 0 }),
      ...(deviceType === 'async_motor' && { frequency: 0, slip: 0 }),
      ...(deviceType === 'pmsm_motor' && { torque: 0, efficiency: 0 }),
      ...(deviceType === 'fan' && { airflow: 0, pressure: 0 }),
      ...(deviceType === 'pump' && { flow: 0, head: 0 }),
      ...(deviceType === 'compressor' && { pressure: 0, temperature: 0 }),
    }
    
    // 设置目标值为默认值
    deviceParams.value[deviceId].targetSpeed = DEVICE_DEFAULTS[deviceType].speed
    deviceParams.value[deviceId].targetVoltage = DEVICE_DEFAULTS[deviceType].voltage
    
    // 先初始化更新频率
    updateDeviceRate(deviceId)
    
    // 启动数据更新
    if (updateIntervals.value[deviceId]) {
      clearInterval(updateIntervals.value[deviceId].dataInterval)
      clearInterval(updateIntervals.value[deviceId].rateInterval)
    }

    // 设置数据更新和频率更新的定时器
    updateIntervals.value[deviceId] = {
      dataInterval: setInterval(() => {
        updateDeviceData(deviceId, deviceType)
      }, 100),
      rateInterval: setInterval(() => {
        updateDeviceRate(deviceId)
      }, 1000)
    }
  }

  const stopDevice = (deviceId) => {
    deviceStatus.value[deviceId] = 'stopped'
    if (updateIntervals.value[deviceId]) {
      clearInterval(updateIntervals.value[deviceId].dataInterval)
      clearInterval(updateIntervals.value[deviceId].rateInterval)
      delete updateIntervals.value[deviceId]
    }
    // 确保停止时设置为0
    deviceUpdateRates.value[deviceId] = 0
  }

  const updateDeviceParam = (deviceId, paramKey, value) => {
    if (!deviceParams.value[deviceId]) {
      deviceParams.value[deviceId] = {}
    }
    // 更新目标参数
    deviceParams.value[deviceId][paramKey] = value
    
    // 如果是转速参数，需要更新相关的从属参数
    if (paramKey === 'targetSpeed') {
      // 获取当前设备类型
      const deviceType = Object.keys(DEVICE_DEFAULTS).find(type => 
        JSON.stringify(Object.keys(DEVICE_DEFAULTS[type]).sort()) === 
        JSON.stringify(Object.keys(deviceParams.value[deviceId]).sort())
      )
      
      if (deviceType) {
        // 根据新的目标转速调整实际转速
        deviceParams.value[deviceId].speed = value
        
        // 根据设备类型调整相关参数
        switch (deviceType) {
          case 'stepper_motor': {
            // 调整电流和功率
            deviceParams.value[deviceId].current = Number((value / 3000 * DEVICE_DEFAULTS[deviceType].current).toFixed(2))
            deviceParams.value[deviceId].power = Number((deviceParams.value[deviceId].current * deviceParams.value[deviceId].voltage / 1000).toFixed(2))
            break
          }
          case 'async_motor': {
            // 调整频率、电流和功率
            deviceParams.value[deviceId].frequency = Number((value / 3000 * 50).toFixed(2))
            deviceParams.value[deviceId].current = Number((value / 3000 * DEVICE_DEFAULTS[deviceType].current).toFixed(2))
            deviceParams.value[deviceId].power = Number((deviceParams.value[deviceId].current * deviceParams.value[deviceId].voltage * 1.732 * 0.85 / 1000).toFixed(2))
            break
          }
          case 'pmsm_motor': {
            // 调整转矩、电流和功率
            deviceParams.value[deviceId].current = Number((value / 3000 * DEVICE_DEFAULTS[deviceType].current).toFixed(2))
            deviceParams.value[deviceId].torque = Number((value / 3000 * DEVICE_DEFAULTS[deviceType].torque).toFixed(2))
            deviceParams.value[deviceId].power = Number((deviceParams.value[deviceId].current * deviceParams.value[deviceId].voltage * 1.732 * 0.95 / 1000).toFixed(2))
            break
          }
          case 'fan': {
            // 调整风量、压力和功率
            deviceParams.value[deviceId].airflow = Number((value / 3000 * DEVICE_DEFAULTS[deviceType].airflow).toFixed(2))
            deviceParams.value[deviceId].pressure = Number((Math.pow(value / 3000, 2) * DEVICE_DEFAULTS[deviceType].pressure).toFixed(2))
            deviceParams.value[deviceId].power = Number((Math.pow(value / 3000, 3) * DEVICE_DEFAULTS[deviceType].power).toFixed(2))
            break
          }
          case 'pump': {
            // 调整流量、扬程和功率
            deviceParams.value[deviceId].flow = Number((value / 3000 * DEVICE_DEFAULTS[deviceType].flow).toFixed(2))
            deviceParams.value[deviceId].head = Number((Math.pow(value / 3000, 2) * DEVICE_DEFAULTS[deviceType].head).toFixed(2))
            deviceParams.value[deviceId].power = Number((Math.pow(value / 3000, 3) * DEVICE_DEFAULTS[deviceType].power).toFixed(2))
            break
          }
          case 'compressor': {
            // 调整压力、温度和功率
            deviceParams.value[deviceId].pressure = Number((value / 3000 * DEVICE_DEFAULTS[deviceType].pressure).toFixed(2))
            deviceParams.value[deviceId].temperature = Number((value / 3000 * DEVICE_DEFAULTS[deviceType].temperature).toFixed(2))
            deviceParams.value[deviceId].power = Number((Math.pow(value / 3000, 3) * DEVICE_DEFAULTS[deviceType].power).toFixed(2))
            break
          }
        }
      }
    }
  }

  return {
    getDeviceStatus,
    getDeviceParams,
    getDeviceHistory,
    startDevice,
    stopDevice,
    updateDeviceParam,
    getDeviceUpdateRate
  }
}) 