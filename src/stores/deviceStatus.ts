import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDeviceStatusStore = defineStore('deviceStatus', () => {
  const connectedDevices = ref(12)
  const normalDevices = ref(10)
  const abnormalDevices = ref(2)
  
  // 计算属性
  const deviceStatusData = computed(() => ({
    connected: connectedDevices.value,
    normal: normalDevices.value,
    abnormal: abnormalDevices.value,
    normalRate: ((normalDevices.value / connectedDevices.value) * 100).toFixed(1)
  }))

  // 更新方法
  const updateDeviceStatus = (connected: number, normal: number, abnormal: number) => {
    connectedDevices.value = connected
    normalDevices.value = normal
    abnormalDevices.value = abnormal
  }

  return {
    connectedDevices,
    normalDevices,
    abnormalDevices,
    deviceStatusData,
    updateDeviceStatus
  }
}) 