<script setup>
import { ref } from 'vue'
import DeviceStatus from '@/components/home/DeviceStatus.vue'
import ServerStatus from '@/components/home/ServerStatus.vue'
import {
  Monitor,
  Cpu,
  SetUp,
  Expand,
  CircleCheck,
  Warning,
  Loading
} from '@element-plus/icons-vue'

const features = [
  {
    title: '实时感知',
    icon: Monitor,
    description: '通过先进的数据采集技术，实时监测设备运行状态，确保数据的及时性和准确性。'
  },
  {
    title: '智能训练',
    icon: Cpu,
    description: '基于训练服务器的生成式控制模型，实现智能化的模型训练和优化。'
  },
  {
    title: '灵活部署',
    icon: SetUp,
    description: '支持多种标准协议的模型导出，便捷的模型摊销机制，实现控制策略的快速部署。'
  },
  {
    title: '高扩展性',
    icon: Expand,
    description: '采用模块化设计，支持灵活扩展，满足不同场景的定制化需求。'
  }
]

const devices = ref([
  {
    name: '电机',
    type: 'motor',
    status: 'normal',
    connected: false,
    protocol: 'modbus_rtu',
    config: {
      com: 'COM1',
      baudRate: 9600
    }
  },
  {
    name: '风机',
    type: 'fan',
    status: 'warning',
    connected: false,
    protocol: 'modbus_tcp',
    config: {
      ip: '192.168.1.100',
      port: '502'
    }
  },
  {
    name: '水泵',
    type: 'pump',
    status: 'normal',
    connected: false,
    protocol: 'rs485',
    config: {
      com: 'COM2',
      baudRate: 19200
    }
  }
])

const servers = ref([
  {
    name: '训练服务器 A',
    type: 'training',
    status: 'idle',
    ip: '192.168.1.201',
    port: '8080',
    load: '20%',
    memory: '4.2/32GB'
  },
  {
    name: '训练服务器 B',
    type: 'training',
    status: 'training',
    ip: '192.168.1.202',
    port: '8080',
    load: '85%',
    memory: '28.5/32GB'
  },
  {
    name: '摊销服务器',
    type: 'deploy',
    status: 'deploying',
    ip: '192.168.1.203',
    port: '8080',
    load: '60%',
    memory: '16.8/32GB'
  }
])

const getStatusType = (status) => {
  const types = {
    normal: 'success',
    warning: 'warning',
    error: 'danger',
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

const handleDevicesUpdate = (newDevices) => {
  devices.value = newDevices
}

const handleServersUpdate = (newServers) => {
  servers.value = newServers
}
</script>

<template>
  <div class="home-container">
    <!-- 状态监控面板 -->
    <el-row :gutter="20" class="status-panel">
      <el-col :span="12">
        <DeviceStatus
          v-model:devices="devices"
        />
      </el-col>
      <el-col :span="12">
        <ServerStatus
          v-model:servers="servers"
        />
      </el-col>
    </el-row>

    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用</span>
        </div>
      </template>
      <div class="welcome-content">
        <h1>生成式综合管控系统</h1>
        <div class="system-intro">
          <p>本系统是一套先进的生成式综合管控平台，实现了感知、计算、控制的一体化集成。</p>
          <p>通过实时感知设备数据，结合训练服务器进行生成式控制模型训练，进一步通过模型摊销实现控制模型的便捷训练与下发。</p>
        </div>

        <div class="features-grid">
          <el-row :gutter="20">
            <el-col :span="6" v-for="feature in features" :key="feature.title">
              <div class="feature-card">
                <el-icon :size="40" class="feature-icon">
                  <component :is="feature.icon" />
                </el-icon>
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.description }}</p>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-divider>
          <el-icon><Cpu /></el-icon>
        </el-divider>

        <p class="start-hint">请从左侧菜单选择功能开始使用</p>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.home-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.welcome-card {
  max-width: 1200px;
  margin: 40px auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.welcome-content {
  text-align: center;
  padding: 40px 20px;
}

.welcome-content h1 {
  color: #303133;
  margin-bottom: 30px;
  font-size: 32px;
  font-weight: 600;
  background: linear-gradient(45deg, #409EFF, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.system-intro {
  max-width: 800px;
  margin: 0 auto 40px;
  line-height: 1.8;
}

.system-intro p {
  color: #606266;
  font-size: 16px;
  margin-bottom: 15px;
}

.features-grid {
  margin: 40px 0;
}

.feature-card {
  background: #fff;
  padding: 30px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  height: 100%;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  color: #409EFF;
  margin-bottom: 20px;
}

.feature-card h3 {
  color: #303133;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
}

.feature-card p {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.start-hint {
  color: #909399;
  font-size: 16px;
  margin-top: 30px;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #EBEEF5;
  background: linear-gradient(to right, #f5f7fa, #fff);
}

:deep(.el-divider__text) {
  background-color: transparent;
}

:deep(.el-divider .el-icon) {
  color: #409EFF;
}

.el-row {
  margin-bottom: 20px;
}

.status-panel {
  margin-bottom: 20px;
}

.status-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.device-grid {
  padding: 10px 0;
}

.device-item {
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
}

.server-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.server-info h4 {
  margin: 0;
  color: #303133;
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
</style> 