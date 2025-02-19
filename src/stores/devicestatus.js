import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDeviceStore = defineStore('device', () => {
  // 设备列表
  const devices = ref([
    {
      id: 'stepper_motor_1',
      name: '步进电机',
      type: 'stepper_motor',
      status: 'normal',
      connected: false,
      protocol: 'http',
      config: {
        ip: '192.168.3.72',
        port: '8080'
      }
    },
    {
      id: 'async_motor_1',
      name: '异步电机',
      type: 'async_motor',
      status: 'normal',
      connected: false,
      protocol: 'modbus_tcp',
      config: {
        ip: '192.168.1.100',
        port: '502'
      }
    },
    {
      id: 'pmsm_motor_1',
      name: '永磁电机',
      type: 'pmsm_motor',
      status: 'normal',
      connected: false,
      protocol: 'rs485',
      config: {
        com: 'COM2',
        baudRate: 19200
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
        ip: '192.168.1.101',
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
        com: 'COM3',
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
        ip: '192.168.1.102',
        port: '502'
      }
    },
    {
      id: 'dc_motor_1',
      name: '直流无刷电机',
      type: 'dc_motor',
      status: 'normal',
      connected: true,
      protocol: 'http',
      config: {
        ip: '192.168.3.71',
        port: '8000'
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