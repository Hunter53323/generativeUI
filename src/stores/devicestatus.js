import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDeviceStore = defineStore('device', () => {
  // 设备列表
  const devices = ref([
    {
      id: 'motor_1',
      name: '电机',
      type: 'motor',
      status: 'normal',
      connected: false,
      protocol: 'modbus_rtu',
      config: {
        com: 'COM1',
        baudRate: 9600
      }
    },
    {
      id: 'fan_1',
      name: '风机',
      type: 'fan',
      status: 'warning',
      connected: false,
      protocol: 'modbus_tcp',
      config: {
        ip: '192.168.1.100',
        port: '502'
      }
    },
    {
      id: 'pump_1',
      name: '水泵',
      type: 'pump',
      status: 'normal',
      connected: false,
      protocol: 'rs485',
      config: {
        com: 'COM2',
        baudRate: 19200
      }
    },
    {
      id: 'compressor_1',
      name: '压缩机',
      type: 'compressor',
      status: 'error',
      connected: false,
      protocol: 'modbus_tcp',
      config: {
        ip: '192.168.1.101',
        port: '502'
      }
    },
    {
      id: 'sensor_1',
      name: '温度传感器',
      type: 'sensor',
      status: 'normal',
      connected: false,
      protocol: 'modbus_rtu',
      config: {
        com: 'COM3',
        baudRate: 9600
      }
    },
    {
      id: 'controller_1',
      name: 'PLC控制器',
      type: 'controller',
      status: 'normal',
      connected: false,
      protocol: 'modbus_tcp',
      config: {
        ip: '192.168.1.102',
        port: '502'
      }
    }
  ])

  // 添加设备
  const addDevice = (device) => {
    devices.value.push(device)
  }

  // 更新设备
  const updateDevice = (id, newData) => {
    const index = devices.value.findIndex(d => d.id === id)
    if (index !== -1) {
      devices.value[index] = { ...devices.value[index], ...newData }
    }
  }

  // 删除设备
  const removeDevice = (id) => {
    devices.value = devices.value.filter(d => d.id !== id)
  }

  return {
    devices,
    addDevice,
    updateDevice,
    removeDevice
  }
}) 