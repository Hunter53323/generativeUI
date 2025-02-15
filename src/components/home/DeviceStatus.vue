<script setup>
import { ref } from 'vue'
import {
  Monitor,
  CircleCheck,
  Warning,
  Plus,
  Delete,
  Setting,
  Link,
  SwitchButton
} from '@element-plus/icons-vue'

const props = defineProps({
  devices: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:devices'])

const localDevices = ref([...props.devices])

// 协议类型定义
const protocolTypes = [
  { 
    label: 'Modbus RTU',
    value: 'modbus_rtu',
    type: 'serial'
  },
  { 
    label: 'Modbus TCP',
    value: 'modbus_tcp',
    type: 'network'
  },
  {
    label: 'RS485',
    value: 'rs485',
    type: 'serial'
  }
]

const deviceTypes = [
  { label: '电机', value: 'motor' },
  { label: '风机', value: 'fan' },
  { label: '水泵', value: 'pump' },
  { label: '压缩机', value: 'compressor' },
  { label: '传感器', value: 'sensor' },
  { label: '控制器', value: 'controller' }
]

const statusOptions = [
  { label: '正常', value: 'normal' },
  { label: '警告', value: 'warning' },
  { label: '错误', value: 'error' }
]

const addDeviceDialogVisible = ref(false)
const editDeviceDialogVisible = ref(false)
const currentDevice = ref(null)
const connecting = ref(false)

const newDevice = ref({
  name: '',
  type: '',
  status: 'normal',
  connected: false,
  protocol: '',
  config: {
    com: '',
    baudRate: 9600,
    ip: '',
    port: ''
  }
})

const getStatusType = (status) => {
  const types = {
    normal: 'success',
    warning: 'warning',
    error: 'danger'
  }
  return types[status] || 'info'
}

const isSerialProtocol = (protocol) => {
  const protocolInfo = protocolTypes.find(p => p.value === protocol)
  return protocolInfo?.type === 'serial'
}

const handleAddDevice = () => {
  if (!newDevice.value.name || !newDevice.value.type || !newDevice.value.protocol) {
    ElMessage.warning('请填写完整信息')
    return
  }

  // 验证协议配置
  if (isSerialProtocol(newDevice.value.protocol)) {
    if (!newDevice.value.config.com) {
      ElMessage.warning('请填写COM口')
      return
    }
  } else {
    if (!newDevice.value.config.ip || !newDevice.value.config.port) {
      ElMessage.warning('请填写IP和端口')
      return
    }
  }

  // 生成唯一ID
  const id = `${newDevice.value.type}_${Date.now()}`

  const server = {
    ...newDevice.value,
    id, // 添加唯一标识
    status: 'normal',
    connected: false,
    config: {
      ...newDevice.value.config
    }
  }
  
  localDevices.value.push(server)
  emit('update:devices', localDevices.value)
  addDeviceDialogVisible.value = false
  
  // 重置表单
  newDevice.value = {
    name: '',
    type: '',
    status: 'normal',
    connected: false,
    protocol: '',
    config: {
      com: '',
      baudRate: 9600,
      ip: '',
      port: ''
    }
  }
  ElMessage.success('设备添加成功')
}

const handleConnect = async (device) => {
  const index = localDevices.value.findIndex(d => d.id === device.id) // 使用id查找
  if (index === -1) return

  connecting.value = device.id // 使用id作为标识
  
  try {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))
    
    localDevices.value[index] = {
      ...device,
      connected: true,
      status: 'normal'
    }
    emit('update:devices', localDevices.value)
    ElMessage.success('设备连接成功')
  } catch (error) {
    ElMessage.error('设备连接失败')
  } finally {
    connecting.value = false
  }
}

const handleDisconnect = async (device) => {
  const index = localDevices.value.findIndex(d => d.id === device.id) // 使用id查找
  if (index === -1) return

  connecting.value = device.id // 使用id作为标识
  
  try {
    // 模拟断开连接过程
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
    
    localDevices.value[index] = {
      ...device,
      connected: false,
      status: 'normal'
    }
    emit('update:devices', localDevices.value)
    ElMessage.success('设备已断开连接')
  } catch (error) {
    ElMessage.error('断开连接失败')
  } finally {
    connecting.value = false
  }
}

const handleEditDevice = (device) => {
  currentDevice.value = { ...device }
  editDeviceDialogVisible.value = true
}

const handleUpdateDevice = () => {
  const index = localDevices.value.findIndex(d => d.id === currentDevice.value.id)
  if (index !== -1) {
    localDevices.value[index] = { ...currentDevice.value }
    emit('update:devices', localDevices.value)
    editDeviceDialogVisible.value = false
    ElMessage.success('设备更新成功')
  }
}

const handleDeleteDevice = (device) => {
  ElMessageBox.confirm(
    '确定要删除该设备吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    localDevices.value = localDevices.value.filter(d => d.id !== device.id) // 使用id过滤
    emit('update:devices', localDevices.value)
    ElMessage.success('设备删除成功')
  }).catch(() => {})
}
</script>

