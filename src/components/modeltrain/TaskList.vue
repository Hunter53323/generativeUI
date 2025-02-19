<template>
  <el-table 
    v-loading="loading"
    :data="modelTrain.trainTasks" 
    border 
    style="width: 100%"
  >
    <el-table-column label="任务名称" prop="name" min-width="180" />
    <el-table-column label="数据集" prop="dataset" min-width="150" />
    <el-table-column label="模型类型" width="120">
      <template #default="{ row }">
        {{ getModelTypeLabel(row.modelType) }}
      </template>
    </el-table-column>
    <el-table-column label="训练服务器" width="150">
      <template #default="{ row }">
        {{ serverManager.getServerById(row.server)?.name || row.server }}
      </template>
    </el-table-column>
    <el-table-column label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="getStatusType(row.status)">
          {{ row.status }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="进度" width="200">
      <template #default="{ row }">
        <el-progress 
          :percentage="row.progress" 
          :status="getProgressStatus(row.status)"
        />
      </template>
    </el-table-column>
    <el-table-column label="操作" width="200" fixed="right">
      <template #default="{ row }">
        <el-button-group>
          <el-button 
            size="small"
            :type="row.status === 'running' ? 'danger' : 'primary'"
            @click="handleTaskAction(row)"
          >
            {{ row.status === 'running' ? '停止' : '开始' }}
          </el-button>
          <el-button 
            size="small"
            @click="$emit('view-details', row)"
          >
            详情
          </el-button>
          <el-button 
            size="small"
            type="danger"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </el-button-group>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useServerManagerStore } from '@/stores/serverManager'
import { useModelTrainStore } from '@/stores/modelTrain'

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:tasks', 'view-details'])
const serverManager = useServerManagerStore()
const modelTrain = useModelTrainStore()

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'info',
    'running': 'primary',
    'completed': 'success',
    'failed': 'danger',
    'stopped': 'warning'
  }
  return statusMap[status] || 'info'
}

const getProgressStatus = (status) => {
  if (status === 'completed') return 'success'
  if (status === 'failed') return 'exception'
  if (status === 'stopped') return 'warning'
  return ''
}

const getModelTypeLabel = (type) => {
  const typeMap = {
    'generative': '生成式模型',
    'neural_network': '神经网络模型',
    'reinforcement': '强化学习模型'
  }
  return typeMap[type] || type
}

const handleTaskAction = async (task) => {
  try {
    if (task.status === 'running') {
      await ElMessageBox.confirm('确定要停止训练任务吗？', '警告', {
        type: 'warning'
      })
      modelTrain.stopTask(task.id)
    } else {
      if (!modelTrain.canStartTask(task.id)) {
        ElMessage.error('所选服务器当前不可用')
        return
      }
      modelTrain.startTask(task.id)
    }
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const handleDelete = async (task) => {
  try {
    await ElMessageBox.confirm('确定要删除该训练任务吗？', '警告', {
      type: 'warning'
    })
    modelTrain.deleteTask(task.id)
  } catch (error) {
    // 用户取消删除
  }
}
</script> 