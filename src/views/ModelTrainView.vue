<template>
  <div class="model-train">
    <div class="header">
      <h2>模型训练</h2>
      <div class="header-buttons">
        <el-button type="primary" @click="handleFullFeature">
          <el-icon><Monitor /></el-icon>完整功能
        </el-button>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>新建训练任务
        </el-button>
      </div>
    </div>

    <!-- 训练任务列表 -->
    <TaskList
      v-model:tasks="modelTrain.trainTasks"
      :loading="loading"
      @view-details="handleViewDetails"
    />

    <!-- 新建任务对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建训练任务"
      width="60%"
    >
      <CreateTaskForm
        ref="createFormRef"
        :model-types="modelTypes"
        :available-features="availableFeatures"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreateTask">
            创建
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="showDetails"
      title="训练任务详情"
      width="70%"
    >
      <TaskDetails
        v-if="currentTask"
        :task="currentTask"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Monitor } from '@element-plus/icons-vue'
import TaskList from '@/components/modeltrain/TaskList.vue'
import CreateTaskForm from '@/components/modeltrain/CreateTaskForm.vue'
import TaskDetails from '@/components/modeltrain/TaskDetails.vue'
import { useModelTrainStore } from '@/stores/modelTrain'
import { config } from '@/config/api'

const modelTrain = useModelTrainStore()
const loading = ref(false)
const showCreateDialog = ref(false)
const showDetails = ref(false)
const currentTask = ref(null)
const createFormRef = ref(null)

// 模型类型选项
const modelTypes = [
  { label: '生成式模型', value: 'generative' },
  { label: '神经网络模型', value: 'neural_network' },
  { label: '强化学习模型', value: 'reinforcement' }
]

// 可用特征列表
const availableFeatures = [
  'temperature',
  'pressure',
  'vibration',
  'speed',
  'current',
  'voltage',
  'power'
]

// 查看任务详情
const handleViewDetails = (task) => {
  currentTask.value = task
  showDetails.value = true
}

// 创建任务
const handleCreateTask = async () => {
  const formRef = createFormRef.value?.formRef
  if (!formRef) return
  
  try {
    await formRef.validate()
    loading.value = true
    
    const form = createFormRef.value.form
    modelTrain.addTask({
      name: form.name,
      dataset: `${form.dataSource}数据集`,
      modelType: form.modelType,
      server: form.server
    })
    
    showCreateDialog.value = false
    ElMessage.success('创建任务成功')
  } catch (error) {
    console.error('创建任务失败:', error)
    ElMessage.error('创建任务失败')
  } finally {
    loading.value = false
  }
}

// 处理完整功能按钮点击
const handleFullFeature = () => {
  window.open(config.FULL_FEATURE_URL, '_blank')
}
</script>

<style scoped>
.model-train {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.header-buttons {
  display: flex;
  gap: 12px;
}
</style> 