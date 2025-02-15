<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeviceStatusStore } from '@/stores/deviceStatus'
import {
  Monitor,
  Warning,
  Success,
  Connection
} from '@element-plus/icons-vue'

const deviceStatus = useDeviceStatusStore()

const systemFeatures = [
  {
    title: '实时感知',
    description: '通过先进的数据采集技术，实时监测设备运行状态，确保数据的及时性和准确性。',
    icon: 'Monitor'
  },
  {
    title: '智能训练',
    description: '基于训练服务器的生成式控制模型，实现智能化的模型训练和优化。',
    icon: 'CPU'
  },
  {
    title: '灵活部署',
    description: '支持多种标准协议的模型导出，便捷的模型摊销机制，实现控制策略的快速部署。',
    icon: 'SetUp'
  },
  {
    title: '可扩展性',
    description: '采用模块化设计，支持灵活扩展，满足不同场景的定制化需求。',
    icon: 'Expand'
  }
]

const systemMetrics = ref([
  { title: '控制精度', value: '99.9%' },
  { title: '响应时间', value: '<100ms' },
  { title: '系统稳定性', value: '99.99%' },
  { title: '支持协议数', value: '10+' }
])
</script>

<template>
  <div class="home-container">
    <!-- 系统概览卡片 -->
    <el-row :gutter="20" class="overview-section">
      <el-col :span="8">
        <el-card shadow="hover" class="status-card">
          <template #header>
            <div class="card-header">
              <el-icon><connection /></el-icon>
              <span>连接设备数</span>
            </div>
          </template>
          <div class="status-value">
            {{ deviceStatus.deviceStatusData.connected }}
            <small>台</small>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="status-card">
          <template #header>
            <div class="card-header">
              <el-icon><success /></el-icon>
              <span>正常设备数</span>
            </div>
          </template>
          <div class="status-value success">
            {{ deviceStatus.deviceStatusData.normal }}
            <small>台</small>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="status-card">
          <template #header>
            <div class="card-header">
              <el-icon><warning /></el-icon>
              <span>异常设备数</span>
            </div>
          </template>
          <div class="status-value warning">
            {{ deviceStatus.deviceStatusData.abnormal }}
            <small>台</small>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统介绍 -->
    <el-card class="intro-section">
      <template #header>
        <div class="section-title">系统介绍</div>
      </template>
      <div class="intro-content">
        <h2>生成式综合管控系统</h2>
        <p class="intro-text">
          本系统是一套先进的生成式综合管控平台，实现了感知、计算、控制的一体化集成。
          通过实时感知设备数据，结合训练服务器进行生成式控制模型训练，
          进一步通过模型摊销实现控制模型的便捷训练与下发。
        </p>
      </div>
    </el-card>

    <!-- 核心特性 -->
    <el-card class="features-section">
      <template #header>
        <div class="section-title">核心特性</div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="feature in systemFeatures" :key="feature.title">
          <div class="feature-item">
            <el-icon :size="40" class="feature-icon">
              <component :is="feature.icon" />
            </el-icon>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 系统指标 -->
    <el-card class="metrics-section">
      <template #header>
        <div class="section-title">系统指标</div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="metric in systemMetrics" :key="metric.title">
          <div class="metric-item">
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-title">{{ metric.title }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped>
.home-container {
  padding: 20px;
}

.overview-section {
  margin-bottom: 20px;
}

.status-card {
  height: 160px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.status-value {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
  margin-top: 20px;
}

.status-value.success {
  color: #67C23A;
}

.status-value.warning {
  color: #E6A23C;
}

.status-value small {
  font-size: 16px;
  margin-left: 4px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.intro-section {
  margin-bottom: 20px;
}

.intro-content {
  text-align: center;
  padding: 20px 0;
}

.intro-content h2 {
  color: #303133;
  margin-bottom: 20px;
}

.intro-text {
  color: #606266;
  line-height: 1.8;
  max-width: 800px;
  margin: 0 auto;
}

.features-section {
  margin-bottom: 20px;
}

.feature-item {
  text-align: center;
  padding: 20px;
}

.feature-icon {
  color: #409EFF;
  margin-bottom: 16px;
}

.feature-item h3 {
  color: #303133;
  margin-bottom: 12px;
}

.feature-item p {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.metrics-section {
  margin-bottom: 20px;
}

.metric-item {
  text-align: center;
  padding: 20px;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.metric-title {
  color: #606266;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #EBEEF5;
}
</style> 