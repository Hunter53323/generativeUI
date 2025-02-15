<script setup>
import { ref, onMounted } from 'vue'
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
    id: 'motor_1',
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
    id: 'fan_1',
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
    id: 'pump_1',
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

// 添加拖动调整大小的功能
const initResize = () => {
  const handle = document.querySelector('.resize-handle')
  const aside = document.querySelector('.resizable-aside')
  const container = document.querySelector('.monitor-container')

  let isResizing = false
  let startX, startWidth

  handle.addEventListener('mousedown', (e) => {
    isResizing = true
    startX = e.pageX
    startWidth = aside.offsetWidth
    document.body.style.cursor = 'col-resize'
  })

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return

    const width = startWidth + (e.pageX - startX)
    const containerWidth = container.offsetWidth
    const minWidth = containerWidth * 0.3 // 最小 30%
    const maxWidth = containerWidth * 0.7 // 最大 70%

    if (width >= minWidth && width <= maxWidth) {
      aside.style.width = `${width}px`
    }
  })

  document.addEventListener('mouseup', () => {
    isResizing = false
    document.body.style.cursor = ''
  })
}

onMounted(() => {
  initResize()
})
</script>

<template>
  <div class="home-container">
    <!-- 欢迎卡片 -->
    <el-card class="welcome-card">
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
                <el-icon :size="32" class="feature-icon">
                  <component :is="feature.icon" />
                </el-icon>
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.description }}</p>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>

    <!-- 状态监控面板 -->
    <div class="monitor-container">
      <el-container>
        <el-aside width="50%" class="resizable-aside">
          <div class="resize-handle"></div>
          <DeviceStatus v-model:devices="devices" />
        </el-aside>
        <el-main class="monitor-main">
          <ServerStatus v-model:servers="servers" />
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-card {
  width: calc(100% - 40px);
  margin: 0 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f6f9fc 100%);
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.welcome-content {
  text-align: center;
  padding: 20px;
}

.welcome-content h1 {
  color: #303133;
  margin-bottom: 15px;
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(45deg, #409EFF, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.system-intro {
  max-width: none;
  margin: 0 auto 20px;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 8px;
}

.system-intro p {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.features-grid {
  margin: 15px 0 5px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  height: 100%;
  border: 1px solid #ebeef5;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #ffffff;
}

.feature-icon {
  color: #409EFF;
  margin-bottom: 10px;
  background: rgba(64, 158, 255, 0.1);
  padding: 8px;
  border-radius: 8px;
}

.feature-card h3 {
  color: #303133;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 600;
}

.feature-card p {
  color: #606266;
  font-size: 12px;
  line-height: 1.5;
}

.monitor-container {
  flex: 0 0 600px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 20px;
  display: flex;
}

.el-container {
  width: 100%;
  height: 100%;
}

.resizable-aside {
  position: relative;
  background: #fff;
  border-right: 1px solid #ebeef5;
  transition: none;
  display: flex;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -5px;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  z-index: 100;
}

.resize-handle:hover {
  background: rgba(64, 158, 255, 0.1);
}

.resize-handle:active {
  background: rgba(64, 158, 255, 0.2);
}

.monitor-main {
  padding: 0;
  background: #fff;
  display: flex;
}

.resizable-aside :deep(.el-card),
.monitor-main :deep(.el-card) {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: none;
  box-shadow: none;
  max-height: 600px;
}

.resizable-aside :deep(.el-card__body),
.monitor-main :deep(.el-card__body) {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

@media (max-width: 768px) {
  .el-container {
    flex-direction: column;
  }

  .resizable-aside {
    width: 100% !important;
    border-right: none;
    border-bottom: 1px solid #ebeef5;
  }

  .resize-handle {
    display: none;
  }
}
</style> 