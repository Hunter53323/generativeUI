import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const API_BASE_URL = '/devicemanager'
// const API_BASE_URL = 'http://150.158.159.3:8888'
// const API_BASE_URL = 'http://192.168.3.164:8888'

// 通用请求配置
const fetchConfig = {
  mode: 'cors',
  credentials: 'omit',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}
export const useDeviceDatabaseStore = defineStore('deviceDatabase', {
  state: () => ({
    devices: [],
    loading: false,
    currentDevice: null,
  }),

  actions: {
    // 获取设备列表
    async fetchDevices() {
      this.loading = true
      try {
        const response = await fetch(`${API_BASE_URL}/api/device/device/list`, {
          ...fetchConfig,
          method: 'POST',
          headers: {
            ...fetchConfig.headers,
            'Access-Control-Allow-Origin': '*',
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('API Response:', data)
        
        if (!data.devices) {
          console.error('Invalid response format:', data)
          throw new Error('Invalid response format')
        }

        this.devices = data.devices
        ElMessage.success('设备列表获取成功')
      } catch (error) {
        console.error('获取设备列表失败:', error)
        ElMessage.error(`设备列表获取失败: ${error.message}`)
      } finally {
        this.loading = false
      }
    },

    // 创建设备
    async createDevice(deviceInfo) {
      try {
        console.log('Creating device with info:', deviceInfo)
        const response = await fetch(`${API_BASE_URL}/api/device/device/create`, {
          ...fetchConfig,
          method: 'POST',
          body: JSON.stringify(deviceInfo)
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Create device response:', data)
        
        if (data.success) {
          ElMessage.success('设备创建成功')
          await this.fetchDevices()
        } else {
          throw new Error(data.message || '创建失败')
        }
      } catch (error) {
        console.error('创建设备失败:', {
          message: error.message,
          stack: error.stack,
          data: deviceInfo
        })
        ElMessage.error(`设备创建失败: ${error.message}`)
        throw error
      }
    },

    // 删除设备
    async deleteDevice(deviceId) {
      try {
        console.log('Deleting device:', deviceId)
        const response = await fetch(`${API_BASE_URL}/api/device/device/delete`, {
          ...fetchConfig,
          method: 'POST',
          body: JSON.stringify({ deviceId })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Delete device response:', data)
        
        if (data.success) {
          ElMessage.success('设备删除成功')
          await this.fetchDevices()
        } else {
          throw new Error(data.message || '删除失败')
        }
      } catch (error) {
        console.error('删除设备失败:', {
          message: error.message,
          stack: error.stack,
          deviceId
        })
        ElMessage.error(`设备删除失败: ${error.message}`)
        throw error
      }
    },

    // 获取设备类型对应的标签类型
    getDeviceTagType(type) {
      const typeMap = {
        'edge': 'info',
        'pc': 'success',
        'fan': 'warning',
        'motor': 'danger'
      }
      return typeMap[type] || ''
    },

    // 获取设备状态对应的标签类型
    getStatusTagType(status) {
      const statusMap = {
        'ready': 'success',
        'offline': 'info',
        'error': 'danger'
      }
      return statusMap[status] || 'warning'
    },

    // 创建设备资源
    async createDeviceResource(deviceInfo) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/device/resource/create`, {
          ...fetchConfig,
          method: 'POST',
          body: JSON.stringify({
            deviceResourceInfo: deviceInfo
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
      } catch (error) {
        console.error('创建设备资源失败:', error)
        throw error
      }
    },

    // 删除设备资源
    async deleteDeviceResource(deviceUID) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/device/resource/delete`, {
          ...fetchConfig,
          method: 'POST',
          body: JSON.stringify({
            deviceUID: deviceUID  // 确保参数名称正确
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Delete response:', data)
        return data
      } catch (error) {
        console.error('删除设备资源失败:', error)
        throw error
      }
    },

    // 创建设备帧
    async createDeviceFrame(frameData) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/device/frame/create`, {
          ...fetchConfig,
          method: 'POST',
          body: JSON.stringify(frameData)
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
      } catch (error) {
        console.error('创建设备帧失败:', error)
        throw error
      }
    },

    // 删除设备帧
    async deleteDeviceFrame(deviceUID, frameType) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/device/frame/delete`, {
          ...fetchConfig,
          method: 'POST',
          body: JSON.stringify({
            deviceUID,
            frameType
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
      } catch (error) {
        console.error('删除设备帧失败:', error)
        throw error
      }
    },

    // 获取设备详情
    async fetchDeviceDetail(deviceUID) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/device/device/list`, {
          ...fetchConfig,
          method: 'POST',
          body: JSON.stringify({
            deviceUID: deviceUID
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (data.devices && data.devices.length > 0) {
          // 更新设备列表中的详细信息
          const index = this.devices.findIndex(d => d.deviceMeta.deviceUID === deviceUID)
          if (index !== -1) {
            this.devices[index] = data.devices[0]
          }
          return data.devices[0]
        }
        throw new Error('未找到设备详情')
      } catch (error) {
        console.error('获取设备详情失败:', error)
        ElMessage.error('获取设备详情失败')
        throw error
      }
    }
  }
}) 