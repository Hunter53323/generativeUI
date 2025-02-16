<script setup>
import { useEdgeDevicesStore } from '@/stores/edgeDevices'

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['upload'])
const edgeDevicesStore = useEdgeDevicesStore()

const handleActivateModel = (modelId) => {
  edgeDevicesStore.activateModel(props.device.id, modelId)
}

const handleDeleteModel = (modelId) => {
  edgeDevicesStore.removeModel(props.device.id, modelId)
}
</script>

<template>
  <div class="model-management">
    <div class="model-header">
      <h4>模型管理</h4>
      <el-button 
        type="primary" 
        size="small"
        @click="$emit('upload')"
      >
        上传模型
      </el-button>
    </div>

    <div v-if="device.models.length > 0" class="model-list">
      <div 
        v-for="model in device.models" 
        :key="model.id"
        class="model-item"
        :class="{ active: model.active }"
      >
        <div class="model-info">
          <div class="model-name">
            <span>{{ model.name }}</span>
            <el-tag size="small">{{ model.type }}</el-tag>
          </div>
          <div class="model-details">
            <span>{{ (model.fileSize / 1024).toFixed(2) }}KB</span>
            <span>{{ new Date(model.uploadTime).toLocaleString() }}</span>
          </div>
        </div>
        <div class="model-actions">
          <el-button 
            type="success" 
            size="small"
            :disabled="model.active"
            @click="handleActivateModel(model.id)"
          >
            {{ model.active ? '运行中' : '启动' }}
          </el-button>
          <el-button 
            type="danger" 
            size="small"
            @click="handleDeleteModel(model.id)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>
    <div v-else class="empty-models">
      暂无模型
    </div>
  </div>
</template>

<style scoped>
.model-management {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.model-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.model-item.active {
  border-color: #67c23a;
  background-color: #f0f9eb;
}

.model-info {
  flex: 1;
}

.model-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.model-details {
  display: flex;
  gap: 15px;
  color: #909399;
  font-size: 12px;
}

.model-actions {
  display: flex;
  gap: 8px;
  margin-left: 15px;
}

.empty-models {
  text-align: center;
  color: #909399;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style> 