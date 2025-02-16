<script setup>
import { ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useEdgeDevicesStore } from '@/stores/edgeDevices'
import DeviceCard from '@/components/edgedevice/DeviceCard.vue'
import AddDeviceDialog from '@/components/edgedevice/AddDeviceDialog.vue'

const edgeDevicesStore = useEdgeDevicesStore()
const showAddDialog = ref(false)
const fileInput = ref(null)
const currentDevice = ref(null)

// 处理添加设备
const handleAddDevice = (newDevice) => {
  if (!newDevice.name || !newDevice.ip) {
    ElMessage.warning('请填写设备名称和IP地址')
    return
  }

  let protocol = {
    type: newDevice.protocolType,
    config: {}
  }

  switch (newDevice.protocolType) {
    case 'Modbus TCP':
      protocol.config = {
        type: 'TCP',
        host: newDevice.modbustcp.host || newDevice.ip,
        tcpPort: newDevice.modbustcp.port
      }
      break
    case 'Modbus RTU':
      protocol.config = {
        type: 'RTU',
        ...newDevice.modbusrtu
      }
      break
    case 'MQTT':
      protocol.config = { ...newDevice.mqtt }
      break
    case 'HTTPS':
      protocol.config = { ...newDevice.https }
      break
  }

  edgeDevicesStore.addDevice({
    name: newDevice.name,
    ip: newDevice.ip,
    protocol
  })

  showAddDialog.value = false
  ElMessage.success('设备添加成功')
}

// 处理连接设备
const handleConnect = async (device) => {
  try {
    edgeDevicesStore.setDeviceLoading(device.id, true)
    
    const config = {
      protocol: device.protocol.type,
      ...device.protocol.config
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newStatus = !device.status
    edgeDevicesStore.updateDeviceStatus(device.id, newStatus)
    ElMessage.success(newStatus ? '设备已连接' : '设备已断开')
  } catch (error) {
    ElMessage.error('连接失败：' + error.message)
  } finally {
    edgeDevicesStore.setDeviceLoading(device.id, false)
  }
}

// 处理删除设备
const handleDeleteDevice = (device) => {
  edgeDevicesStore.removeDevice(device.id)
  ElMessage.success('设备删除成功')
}

// 处理文件上传
const handleUploadModel = (device) => {
  currentDevice.value = device
  fileInput.value.click()
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const fileType = file.name.split('.').pop().toLowerCase()
  const modelType = fileType === 'c' || fileType === 'h' ? 'C' :
                   fileType === 'iec' ? '61499' :
                   fileType === 'st' ? '61131' : null

  if (!modelType) {
    ElMessage.error('不支持的文件类型')
    return
  }

  edgeDevicesStore.addModel(currentDevice.value.id, {
    name: file.name,
    type: modelType,
    fileName: file.name,
    fileSize: file.size,
    uploadTime: new Date().toISOString()
  })

  ElMessage.success('模型上传成功')
  event.target.value = ''
}

// 组件卸载时断开所有连接
onUnmounted(() => {
  edgeDevicesStore.disconnectAllDevices()
})
</script>

<template>
  <div class="edge-devices">
    <div class="header-actions">
      <h2>边缘设备管理</h2>
      <el-button type="primary" @click="showAddDialog = true">添加设备</el-button>
    </div>

    <!-- 设备列表 -->
    <el-row :gutter="20">
      <el-col 
        :span="8" 
        v-for="device in edgeDevicesStore.devices" 
        :key="device.id"
      >
        <DeviceCard
          :device="device"
          @connect="handleConnect"
          @delete="handleDeleteDevice"
          @upload-model="handleUploadModel"
        />
      </el-col>
    </el-row>

    <!-- 添加设备对话框 -->
    <AddDeviceDialog
      v-model="showAddDialog"
      @add="handleAddDevice"
    />

    <!-- 添加隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      hidden
      accept=".c,.h,.iec,.st"
      @change="handleFileUpload"
    >
  </div>
</template>

<style scoped>
.edge-devices {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style> 