<template>
  <el-card class="model-card">
    <template #header>
      <div class="card-header">
        <span class="title">模型验证管理</span>
        <el-button 
          type="primary" 
          :icon="Plus"
          @click="uploadDialogVisible = true"
        >
          上传模型
        </el-button>
      </div>
    </template>
    
    <!-- 模型选择区域 -->
    <div class="section">
      <h3>模型库</h3>
      <el-table 
        :data="modelLibrary" 
        style="width: 100%"
        @row-click="handleRowClick"
        highlight-current-row
      >
        <el-table-column prop="name" label="模型名称" />
        <el-table-column prop="type" label="类型">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'diagnostic' ? 'success' : 'warning'">
              {{ modelTypes.find(t => t.value === scope.row.type)?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="uploadTime" label="上传时间" width="160" />
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column prop="author" label="作者" width="100" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button
              type="danger"
              size="small"
              @click.stop="handleDeleteModel(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 模型验证区域 -->
    <div class="section">
      <h3>模型验证</h3>
      <div v-if="selectedModel" class="validation-area">
        <el-table :data="validationState.validationResults" style="width: 100%">
          <el-table-column prop="metric" label="验证指标" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="details" label="详情" />
        </el-table>
        <div class="validation-button-container">
          <el-button 
            type="primary" 
            @click="handleValidation" 
            :loading="isValidating"
            class="action-button"
          >
            开始验证
          </el-button>
        </div>
      </div>
      <div v-else class="empty-hint">
        请从模型库中选择一个模型进行验证
      </div>
    </div>

    <!-- 性能评估区域 -->
    <div class="section">
      <div class="section-header">
        <h3>性能评估</h3>
        <div v-if="selectedModel" class="evaluation-actions">
          <el-button 
            type="primary" 
            @click="handlePerformanceEvaluation" 
            :loading="performanceState.isEvaluating"
            :disabled="!validationState.hasValidated || performanceState.isEvaluating"
            class="action-button"
          >
            {{ performanceState.isEvaluating ? `评估中 ${performanceState.progress}%` : '开始评估' }}
          </el-button>
          <el-button 
            v-if="performanceState.isEvaluating"
            type="danger" 
            @click="handleCancelEvaluation"
          >
            取消评估
          </el-button>
        </div>
      </div>
      <div v-if="selectedModel" class="metrics-container">
        <template v-if="validationState.hasEvaluated">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card shadow="hover">
                <template #header>超调量</template>
                <div class="metric-value">
                  {{ validationState.performanceData.overshoot }}%
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover">
                <template #header>调节时间</template>
                <div class="metric-value">
                  {{ validationState.performanceData.settlingTime }}ms
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover">
                <template #header>稳态误差</template>
                <div class="metric-value">
                  {{ validationState.performanceData.steadyError }}%
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover">
                <template #header>响应速度</template>
                <div class="metric-value">
                  {{ validationState.performanceData.responseTime }}ms
                </div>
              </el-card>
            </el-col>
          </el-row>
        </template>
        <div v-else class="empty-hint">
          请点击"开始评估"按钮进行性能评估
        </div>
      </div>
      <div v-else class="empty-hint">
        请从模型库中选择一个模型进行评估
      </div>
    </div>

    <!-- 上传模型对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传模型"
      width="500px"
    >
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="模型名称" required>
          <el-input v-model="uploadForm.name" placeholder="请输入模型名称" />
        </el-form-item>
        
        <el-form-item label="模型类型" required>
          <el-select v-model="uploadForm.type" placeholder="请选择模型类型" style="width: 100%">
            <el-option
              v-for="item in modelTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="模型描述">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入模型描述"
          />
        </el-form-item>
        
        <el-form-item label="模型文件" required>
          <el-upload
            class="model-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleFileUpload"
            :limit="1"
          >
            <el-button type="primary" :icon="Upload">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 .h5, .pkl, .pt 格式文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUploadSubmit">
            上传
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import { 
  modelLibrary,
  selectedModel,
  validationState,
  modelTypes,
  addModel,
  deleteModel,
  updateValidationState,
  resetValidationState,
  performanceState,
  startPerformanceEvaluation,
  cancelPerformanceEvaluation
} from '@/stores/modelmanage'

const isValidating = ref(false)
const uploadDialogVisible = ref(false)
const uploadForm = ref({
  name: '',
  type: '',
  description: '',
  file: null
})

const handleValidation = () => {
  isValidating.value = true
  setTimeout(() => {
    isValidating.value = false
    updateValidationState()
    ElMessage.success('模型验证完成')
  }, 2000)
}

const handleRowClick = (row) => {
  selectedModel.value = row
  resetValidationState()
}

const handleDeleteModel = (model) => {
  ElMessageBox.confirm(
    `确定要删除模型 "${model.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    deleteModel(model.id)
    ElMessage.success('模型删除成功')
  }).catch(() => {})
}

const handleFileUpload = (file) => {
  uploadForm.value.file = file
}

const handleUploadSubmit = () => {
  if (!uploadForm.value.file) {
    ElMessage.warning('请选择模型文件')
    return
  }
  
  ElMessage.info('正在上传模型...')
  setTimeout(() => {
    addModel({
      name: uploadForm.value.name,
      type: uploadForm.value.type,
      description: uploadForm.value.description,
    })
    uploadDialogVisible.value = false
    ElMessage.success('模型上传成功')
    
    uploadForm.value = {
      name: '',
      type: '',
      description: '',
      file: null
    }
  }, 1500)
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    'success': 'success',
    'warning': 'warning',
    'pending': 'info'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    'success': '通过',
    'warning': '警告',
    'pending': '未验证'
  }
  return texts[status] || '未验证'
}

const handlePerformanceEvaluation = () => {
  if (!validationState.value.hasValidated) {
    ElMessage.warning('请先完成模型验证')
    return
  }
  
  ElMessage.info('正在进行性能评估，请稍候...')
  startPerformanceEvaluation()
  
  // 一分钟后完成评估
  setTimeout(() => {
    validationState.value.hasEvaluated = true  // 设置评估完成标志
    validationState.value.performanceData = {
      overshoot: getRandomFloat(4.5, 1),
      settlingTime: Math.round(getRandomFloat(150, 20)),
      steadyError: getRandomFloat(0.5, 0.2),
      responseTime: Math.round(getRandomFloat(50, 10))
    }
    ElMessage.success('性能评估完成')
  }, 60000)
}

const handleCancelEvaluation = () => {
  cancelPerformanceEvaluation()
  ElMessage.info('已取消性能评估')
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

.validation-button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 0;
}

.action-button {
  min-width: 120px;
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

.metric-value.no-data {
  color: #909399;
  font-size: 20px;
}

.empty-hint {
  text-align: center;
  color: #909399;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.evaluation-actions {
  display: flex;
  gap: 12px;
}
</style> 