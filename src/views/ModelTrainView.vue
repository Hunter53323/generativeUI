<template>
  <div class="model-train">
    <div class="header">
      <h2>模型训练</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>新建训练任务
      </el-button>
    </div>

    <!-- 训练任务列表 -->
    <TaskList
      v-model:tasks="trainTasks"
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
        :servers="servers"
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
import { Plus } from '@element-plus/icons-vue'
import TaskList from '@/components/modeltrain/TaskList.vue'
import CreateTaskForm from '@/components/modeltrain/CreateTaskForm.vue'
import TaskDetails from '@/components/modeltrain/TaskDetails.vue'

// 页面状态
const loading = ref(false)
const showCreateDialog = ref(false)
const showDetails = ref(false)
const currentTask = ref(null)
const createFormRef = ref(null)

// 模拟数据
const trainTasks = ref([
  {
    id: 1,
    name: '异常检测模型训练',
    dataset: '设备运行数据集',
    modelType: 'LSTM',
    server: 'GPU-Server-01',
    status: 'running',
    progress: 45
  },
  {
    id: 2,
    name: '预测性维护模型',
    dataset: '历史故障数据',
    modelType: 'RandomForest',
    server: 'GPU-Server-02',
    status: 'completed',
    progress: 100
  }
])

// 模型类型选项
const modelTypes = [
  { label: 'LSTM', value: 'lstm' },
  { label: '随机森林', value: 'random_forest' },
  { label: '神经网络', value: 'neural_network' },
  { label: 'XGBoost', value: 'xgboost' }
]

// 训练服务器选项
const servers = [
  { id: 1, name: 'GPU-Server-01', status: 'online' },
  { id: 2, name: 'GPU-Server-02', status: 'online' },
  { id: 3, name: 'CPU-Server-01', status: 'offline' }
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
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const form = createFormRef.value.form
    const newTask = {
      id: trainTasks.value.length + 1,
      ...form,
      status: 'pending',
      progress: 0
    }
    trainTasks.value.push(newTask)
    
    showCreateDialog.value = false
    ElMessage.success('创建任务成功')
  } catch (error) {
    console.error('创建任务失败:', error)
    ElMessage.error('创建任务失败')
  } finally {
    loading.value = false
  }
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
</style> 