<template>
  <el-card shadow="hover" class="status-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <el-icon><Monitor /></el-icon>
          <span>设备状态监控</span>
        </div>
        <el-button 
          type="primary" 
          size="small" 
          @click="addDeviceDialogVisible = true"
          :icon="Plus"
        >
          添加设备
        </el-button>
      </div>
    </template>
    <el-row :gutter="20" class="device-grid">
      <el-col :span="6" v-for="device in localDevices" :key="device.id">
        <div class="device-item" :class="{ 'device-disconnected': !device.connected }">
          <div class="device-actions device-actions-left">
            <template v-if="device.connected">
              <el-button 
                type="warning" 
                :icon="SwitchButton"
                circle
                size="small"
                :loading="connecting === device.id"
                @click="handleDisconnect(device)"
              />
            </template>
            <template v-else>
              <el-button 
                type="success" 
                :icon="Link"
                circle
                size="small"
                :loading="connecting === device.id"
                @click="handleConnect(device)"
              />
            </template>
          </div>
          <div class="device-actions device-actions-right">
            <el-button 
              type="primary" 
              :icon="Setting"
              circle
              size="small"
              @click="handleEditDevice(device)"
            />
            <el-button 
              type="danger" 
              :icon="Delete"
              circle
              size="small"
              @click="handleDeleteDevice(device)"
            />
          </div>
          <div class="device-content">
            <el-icon :size="24" :class="device.status">
              <circle-check v-if="device.status === 'normal'" />
              <warning v-else-if="device.status === 'warning'" />
              <warning v-else />
            </el-icon>
            <h4>{{ device.name }}</h4>
            <el-tag :type="getStatusType(device.status)" size="small">
              {{ device.connected ? '已连接' : '未连接' }}
            </el-tag>
            <div class="device-protocol">
              {{ protocolTypes.find(p => p.value === device.protocol)?.label }}
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 添加设备对话框 -->
    <el-dialog
      v-model="addDeviceDialogVisible"
      title="添加设备"
      width="30%"
    >
      <el-form :model="newDevice" label-width="80px">
        <el-form-item label="设备名称">
          <el-input v-model="newDevice.name" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="newDevice.type" placeholder="请选择设备类型">
            <el-option
              v-for="item in deviceTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="通信协议">
          <el-select v-model="newDevice.protocol" placeholder="请选择通信协议">
            <el-option
              v-for="item in protocolTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <!-- 串口配置 -->
        <template v-if="isSerialProtocol(newDevice.protocol)">
          <el-form-item label="COM口">
            <el-input v-model="newDevice.config.com" placeholder="例如: COM1" />
          </el-form-item>
          <el-form-item label="波特率">
            <el-select v-model="newDevice.config.baudRate">
              <el-option label="9600" :value="9600" />
              <el-option label="19200" :value="19200" />
              <el-option label="38400" :value="38400" />
              <el-option label="115200" :value="115200" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 网络配置 -->
        <template v-else-if="newDevice.protocol">
          <el-form-item label="IP地址">
            <el-input v-model="newDevice.config.ip" placeholder="例如: 192.168.1.100" />
          </el-form-item>
          <el-form-item label="端口">
            <el-input v-model="newDevice.config.port" placeholder="例如: 502" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDeviceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddDevice">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑设备对话框 -->
    <el-dialog
      v-model="editDeviceDialogVisible"
      title="编辑设备"
      width="30%"
    >
      <el-form v-if="currentDevice" :model="currentDevice" label-width="80px">
        <el-form-item label="设备名称">
          <el-input v-model="currentDevice.name" />
        </el-form-item>
        <el-form-item label="设备状态">
          <el-select v-model="currentDevice.status" placeholder="请选择设备状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="连接状态">
          <el-switch v-model="currentDevice.connected" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDeviceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateDevice">确定</el-button>
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

.device-grid {
  padding: 10px 0;
}

.device-item {
  position: relative;
  text-align: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
}

.device-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.device-disconnected {
  opacity: 0.6;
}

.device-item h4 {
  margin: 10px 0;
  color: #303133;
}

.device-item .el-icon {
  font-size: 24px;
}

.device-item .normal {
  color: #67C23A;
}

.device-item .warning {
  color: #E6A23C;
}

.device-item .error {
  color: #F56C6C;
}

.device-protocol {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.device-actions {
  position: absolute;
  top: 10px;
  display: none;
  gap: 5px;
}

.device-actions-left {
  left: 10px;
}

.device-actions-right {
  right: 10px;
  display: none;
}

.device-item:hover .device-actions {
  display: flex;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}

.device-actions .el-button {
  transition: all 0.3s ease;
}

.device-actions .el-button:hover {
  transform: scale(1.1);
}

.device-content {
  padding: 0;
}
</style> 