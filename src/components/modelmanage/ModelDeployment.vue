<template>
  <el-card class="model-card">
    <template #header>
      <div class="card-header">
        <span class="title">模型摊销管理</span>
      </div>
    </template>

    <!-- 当前选中模型 -->
    <div class="section">
      <h3>当前选中模型</h3>
      <div v-if="selectedModel" class="selected-model">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模型名称">
            {{ selectedModel.name }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="selectedModel.type === 'diagnostic' ? 'success' : 'warning'">
              {{ modelTypes.find(t => t.value === selectedModel.type)?.label }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ selectedModel.description }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-else class="empty-hint">
        请先从模型验证管理中选择一个模型
      </div>
    </div>

    <!-- 模型摊销区域 -->
    <div class="section">
      <h3>模型摊销</h3>
      <div class="deploy-form">
        <el-form 
          ref="deployFormRef"
          :model="deployForm" 
          :rules="rules"
          label-width="100px" 
          class="deploy-form-content"
        >
          <el-form-item label="摊销服务器" prop="server">
            <el-select 
              v-model="deployForm.server" 
              placeholder="请选择摊销服务器"
              class="deploy-select"
            >
              <el-option 
                v-for="server in serverManager.deploymentServers"
                :key="server.id" 
                :label="server.name" 
                :value="server.id"
              >
                <div class="server-option">
                  <span>{{ server.name }}</span>
                  <div class="server-info">
                    <el-tag size="small" :type="getStatusType(server.status)">
                      {{ server.status }}
                    </el-tag>
                    <span class="resource-info">
                      CPU: {{ server.metrics.cpu }}%
                    </span>
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="导出格式" prop="format">
            <el-select
              v-model="deployForm.format"
              placeholder="请选择导出格式"
              class="deploy-select"
            >
              <el-option
                v-for="item in exportFormats"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleDeploy" 
              :loading="deploymentState.isDeploying"
              :disabled="!selectedModel || !deployForm.format || !deployForm.server || deploymentState.isDeploying"
            >
              {{ deploymentState.isDeploying ? `摊销中 ${deploymentState.progress}%` : '开始摊销' }}
            </el-button>
            <el-button 
              v-if="deploymentState.isDeploying"
              type="danger" 
              @click="handleCancelDeploy"
            >
              取消摊销
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 已摊销模型列表 -->
      <div class="deployed-models">
        <h4>已摊销模型</h4>
        <el-table :data="deployedModels" style="width: 100%">
          <el-table-column prop="name" label="模型名称" show-overflow-tooltip />
          <el-table-column prop="type" label="类型">
            <template #default="scope">
              <el-tag :type="scope.row.type === 'diagnostic' ? 'success' : 'warning'">
                {{ modelTypes.find(t => t.value === scope.row.type)?.label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="format" label="格式">
            <template #default="scope">
              <el-tag type="info">
                {{ exportFormats.find(f => f.value === scope.row.format)?.label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="server" label="服务器">
            <template #default="scope">
              <el-tag type="success">
                {{ serverManager.getServerById(scope.row.server)?.name || scope.row.server }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deployTime" label="摊销时间" width="160" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                link
                @click="handleModelDownload(scope.row)"
              >
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useServerManagerStore } from '@/stores/serverManager'
import { 
  selectedModel,
  deployedModels,
  exportFormats,
  modelTypes,
  addDeployedModel,
  deploymentState,
  startDeployment,
  cancelDeployment
} from '@/stores/modelmanage'

const serverManager = useServerManagerStore()
const deployFormRef = ref(null)

const deployForm = ref({
  server: '',
  format: ''
})

const rules = {
  server: [
    { required: true, message: '请选择摊销服务器', trigger: 'change' }
  ],
  format: [
    { required: true, message: '请选择导出格式', trigger: 'change' }
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

const handleDeploy = async () => {
  if (!deployFormRef.value) return
  
  try {
    await deployFormRef.value.validate()
    
    if (!selectedModel.value) {
      ElMessage.warning('请先选择要摊销的模型')
      return
    }

    // 检查服务器是否可用
    const server = serverManager.getServerById(deployForm.value.server)
    if (!server) {
      ElMessage.error('所选服务器不存在')
      return
    }

    // 更新服务器状态为摊销中
    serverManager.updateWorkStatus(server.id, serverManager.WORK_STATUS.DEPLOYING)
    
    ElMessage.info('正在进行模型摊销，请稍候...')
    startDeployment()
    
    // 模拟摊销过程
    setTimeout(() => {
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0]
      const fileMap = {
        'iec61499': '/models/control_61499.fbt',
        'iec61131': '/models/control_61131.xml',
        'c': '/models/control.c'
      }
      
      const deployedModel = {
        id: Date.now(),
        originalName: selectedModel.value.name,
        name: `${selectedModel.value.name}_${timestamp}`,
        type: selectedModel.value.type,
        format: deployForm.value.format,
        server: deployForm.value.server,
        deployTime: new Date().toLocaleString(),
        downloadUrl: fileMap[deployForm.value.format]
      }
      
      addDeployedModel(deployedModel)
      // 摊销完成后将服务器状态改回空闲
      serverManager.updateWorkStatus(server.id, serverManager.WORK_STATUS.IDLE)
      ElMessage.success('模型摊销完成')
      
      // 重置表单
      deployForm.value = {
        server: '',
        format: ''
      }
    }, 60000) // 60秒后完成
  } catch (error) {
    console.error('摊销失败:', error)
    ElMessage.error('摊销失败，请重试')
  }
}

const handleCancelDeploy = () => {
  // 取消摊销时，将服务器状态改回空闲
  if (deployForm.value.server) {
    serverManager.updateWorkStatus(deployForm.value.server, serverManager.WORK_STATUS.IDLE)
  }
  cancelDeployment()
  ElMessage.info('已取消模型摊销')
}

const handleModelDownload = (model) => {
  const link = document.createElement('a')
  link.href = model.downloadUrl
  link.download = model.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('开始下载模型')
}
</script>

<style scoped>
.model-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.section {
  margin-bottom: 24px;
}

.section h3 {
  margin-bottom: 16px;
  font-size: 16px;
  color: #606266;
}

.deploy-form {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
}

.deploy-form-content {
  max-width: 500px;
}

.deploy-select {
  width: 100%;
}

.empty-hint {
  text-align: center;
  color: #909399;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.server-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.server-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-info {
  font-size: 0.8em;
  color: #909399;
}

:deep(.el-descriptions) {
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
</style> 