import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDeviceStore } from './devicestatus'
import { DEVICE_TYPES, PROTOCOL_TYPES } from '@/constants/devicestatus'

export const useDeviceManagerStore = defineStore('deviceManager', () => {
  const deviceStore = useDeviceStore()
  const devices = ref([])

  // 将设备状态转换为数据库设备格式
  const convertDeviceToDBFormat = (device) => {
    return {
      deviceUID: device.id,
      deviceResourceInfo: {
        IP: device.protocol === 'modbus_tcp' ? device.config.ip : '',
        type: device.type,
        protocol: [device.protocol],
        OS: '',
        CPU: { amount: 0, type: '', unit: '' },
        GPU: { amount: 0, type: '', unit: '' },
        disk: { amount: 0, type: '', unit: '' },
        mem: { amount: 0, type: '', unit: '' }
      },
      deviceWorkStatus: {
        healthStatus: device.status === 'normal' ? 'ready' : 
                     device.status === 'warning' ? 'pending' : 'error',
        workMode: 'distributed',
        timestamp: new Date().toISOString()
      },
      deviceMeta: {
        deviceUID: device.id,
        deviceDesc: device.name,
        frameInfos: []
      }
    }
  }

  // 初始化设备列表
  const initDevices = () => {
    devices.value = deviceStore.devices.map(convertDeviceToDBFormat)
  }

  // 添加设备
  const addDevice = (device) => {
    // 添加到设备状态管理
    deviceStore.addDevice(device)
    // 添加到数据库设备列表
    devices.value.push(convertDeviceToDBFormat(device))
  }

  // 更新设备
  const updateDevice = (id, newData) => {
    deviceStore.updateDevice(id, newData)
    const index = devices.value.findIndex(d => d.deviceUID === id)
    if (index !== -1) {
      devices.value[index] = convertDeviceToDBFormat({
        ...deviceStore.devices.find(d => d.id === id),
        ...newData
      })
    }
  }

  // 删除设备
  const removeDevice = (id) => {
    deviceStore.removeDevice(id)
    devices.value = devices.value.filter(d => d.deviceUID !== id)
  }

  // 获取设备类型选项
  const deviceTypeOptions = computed(() => 
    DEVICE_TYPES.map(type => ({
      label: type.label,
      value: type.value
    }))
  )

  // 获取协议类型选项
  const protocolOptions = computed(() => 
    PROTOCOL_TYPES.map(protocol => ({
      label: protocol.label,
      value: protocol.value,
      type: protocol.type
    }))
  )

  return {
    devices,
    deviceTypeOptions,
    protocolOptions,
    initDevices,
    addDevice,
    updateDevice,
    removeDevice
  }
}) 