// 设备运行状态
export const RUNNING_STATUS = {
  STOPPED: 'stopped',
  RUNNING: 'running',
  ERROR: 'error'
}

// 设备类型对应的参数配置
export const DEVICE_PARAMS_CONFIG = {
  stepper_motor: {
    controlParams: [
      { key: 'speed', label: '转速', unit: 'RPM' },
      { key: 'current', label: '电流', unit: 'A' },
      { key: 'voltage', label: '电压', unit: 'V' },
      { key: 'power', label: '功率', unit: 'kW' },
      { key: 'position', label: '位置', unit: '°' }
    ],
    chartParams: ['speed', 'current', 'position', 'power']
  },
  async_motor: {
    controlParams: [
      { key: 'speed', label: '转速', unit: 'RPM' },
      { key: 'current', label: '电流', unit: 'A' },
      { key: 'voltage', label: '电压', unit: 'V' },
      { key: 'power', label: '功率', unit: 'kW' },
      { key: 'frequency', label: '频率', unit: 'Hz' },
      { key: 'slip', label: '转差率', unit: '%' }
    ],
    chartParams: ['speed', 'current', 'frequency', 'power']
  },
  pmsm_motor: {
    controlParams: [
      { key: 'speed', label: '转速', unit: 'RPM' },
      { key: 'current', label: '电流', unit: 'A' },
      { key: 'voltage', label: '电压', unit: 'V' },
      { key: 'power', label: '功率', unit: 'kW' },
      { key: 'torque', label: '转矩', unit: 'N·m' },
      { key: 'efficiency', label: '效率', unit: '%' }
    ],
    chartParams: ['speed', 'current', 'torque', 'power']
  },
  motor: {
    controlParams: [
      { key: 'speed', label: '转速', unit: 'RPM' },
      { key: 'current', label: '电流', unit: 'A' },
      { key: 'voltage', label: '电压', unit: 'V' },
      { key: 'power', label: '功率', unit: 'kW' }
    ],
    chartParams: ['speed', 'current', 'power']  // 选择要在图表中显示的参数
  },
  fan: {
    controlParams: [
      { key: 'speed', label: '转速', unit: 'RPM' },
      { key: 'airflow', label: '风量', unit: 'm³/h' },
      { key: 'pressure', label: '静压', unit: 'Pa' },
      { key: 'power', label: '功率', unit: 'kW' }
    ],
    chartParams: ['speed', 'airflow', 'pressure', 'power']
  },
  pump: {
    controlParams: [
      { key: 'speed', label: '转速', unit: 'RPM' },
      { key: 'flow', label: '流量', unit: 'm³/h' },
      { key: 'head', label: '扬程', unit: 'm' },
      { key: 'power', label: '功率', unit: 'kW' }
    ],
    chartParams: ['speed', 'flow', 'head', 'power']
  },
  compressor: {
    controlParams: [
      { key: 'speed', label: '转速', unit: 'RPM' },
      { key: 'pressure', label: '排气压力', unit: 'MPa' },
      { key: 'temperature', label: '排气温度', unit: '°C' },
      { key: 'power', label: '功率', unit: 'kW' }
    ],
    chartParams: ['speed', 'pressure', 'temperature', 'power']
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