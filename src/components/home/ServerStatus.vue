<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Cpu, Plus, Setting, Delete } from '@element-plus/icons-vue'

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

const getStatusType = (status) => {
  const types = {
    idle: 'info',
    training: 'warning',
    deploying: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    idle: '空闲',
    training: '训练中',
    deploying: '摊销中'
  }
  return texts[status] || status
}

// 更新服务器负载
const updateServerLoad = (server) => {
  if (server.status === 'idle') {
    return '10%'
  }
  
  const baseLoad = server.status === 'training' ? 70 : 50
  const variation = Math.floor(Math.random() * 20)
  return `${baseLoad + variation}%`
}

// 开始负载监控
const startLoadMonitoring = (server) => {
  if (loadIntervals.value[server.name]) {
    clearInterval(loadIntervals.value[server.name])
  }
  
  if (server.status !== 'idle') {
    loadIntervals.value[server.name] = setInterval(() => {
      const index = localServers.value.findIndex(s => s.name === server.name)
      if (index !== -1) {
        localServers.value[index] = {
          ...localServers.value[index],
          load: updateServerLoad(server)
        }
        emit('update:servers', localServers.value)
      }
    }, 3000)
  }
}

const handleAddServer = () => {
  if (!newServer.value.name || !newServer.value.ip || !newServer.value.port) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const server = {
    ...newServer.value,
    load: '0%',
    memory: '0/32GB'
  }
  
  localServers.value.push(server)
  startLoadMonitoring(server)
  emit('update:servers', localServers.value)
  addServerDialogVisible.value = false
  
  newServer.value = {
    name: '',
    status: 'idle',
    ip: '',
    port: '',
    load: '0%',
    memory: '0/32GB'
  }
  ElMessage.success('服务器添加成功')
}

const handleEditServer = (server) => {
  currentServer.value = { ...server }
  editServerDialogVisible.value = true
}

const handleUpdateServer = () => {
  const index = localServers.value.findIndex(s => s.name === currentServer.value.name)
  if (index !== -1) {
    localServers.value[index] = { ...currentServer.value }
    startLoadMonitoring(currentServer.value)
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
  <el-card shadow="hover" class="status-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <el-icon><Cpu /></el-icon>
          <span>服务器状态监控</span>
        </div>
        <el-button 
          type="primary" 
          size="small" 
          @click="addServerDialogVisible = true"
          :icon="Plus"
        >
          添加服务器
        </el-button>
      </div>
    </template>
    
    <div class="server-list">
      <div v-for="server in localServers" :key="server.name" class="server-item">
        <div class="server-info">
          <div class="server-title">
            <h4>{{ server.name }}</h4>
            <small class="server-address">{{ server.ip }}:{{ server.port }}</small>
          </div>
          <div class="server-actions">
            <el-button 
              type="primary" 
              :icon="Setting"
              circle
              size="small"
              @click="handleEditServer(server)"
            />
            <el-button 
              type="danger" 
              :icon="Delete"
              circle
              size="small"
              @click="handleDeleteServer(server)"
            />
          </div>
        </div>
        <div class="server-status">
          <el-tag :type="getStatusType(server.status)" size="small">
            {{ getStatusText(server.status) }}
          </el-tag>
        </div>
        <div class="server-metrics">
          <span>负载: {{ server.load }}</span>
          <span>内存: {{ server.memory }}</span>
        </div>
        <el-progress 
          :percentage="parseInt(server.load)" 
          :type="'line'"
          :status="server.status === 'training' ? 'warning' : server.status === 'deploying' ? 'success' : ''"
        />
      </div>
    </div>

    <!-- 添加服务器对话框 -->
    <el-dialog
      v-model="addServerDialogVisible"
      title="添加服务器"
      width="30%"
    >
      <el-form :model="newServer" label-width="100px">
        <el-form-item label="服务器名称">
          <el-input v-model="newServer.name" />
        </el-form-item>
        <el-form-item label="服务器类型">
          <el-select v-model="newServer.type" placeholder="请选择服务器类型">
            <el-option
              v-for="item in serverTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="newServer.ip" placeholder="例如: 192.168.1.100" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input v-model="newServer.port" placeholder="例如: 8080" />
        </el-form-item>
        <el-form-item label="初始状态">
          <el-select v-model="newServer.status" placeholder="请选择服务器状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addServerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddServer">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑服务器对话框 -->
    <el-dialog
      v-model="editServerDialogVisible"
      title="编辑服务器"
      width="30%"
    >
      <el-form v-if="currentServer" :model="currentServer" label-width="100px">
        <el-form-item label="服务器名称">
          <el-input v-model="currentServer.name" />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="currentServer.ip" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input v-model="currentServer.port" />
        </el-form-item>
        <el-form-item label="服务器状态">
          <el-select v-model="currentServer.status">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editServerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateServer">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.status-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.server-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.server-item {
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.server-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.server-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.server-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.server-title h4 {
  margin: 0;
  color: #303133;
}

.server-address {
  color: #909399;
  font-size: 12px;
}

.server-actions {
  display: flex;
  gap: 5px;
}

.server-status {
  margin-bottom: 10px;
}

.server-metrics {
  display: flex;
  gap: 20px;
  color: #606266;
  font-size: 13px;
  margin-bottom: 10px;
}

:deep(.el-progress-bar__inner) {
  transition: all 0.3s ease;
}

:deep(.el-progress--line) {
  margin-bottom: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}
</style> 