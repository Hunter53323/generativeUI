// 协议类型定义
export const PROTOCOL_TYPES = [
  { 
    label: 'Modbus RTU',
    value: 'modbus_rtu',
    type: 'serial'
  },
  { 
    label: 'Modbus TCP',
    value: 'modbus_tcp',
    type: 'network'
  },
  {
    label: 'RS485',
    value: 'rs485',
    type: 'serial'
  }
]

// 设备类型定义
export const DEVICE_TYPES = [
  { label: '电机', value: 'motor' },
  { label: '风机', value: 'fan' },
  { label: '水泵', value: 'pump' },
  { label: '压缩机', value: 'compressor' },
  { label: '传感器', value: 'sensor' },
  { label: '控制器', value: 'controller' }
]

// 状态选项
export const STATUS_OPTIONS = [
  { label: '正常', value: 'normal' },
  { label: '警告', value: 'warning' },
  { label: '错误', value: 'error' }
]

// 状态类型映射
export const STATUS_TYPES = {
  normal: 'success',
  warning: 'warning',
  error: 'danger'
}

// 判断是否为串口协议
export const isSerialProtocol = (protocol) => {
  const protocolInfo = PROTOCOL_TYPES.find(p => p.value === protocol)
  return protocolInfo?.type === 'serial'
} 