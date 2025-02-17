import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDeviceDatabaseStore = defineStore('deviceDatabase', () => {
  const baseUrl = 'http://150.158.159.3:8888'
  const devices = ref([])
  const loading = ref(false)

  // 列出设备
  const listDevices = async (params = {}) => {
    loading.value = true
    try {
      const response = await fetch(`${baseUrl}/api/device/device/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })
      const data = await response.json()
      devices.value = Array.isArray(data) ? data : [data]
      return data
    } catch (error) {
      console.error('获取设备列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建设备资源
  const createDeviceResource = async (deviceInfo) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/device/resource/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deviceResourceInfo: deviceInfo })
      })
      return await response.json()
    } catch (error) {
      console.error('创建设备资源失败:', error)
      throw error
    }
  }

  // 删除设备资源
  const deleteDeviceResource = async (deviceUID) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/device/resource/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deviceUID })
      })
      return await response.json()
    } catch (error) {
      console.error('删除设备资源失败:', error)
      throw error
    }
  }

  return {
    devices,
    loading,
    listDevices,
    createDeviceResource,
    deleteDeviceResource
  }
}) 