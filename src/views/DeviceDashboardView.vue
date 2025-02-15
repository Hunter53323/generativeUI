<template>
    <div class="model-container">
      <el-card class="model-card">
        <template #header>
          <div class="card-header">
            <span class="title">模型管理</span>
          </div>
        </template>
        
        <!-- 模型选择区域 -->
        <div class="section">
          <h3>模型选择</h3>
          <el-select
            v-model="selectedModel"
            placeholder="请选择模型"
            class="model-select"
          >
            <el-option
              v-for="item in modelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
  
        <!-- 模型验证区域 -->
        <div class="section">
          <h3>模型验证</h3>
          <el-table :data="validationResults" style="width: 100%">
            <el-table-column prop="metric" label="验证指标" />
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'success' ? 'success' : 'warning'">
                  {{ scope.row.status === 'success' ? '通过' : '警告' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="details" label="详情" />
          </el-table>
          <el-button 
            type="primary" 
            @click="handleValidation" 
            :loading="isValidating"
            class="action-button"
          >
            开始验证
          </el-button>
        </div>
  
        <!-- 性能评估区域 -->
        <div class="section">
          <h3>性能评估</h3>
          <el-row :gutter="20" class="metrics-container">
            <el-col :span="6">
              <el-card shadow="hover">
                <template #header>准确率</template>
                <div class="metric-value">{{ performanceData.accuracy * 100 }}%</div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover">
                <template #header>精确率</template>
                <div class="metric-value">{{ performanceData.precision * 100 }}%</div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover">
                <template #header>召回率</template>
                <div class="metric-value">{{ performanceData.recall * 100 }}%</div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover">
                <template #header>F1得分</template>
                <div class="metric-value">{{ performanceData.f1Score * 100 }}%</div>
              </el-card>
            </el-col>
          </el-row>
        </div>
  
        <!-- 发布按钮区域 -->
        <div class="section">
          <h3>模型发布</h3>
          <div class="deploy-container">
            <el-select
              v-model="selectedServer"
              placeholder="请选择摊销服务器"
              class="server-select"
            >
              <el-option
                v-for="item in serverOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
  
            <el-select
              v-model="selectedFormat"
              placeholder="请选择导出格式"
              class="format-select"
            >
              <el-option
                v-for="item in exportFormats"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            
            <el-button 
              type="primary" 
              @click="handleDeploy" 
              :loading="isDeploying"
              :disabled="!selectedModel || !selectedFormat || !selectedServer"
              class="deploy-button"
            >
              模型摊销
            </el-button>
            
            <el-button 
              type="success" 
              @click="handleDownload" 
              :disabled="!isDeployed"
              class="download-button"
            >
              下载模型
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  
  const modelOptions = [
    {
      value: 'model1',
      label: '故障诊断模型 V1.0'
    },
    {
      value: 'model2',
      label: '故障诊断模型 V2.0'
    },
    {
      value: 'model3',
      label: '预测性维护模型 V1.0'
    }
  ]
  
  const selectedModel = ref('')
  const performanceData = ref({
    accuracy: 0.95,
    precision: 0.93,
    recall: 0.94,
    f1Score: 0.935
  })
  
  const validationResults = ref([
    { metric: '数据一致性', status: 'success', details: '通过验证' },
    { metric: '模型完整性', status: 'success', details: '通过验证' },
    { metric: '输入输出格式', status: 'warning', details: '部分字段需要调整' }
  ])
  
  const isValidating = ref(false)
  const isDeploying = ref(false)
  const isDeployed = ref(false)
  const downloadUrl = ref('')
  
  // 添加导出格式选项
  const exportFormats = [
    {
      value: 'iec61499',
      label: 'IEC 61499'
    },
    {
      value: 'iec61131',
      label: 'IEC 61131'
    },
    {
      value: 'c',
      label: 'C文件'
    }
  ]
  
  const selectedFormat = ref('')
  
  // 添加服务器选项
  const serverOptions = [
    {
      value: 'server1',
      label: '机架服务器1'
    },
    {
      value: 'server2',
      label: '机架服务器2'
    }
  ]
  
  const selectedServer = ref('')
  
  const handleValidation = () => {
    isValidating.value = true
    setTimeout(() => {
      isValidating.value = false
      ElMessage.success('模型验证完成')
    }, 2000)
  }
  
  // 模型摊销处理函数
  const handleDeploy = () => {
    if (!selectedModel.value || !selectedFormat.value || !selectedServer.value) {
      ElMessage.warning('请选择模型、导出格式和服务器')
      return
    }
    
    isDeploying.value = true
    ElMessage.info('正在进行模型摊销，请稍候...')
    
    // 模拟摊销过程
    setTimeout(() => {
      isDeploying.value = false
      isDeployed.value = true
      
      // 根据不同格式生成不同的下载链接
      const fileMap = {
        'iec61499': '/models/fault_diagnosis_61499.fbt',
        'iec61131': '/models/fault_diagnosis_61131.xml',
        'c': '/models/fault_diagnosis.c'
      }
      downloadUrl.value = fileMap[selectedFormat.value]
      
      ElMessage.success(`模型已在${selectedServer.value === 'server1' ? '机架服务器1' : '机架服务器2'}上完成摊销`)
    }, 3000)
  }
  
  // 下载处理函数
  const handleDownload = () => {
    // 这里模拟文件下载
    const link = document.createElement('a')
    link.href = downloadUrl.value
    link.download = downloadUrl.value.split('/').pop() || 'model'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('开始下载')
  }
  </script>
  
  <style scoped>
  .model-container {
    padding: 20px;
  }
  
  .model-card {
    max-width: 1200px;
    margin: 0 auto;
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
    margin-bottom: 30px;
  }
  
  .section h3 {
    margin-bottom: 20px;
    color: #606266;
    font-size: 16px;
  }
  
  .model-select {
    width: 100%;
    max-width: 400px;
  }
  
  .metrics-container {
    margin-top: 20px;
  }
  
  .metric-value {
    font-size: 24px;
    font-weight: bold;
    color: #409EFF;
    text-align: center;
  }
  
  .action-button {
    margin-top: 20px;
  }
  
  .deploy-container {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
  }
  
  .server-select,
  .format-select {
    width: 200px;
  }
  
  .deploy-button, .download-button {
    width: 120px;
  }
  
  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid #EBEEF5;
    background-color: #F5F7FA;
  }
  
  :deep(.el-card) {
    margin-bottom: 20px;
    border-radius: 8px;
  }
  
  :deep(.el-table) {
    margin-top: 15px;
  }
  </style>
  