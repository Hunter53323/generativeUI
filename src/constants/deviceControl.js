// 设备运行状态
export const RUNNING_STATUS = {
  STOPPED: 'stopped',
  RUNNING: 'running',
  ERROR: 'error'
}

// 设备类型对应的参数配置
export const DEVICE_PARAMS_CONFIG = {
  motor: {
    controlParams: [
      { key: 'speed', label: '转速', unit: 'rpm', min: 0, max: 3000, default: 1500 },
      { key: 'current', label: '电流', unit: 'A', min: 0, max: 20, default: 0 },
      { key: 'voltage', label: '电压', unit: 'V', min: 0, max: 440, default: 380 },
      { key: 'power', label: '功率', unit: 'kW', min: 0, max: 10, default: 0 }
    ],
    chartParams: ['speed', 'current']
  },
  pump: {
    controlParams: [
      { key: 'flow', label: '流量', unit: 'm³/h', min: 0, max: 100, default: 50 },
      { key: 'pressure', label: '压力', unit: 'MPa', min: 0, max: 1.0, default: 0.6 },
      { key: 'speed', label: '转速', unit: 'rpm', min: 0, max: 3000, default: 2900 }
    ],
    chartParams: ['flow', 'pressure']
  },
  // ... 其他设备类型的参数配置
}

// 生成随机参数值
export const generateRandomValue = (param, isRunning) => {
  if (!isRunning) return 0
  const { min, max, default: defaultValue } = param
  const variation = (max - min) * 0.1 // 10% 波动范围
  const baseValue = defaultValue
  return baseValue + (Math.random() * 2 - 1) * variation
} 