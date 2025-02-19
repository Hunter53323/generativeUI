<template>
  <el-table 
    v-loading="loading"
    :data="tasks" 
    border 
    style="width: 100%"
  >
    <el-table-column label="任务名称" prop="name" min-width="180" />
    <el-table-column label="数据集" prop="dataset" min-width="150" />
    <el-table-column label="模型类型" prop="modelType" width="120" />
    <el-table-column label="训练服务器" prop="server" width="150" />
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
import { ElMessage, ElMessageBox } from 'element-plus'

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

const handleTaskAction = async (task) => {
  try {
    if (task.status === 'running') {
      await ElMessageBox.confirm('确定要停止训练任务吗？', '警告', {
        type: 'warning'
      })
      task.status = 'stopped'
      ElMessage.success('已停止训练任务')
    } else {
      task.status = 'running'
      task.progress = 0
      ElMessage.success('已启动训练任务')
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
    const newTasks = props.tasks.filter(t => t.id !== task.id)
    emit('update:tasks', newTasks)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消删除
  }
}
</script> 