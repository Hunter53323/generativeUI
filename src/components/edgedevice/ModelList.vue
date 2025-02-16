<script setup>
import { ref } from 'vue'
import { useEdgeDevicesStore } from '@/stores/edgeDevices'
import { ElMessage } from 'element-plus'

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['upload'])
const edgeDevicesStore = useEdgeDevicesStore()

// 灵敏度配置对话框
const sensitivityDialogVisible = ref(false)
const currentModel = ref(null)

// 切换状态
const switchingModel = ref(false)
const currentSwitchingId = ref(null)

const SENSITIVITY_OPTIONS = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' }
]

const handleActivateModel = async (modelId) => {
  if (!props.device.status) {
    ElMessage.warning('请先连接设备')
    return
  }
  if (switchingModel.value) return
  
  switchingModel.value = true
  currentSwitchingId.value = modelId
  
  try {
    // 模拟切换过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    edgeDevicesStore.activateModel(props.device.id, modelId)
    ElMessage.success('模型切换成功')
  } catch (error) {
    ElMessage.error('模型切换失败')
  } finally {
    switchingModel.value = false
    currentSwitchingId.value = null
  }
}

const handleDeleteModel = (modelId) => {
  if (!props.device.status) {
    ElMessage.warning('请先连接设备')
    return
  }
  if (props.device.models.find(m => m.id === modelId)?.isDefault) {
    ElMessage.warning('默认模型不能删除')
    return
  }
  edgeDevicesStore.removeModel(props.device.id, modelId)
}

const handleConfigSensitivity = (model) => {
  if (!props.device.status) {
    ElMessage.warning('请先连接设备')
    return
  }
  currentModel.value = model
  sensitivityDialogVisible.value = true
}

const handleSaveSensitivity = () => {
  edgeDevicesStore.updateModelSensitivity(
    props.device.id,
    currentModel.value.id,
    currentModel.value.sensitivity
  )
  sensitivityDialogVisible.value = false
  ElMessage.success('灵敏度配置已更新')
}
</script>

<template>
  <div class="model-management">
    <div class="model-header">
      <h4>模型管理</h4>
      <el-button 
        type="primary" 
        size="small"
        :disabled="!device.status"
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
        :class="{ 
          active: model.active, 
          default: model.isDefault,
          switching: currentSwitchingId === model.id,
          'not-connected': !device.status
        }"
      >
        <div class="model-info">
          <div class="model-name">
            <span>{{ model.name }}</span>
            <el-tag size="small">{{ model.type }}</el-tag>
            <el-tag 
              v-if="model.isDefault" 
              size="small" 
              type="success"
            >
              默认
            </el-tag>
          </div>
          <div class="model-details">
            <span>{{ (model.fileSize / 1024).toFixed(2) }}KB</span>
            <span>{{ new Date(model.uploadTime).toLocaleString() }}</span>
            <span>灵敏度: {{ model.sensitivity || '中' }}</span>
          </div>
        </div>
        <div class="model-actions">
          <el-button 
            type="success" 
            size="small"
            :disabled="model.active || switchingModel || !device.status"
            :loading="currentSwitchingId === model.id"
            @click="handleActivateModel(model.id)"
          >
            {{ model.active ? '已选中' : '选中' }}
          </el-button>
          <el-button
            type="info"
            size="small"
            :disabled="switchingModel || !device.status"
            @click="handleConfigSensitivity(model)"
          >
            配置
          </el-button>
          <el-button 
            type="danger" 
            size="small"
            :disabled="model.isDefault || switchingModel || !device.status"
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

    <!-- 灵敏度配置对话框 -->
    <el-dialog
      v-model="sensitivityDialogVisible"
      title="灵敏度配置"
      width="360px"
    >
      <template v-if="currentModel">
        <div class="sensitivity-config">
          <span class="config-label">灵敏度级别：</span>
          <el-radio-group v-model="currentModel.sensitivity">
            <el-radio-button 
              v-for="option in SENSITIVITY_OPTIONS"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="sensitivityDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveSensitivity">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
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

.model-item.default {
  border-style: dashed;
  border-color: #409eff;
}

.model-item.switching {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.model-item.not-connected {
  opacity: 0.7;
  cursor: not-allowed;
}

.model-item.not-connected .model-info {
  color: #909399;
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

.sensitivity-config {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.config-label {
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 在切换过程中禁用鼠标事件 */
.model-item.switching .model-actions {
  pointer-events: none;
}

/* 切换过程中的按钮样式 */
.model-actions .el-button.is-loading {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

/* 未连接时禁用鼠标事件 */
.model-item.not-connected .model-actions {
  pointer-events: none;
}
</style> 