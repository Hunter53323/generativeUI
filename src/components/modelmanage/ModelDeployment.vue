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

    <!-- 模型发布区域 -->
    <div class="section">
      <h3>模型发布</h3>
      <div class="deploy-form">
        <el-form :model="deployForm" label-width="100px" class="deploy-form-content">
          <el-form-item label="摊销服务器">
            <el-select
              v-model="selectedServer"
              placeholder="请选择"
              class="deploy-select"
            >
              <el-option
                v-for="item in serverOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="导出格式">
            <el-select
              v-model="selectedFormat"
              placeholder="请选择"
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
              :disabled="!selectedModel || !selectedFormat || !selectedServer || deploymentState.isDeploying"
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

      <!-- 摊销模型库 -->
      <div class="deployed-models">
        <h4>摊销模型库</h4>
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
                {{ serverOptions.find(s => s.value === scope.row.server)?.label }}
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
import { 
  selectedModel,
  deployedModels,
  serverOptions,
  exportFormats,
  modelTypes,
  addDeployedModel,
  deploymentState,
  startDeployment,
  cancelDeployment
} from '@/stores/modelmanage'

const selectedFormat = ref('')
const selectedServer = ref('')

const handleDeploy = () => {
  if (!selectedModel.value || !selectedFormat.value || !selectedServer.value) {
    ElMessage.warning('请选择模型、导出格式和服务器')
    return
  }
  
  ElMessage.info('正在进行模型摊销，请稍候...')
  startDeployment()
  
  // 一分钟后完成部署
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
      format: selectedFormat.value,
      server: selectedServer.value,
      deployTime: new Date().toLocaleString(),
      downloadUrl: fileMap[selectedFormat.value]
    }
    
    addDeployedModel(deployedModel)
    ElMessage.success(`模型已在${selectedServer.value === 'server1' ? '机架服务器1' : '机架服务器2'}上完成摊销`)
    
    // 重置选择
    selectedFormat.value = ''
    selectedServer.value = ''
  }, 60000) // 改为60秒
}

const handleCancelDeploy = () => {
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

.deploy-form {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
}

.deploy-form-content {
  max-width: 400px;
}

.deploy-select {
  width: 100%;
}

.section h3 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #606266;
}

.deployed-models {
  margin-top: 30px;
}

.deployed-models h4 {
  margin-bottom: 15px;
  font-size: 14px;
  color: #606266;
}

.selected-model {
  margin-bottom: 20px;
}

.empty-hint {
  text-align: center;
  color: #909399;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

:deep(.el-descriptions) {
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.deploy-form-content .el-form-item:last-child {
  margin-bottom: 0;
  display: flex;
  gap: 12px;
}
</style> 