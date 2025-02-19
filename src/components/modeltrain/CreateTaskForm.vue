<template>
  <el-form 
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
  >
    <el-form-item label="任务名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入任务名称" />
    </el-form-item>

    <el-form-item label="模型类型" prop="modelType">
      <el-select v-model="form.modelType" placeholder="请选择模型类型">
        <el-option 
          v-for="type in modelTypes" 
          :key="type.value" 
          :label="type.label" 
          :value="type.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="训练服务器" prop="server">
      <el-select v-model="form.server" placeholder="请选择训练服务器">
        <el-option 
          v-for="server in serverManager.trainingServers"
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
              <el-tag size="small" :type="serverManager.getWorkStatusType(server.workStatus)">
                {{ serverManager.getWorkStatusText(server.workStatus) }}
              </el-tag>
              <span class="resource-info">
                GPU: {{ server.metrics.gpu }}%
              </span>
            </div>
          </div>
        </el-option>
      </el-select>
    </el-form-item>

    <el-divider>数据配置</el-divider>

    <el-form-item label="数据源" prop="dataSource">
      <el-select v-model="form.dataSource" placeholder="请选择数据源">
        <el-option label="MySQL" value="mysql" />
        <el-option label="CSV文件" value="csv" />
        <el-option label="设备数据" value="device" />
      </el-select>
    </el-form-item>

    <template v-if="form.dataSource === 'mysql'">
      <el-form-item label="数据库配置">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主机" prop="dbHost">
              <el-input v-model="form.dbConfig.host" placeholder="数据库主机地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="端口" prop="dbPort">
              <el-input v-model="form.dbConfig.port" placeholder="端口号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="dbUser">
              <el-input v-model="form.dbConfig.username" placeholder="用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="dbPassword">
              <el-input 
                v-model="form.dbConfig.password" 
                type="password" 
                placeholder="密码"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="数据库名" prop="dbName">
          <el-input v-model="form.dbConfig.database" placeholder="数据库名称" />
        </el-form-item>
        <el-form-item label="SQL查询" prop="dbQuery">
          <el-input 
            v-model="form.dbConfig.query" 
            type="textarea" 
            :rows="3"
            placeholder="请输入SQL查询语句"
          />
        </el-form-item>
      </el-form-item>
    </template>

    <el-divider>模型配置</el-divider>

    <el-form-item label="输入特征" prop="inputFeatures">
      <el-select
        v-model="form.inputFeatures"
        multiple
        filterable
        allow-create
        default-first-option
        placeholder="请选择或输入输入特征"
      >
        <el-option
          v-for="feature in availableFeatures"
          :key="feature"
          :label="feature"
          :value="feature"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="输出特征" prop="outputFeatures">
      <el-select
        v-model="form.outputFeatures"
        multiple
        filterable
        allow-create
        default-first-option
        placeholder="请选择或输入输出特征"
      >
        <el-option
          v-for="feature in availableFeatures"
          :key="feature"
          :label="feature"
          :value="feature"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="训练参数">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="批次大小">
            <el-input-number 
              v-model="form.trainParams.batchSize" 
              :min="1" 
              :max="1024"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="训练轮数">
            <el-input-number 
              v-model="form.trainParams.epochs" 
              :min="1"
              :max="1000"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="学习率">
            <el-input-number 
              v-model="form.trainParams.learningRate" 
              :min="0.0001"
              :max="1"
              :step="0.0001"
              :precision="4"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="验证集比例">
            <el-input-number 
              v-model="form.trainParams.validationSplit"
              :min="0.1"
              :max="0.5"
              :step="0.1"
              :precision="1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优化器">
            <el-select v-model="form.trainParams.optimizer">
              <el-option label="Adam" value="adam" />
              <el-option label="SGD" value="sgd" />
              <el-option label="RMSprop" value="rmsprop" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from 'vue'
import { useServerManagerStore } from '@/stores/serverManager'

const props = defineProps({
  modelTypes: {
    type: Array,
    required: true
  },
  availableFeatures: {
    type: Array,
    required: true
  }
})

const formRef = ref(null)
const form = ref({
  name: '',
  modelType: '',
  server: '',
  dataSource: '',
  dbConfig: {
    host: '',
    port: '',
    username: '',
    password: '',
    database: '',
    query: ''
  },
  inputFeatures: [],
  outputFeatures: [],
  trainParams: {
    batchSize: 32,
    epochs: 100,
    learningRate: 0.001,
    validationSplit: 0.2,
    optimizer: 'adam'
  }
})

const rules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  modelType: [
    { required: true, message: '请选择模型类型', trigger: 'change' }
  ],
  server: [
    { required: true, message: '请选择训练服务器', trigger: 'change' }
  ],
  dataSource: [
    { required: true, message: '请选择数据源', trigger: 'change' }
  ],
  inputFeatures: [
    { type: 'array', required: true, message: '请选择输入特征', trigger: 'change' }
  ],
  outputFeatures: [
    { type: 'array', required: true, message: '请选择输出特征', trigger: 'change' }
  ]
}

const serverManager = useServerManagerStore()

const getStatusType = (status) => {
  const statusMap = {
    'online': 'success',
    'offline': 'danger',
    'busy': 'warning',
    'maintenance': 'info'
  }
  return statusMap[status]
}

defineExpose({
  form,
  formRef
})
</script>

<style scoped>
.server-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 8px;
}

.server-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-info {
  font-size: 0.8em;
  color: #606266;
}
</style> 