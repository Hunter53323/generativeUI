<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Cpu, Plus, Setting, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useServerManagerStore } from '@/stores/serverManager'

const props = defineProps({
  servers: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:servers'])
const localServers = ref([...props.servers])
const addServerDialogVisible = ref(false)
const editServerDialogVisible = ref(false)
const currentServer = ref(null)
const loadIntervals = ref({}) // 存储每个服务器的负载更新定时器

const newServer = ref({
  name: '',
  status: 'idle',
  ip: '',
  port: '',
  load: '0%',
  memory: '0/32GB'
})

const serverTypes = [
  { label: '训练服务器', value: 'training' },
  { label: '摊销服务器', value: 'deploy' }
]

const statusOptions = [
  { label: '空闲', value: 'idle' },
  { label: '训练中', value: 'training' },
  { label: '摊销中', value: 'deploying' }
]

const serverManager = useServerManagerStore()
const showAddDialog = ref(false)
const formRef = ref(null)

const serverForm = ref({
  name: '',
  type: '',
  ip: '',
  port: ''
})

const rules = {
  name: [
    { required: true, message: '请输入服务器名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择服务器类型', trigger: 'change' }
  ],
  ip: [
    { required: true, message: '请输入IP地址', trigger: 'blur' }
  ],
  port: [
    { required: true, message: '请输入端口号', trigger: 'blur' }
  ]
}

const getStatusType = (status) => {
  const statusMap = {
    'online': 'success',
    'offline': 'danger',
    'busy': 'warning',
    'maintenance': 'info'
  }
  return statusMap[status]
}

const getServerTypeTag = (type) => {
  const typeMap = {
    'gpu': 'danger',
    'cpu': 'primary',
    'tpu': 'warning'
  }
  return typeMap[type]
}

const getResourceStatus = (value) => {
  if (value >= 90) return 'exception'
  if (value >= 70) return 'warning'
  return ''
}

const getStatusText = (status) => {
  const texts = {
    idle: '空闲',
    training: '训练中',
    deploying: '摊销中'
  }
  return texts[status] || status
}

// 根据服务器状态获取负载范围
const getLoadRange = (status) => {
  switch (status) {
    case 'idle':
      return { min: 5, max: 15 }  // 空闲状态：5-15%
    case 'training':
      return { min: 70, max: 95 } // 训练状态：70-95%
    case 'deploying':
      return { min: 40, max: 65 } // 摊销状态：40-65%
    default:
      return { min: 0, max: 10 }
  }
}

// 更新服务器负载
const updateServerLoad = (server) => {
  const range = getLoadRange(server.status)
  const variation = Math.random() * (range.max - range.min)
  return `${Math.floor(range.min + variation)}%`
}

// 开始负载监控
const startLoadMonitoring = (server) => {
  if (loadIntervals.value[server.name]) {
    clearInterval(loadIntervals.value[server.name])
  }
  
  // 立即更新一次负载
  const index = localServers.value.findIndex(s => s.name === server.name)
  if (index !== -1) {
    localServers.value[index] = {
      ...localServers.value[index],
      load: updateServerLoad(server)
    }
  }
  
  // 设置定时更新
  loadIntervals.value[server.name] = setInterval(() => {
    const index = localServers.value.findIndex(s => s.name === server.name)
    if (index !== -1) {
      localServers.value[index] = {
        ...localServers.value[index],
        load: updateServerLoad(localServers.value[index])
      }
      emit('update:servers', localServers.value)
    }
  }, 3000)
}

const handleAddServer = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    const newServer = {
      id: Date.now().toString(),
      ...serverForm.value
    }
    
    if (serverManager.addServer(newServer)) {
      ElMessage.success('添加服务器成功')
      showAddDialog.value = false
      serverForm.value = {
        name: '',
        type: '',
        ip: '',
        port: ''
      }
    }
  } catch (error) {
    console.error('添加服务器失败:', error)
  }
}

const handleEditServer = (server) => {
  currentServer.value = { ...server }
  editServerDialogVisible.value = true
}

