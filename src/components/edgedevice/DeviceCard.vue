<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import ModelList from './ModelList.vue'

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['connect', 'delete', 'upload-model'])

const handleConnect = () => {
  emit('connect', props.device)
}

const handleDelete = () => {
  ElMessageBox.confirm(
    '确定要删除该设备吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    emit('delete', props.device)
  }).catch(() => {})
}

const handleUploadClick = () => {
  emit('upload-model', props.device)
}
</script>

<template>
  <el-card class="device-card">
    <div class="card-header">
      <span class="device-name">{{ device.name }}</span>
      <div class="device-actions">
        <el-button 
          :type="device.status ? 'success' : 'primary'"
          :loading="device.loading"
          size="small"
          @click="handleConnect"
        >
          {{ device.status ? '断开' : '连接' }}
        </el-button>
        <el-button 
          type="danger" 
          size="small"
          @click="handleDelete"
        >
          删除
        </el-button>
      </div>
    </div>

    <div class="device-info">
      <p>IP地址：{{ device.ip }}</p>
      <p>协议类型：{{ device.protocol.type }}</p>
      <p class="protocol-params">
        {{ JSON.stringify(device.protocol.config, null, 2) }}
      </p>
    </div>

    <ModelList 
      :device="device"
      @upload="handleUploadClick"
    />
  </el-card>
</template>

<style scoped>
.device-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.device-name {
  font-size: 16px;
  font-weight: bold;
}

.device-info {
  margin-bottom: 15px;
}

.device-info p {
  margin: 5px 0;
  color: #666;
}

.device-actions {
  display: flex;
  gap: 10px;
}

.protocol-params {
  font-family: monospace;
  background-color: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 5px;
  font-size: 13px;
  color: #606266;
}
</style> 