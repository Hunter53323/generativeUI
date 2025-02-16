<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import ModelList from './ModelList.vue'

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['connect', 'delete', 'upload-model'])

// 设备信息对话框
const infoDialogVisible = ref(false)
const deviceInfo = ref(null)
const loading = ref(false)

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

// 查询设备信息
const handleInfoClick = async () => {
  if (!props.device.status) {
    ElMessage.warning('请先连接设备')
    return
  }
  
  loading.value = true
  try {
    // 模拟从边缘服务器获取数据
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 生成10-100范围内的频率(KHz)
    const frequency = Math.floor(Math.random() * 10 + 10)
    
    deviceInfo.value = {
      frequency,
      lastUpdate: new Date().toLocaleString()
    }
    infoDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取设备信息失败')
  } finally {
    loading.value = false
  }
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
          type="info"
          size="small"
          :icon="InfoFilled"
          :disabled="!device.status"
          :loading="loading"
          @click="handleInfoClick"
        >
          信息
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

    <!-- 设备信息对话框 -->
    <el-dialog
      v-model="infoDialogVisible"
      title="设备信息"
      width="400px"
    >
      <template v-if="deviceInfo">
        <div class="info-item">
          <span class="info-label">采样/控制频率：</span>
          <span class="info-value">{{ deviceInfo.frequency }} KHz</span>
        </div>
        <div class="info-item">
          <span class="info-label">更新时间：</span>
          <span class="info-value">{{ deviceInfo.lastUpdate }}</span>
        </div>
      </template>
    </el-dialog>
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
  gap: 8px;
}

.device-actions .el-button {
  padding: 8px 12px;
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

.info-item {
  margin: 12px 0;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.info-label {
  width: 100px;
  color: #606266;
}

.info-value {
  color: #303133;
  font-family: monospace;
  font-size: 15px;
}
</style> 