const handleUpdateServer = () => {
  const index = localServers.value.findIndex(s => s.name === currentServer.value.name)
  if (index !== -1) {
    localServers.value[index] = { ...currentServer.value }
    startLoadMonitoring(currentServer.value) // 重新开始负载监控
    emit('update:servers', localServers.value)
    editServerDialogVisible.value = false
    ElMessage.success('服务器更新成功')
  }
}

const handleDeleteServer = (server) => {
  ElMessageBox.confirm(
    '确定要删除该服务器吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    if (loadIntervals.value[server.name]) {
      clearInterval(loadIntervals.value[server.name])
      delete loadIntervals.value[server.name]
    }
    localServers.value = localServers.value.filter(s => s.name !== server.name)
    emit('update:servers', localServers.value)
    ElMessage.success('服务器删除成功')
  }).catch(() => {})
}

const handleWorkStatusChange = (server, newStatus) => {
  serverManager.updateWorkStatus(server.id, newStatus)
  ElMessage.success(`已更新服务器工作状态为: ${serverManager.getWorkStatusText(newStatus)}`)
}

// 初始化现有服务器的负载监控
onMounted(() => {
  localServers.value.forEach(server => {
    startLoadMonitoring(server)
  })
})

// 组件销毁时清理定时器
onBeforeUnmount(() => {
  Object.values(loadIntervals.value).forEach(interval => {
    clearInterval(interval)
  })
})
</script>

<template>
  <div class="server-status">
    <div class="header">
      <h3>服务器状态</h3>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>添加服务器
      </el-button>
    </div>

    <el-table :data="serverManager.servers" border style="width: 100%">
      <el-table-column label="名称" prop="name" min-width="120" />
      <el-table-column label="类型" width="80">
        <template #default="{ row }">
          <el-tag :type="getServerTypeTag(row.type)">
            {{ row.type.toUpperCase() }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <div class="status-container">
            <el-tag :type="serverManager.getWorkStatusType(row.workStatus)" class="status-tag">
              {{ serverManager.getWorkStatusText(row.workStatus) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="资源使用" min-width="280">
        <template #default="{ row }">
          <div class="metrics">
            <div class="metric-item">
              <span>CPU:</span>
              <el-progress 
                :percentage="row.metrics.cpu"
                :status="getResourceStatus(row.metrics.cpu)"
              />
            </div>
            <div class="metric-item">
              <span>内存:</span>
              <el-progress 
                :percentage="row.metrics.memory"
                :status="getResourceStatus(row.metrics.memory)"
              />
            </div>
            <div v-if="row.type === 'gpu'" class="metric-item">
              <span>GPU:</span>
              <el-progress 
                :percentage="row.metrics.gpu"
                :status="getResourceStatus(row.metrics.gpu)"
              />
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="160">
        <template #default="{ row }">
          {{ new Date(row.lastUpdated).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <div class="operation-container">
            <el-select 
              v-model="row.workStatus" 
              size="small"
              style="width: 90px"
              @change="(val) => handleWorkStatusChange(row, val)"
            >
              <el-option
                v-for="status in Object.values(serverManager.WORK_STATUS)"
                :key="status"
                :label="status"
                :value="status"
              />
            </el-select>
            <el-button 
              size="small"
              type="danger"
              @click="handleDeleteServer(row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加服务器对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加服务器"
      width="500px"
    >
      <el-form 
        ref="formRef"
        :model="serverForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="服务器名称" prop="name">
          <el-input v-model="serverForm.name" />
        </el-form-item>
        <el-form-item label="服务器类型" prop="type">
          <el-select v-model="serverForm.type">
            <el-option label="GPU服务器" value="gpu" />
            <el-option label="CPU服务器" value="cpu" />
            <el-option label="TPU服务器" value="tpu" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="serverForm.ip" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input v-model="serverForm.port" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleAddServer">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.server-status {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-item span {
  width: 50px;
  color: #606266;
}

.metric-item :deep(.el-progress) {
  width: calc(100% - 50px);
  margin: 0;
}

.status-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-tag {
  min-width: 50px;
  text-align: center;
  padding: 0 8px;
}

.operation-container {
  display: flex;
  gap: 4px;
  align-items: center;
}

:deep(.el-button--small) {
  padding: 5px 11px;
}
</style> 