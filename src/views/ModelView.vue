<template>
  <div class="model-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <ModelValidation 
          :model-library="modelLibrary"
          @update:model-library="modelLibrary = $event"
          @select-model="handleModelSelect"
        />
      </el-col>
      <el-col :span="12">
        <ModelDeployment 
          :selected-model="selectedModel"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import ModelValidation from '@/components/modelmanage/ModelValidation.vue'
import ModelDeployment from '@/components/modelmanage/ModelDeployment.vue'

const selectedModel = ref(null)
const modelLibrary = ref([
  {
    id: 1,
    name: '故障诊断模型 V1.0',
    type: 'diagnostic',
    description: '基于深度学习的电机故障诊断模型',
    uploadTime: '2024-01-15 14:30:00',
    size: '2.5MB',
    author: '张工'
  },
  {
    id: 2,
    name: '预测性维护模型 V1.0',
    type: 'maintenance',
    description: '设备预测性维护模型，基于LSTM',
    uploadTime: '2024-01-16 09:15:00',
    size: '3.1MB',
    author: '李工'
  }
])

const handleModelSelect = (model) => {
  selectedModel.value = model
}
</script>

<style scoped>
.model-container {
  padding: 20px;
}

:deep(.el-row) {
  margin-bottom: 20px;
}
</style>
