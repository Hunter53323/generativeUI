<script setup>
import { ref, computed } from 'vue'
import DeviceStatus from '@/components/home/DeviceStatus.vue'
import DeviceControl from '@/components/devicedashboard/DeviceControl.vue'
import DeviceChart from '@/components/devicedashboard/DeviceChart.vue'
import { useDeviceStore } from '@/stores/devicestatus'
import { useDeviceControlStore } from '@/stores/deviceControl'
import { ElEmpty } from 'element-plus'

const deviceStore = useDeviceStore()
const deviceControlStore = useDeviceControlStore()
const selectedDevice = ref(null)

// 处理设备选择
const handleDeviceSelect = (device) => {
  selectedDevice.value = device
}

// 获取设备类型对应的参数配置
const deviceParams = computed(() => {
  if (!selectedDevice.value) return []
  
  switch (selectedDevice.value.type) {
    case 'motor':
      return [
        { label: '转速', value: '1500', unit: 'rpm' },
        { label: '电流', value: '10.5', unit: 'A' },
        { label: '电压', value: '380', unit: 'V' },
        { label: '功率', value: '5.5', unit: 'kW' }
      ]
    case 'pump':
      return [
        { label: '流量', value: '50', unit: 'm³/h' },
        { label: '压力', value: '0.6', unit: 'MPa' },
        { label: '转速', value: '2900', unit: 'rpm' }
      ]
    // ... 其他设备类型的参数配置
    default:
      return []
  }
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 设备状态监控 -->
    <div class="status-section">
      <DeviceStatus 
        v-model:devices="deviceStore.devices" 
        @device-click="handleDeviceSelect"
      />
    </div>

    <!-- 设备详情和控制 -->
    <div class="dashboard-content">
      <template v-if="selectedDevice">
        <el-row :gutter="20">
          <el-col :span="8">
            <!-- 设备基本信息 -->
            <el-card class="detail-card info-card">
              <template #header>
                <div class="card-header">
                  <span>设备信息</span>
                </div>
              </template>
              <div class="device-info">
                <div class="info-item">
                  <span class="label">设备名称：</span>
                  <span>{{ selectedDevice.name }}</span>
                </div>
                <div class="info-item">
                  <span class="label">设备类型：</span>
                  <span>{{ selectedDevice.type }}</span>
                </div>
                <div class="info-item">
                  <span class="label">通信协议：</span>
                  <span>{{ selectedDevice.protocol }}</span>
                </div>
                <div class="info-item">
                  <span class="label">连接状态：</span>
                  <el-tag :type="selectedDevice.connected ? 'success' : 'danger'" size="small">
                    {{ selectedDevice.connected ? '已连接' : '未连接' }}
                  </el-tag>
                </div>
              </div>
            </el-card>

            <!-- 设备控制 -->
            <el-card class="detail-card control-card">
              <template #header>
                <div class="card-header">
                  <span>设备控制</span>
                </div>
              </template>
              <DeviceControl :device="selectedDevice" />
            </el-card>
          </el-col>

          <!-- 运行状态图表 -->
          <el-col :span="16">
            <el-card class="chart-card">
              <template #header>
                <div class="card-header">
                  <span>运行状态图表</span>
                </div>
              </template>
              <DeviceChart :device="selectedDevice" />
            </el-card>
          </el-col>
        </el-row>
      </template>
      
      <el-empty v-else description="请选择设备查看详情" />
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-section {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.dashboard-content {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.detail-card {
  margin-bottom: 20px;
}

.info-card {
  height: auto;
  min-height: 200px;
}

.control-card {
  height: auto;
  flex: 1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item .label {
  color: #909399;
  width: 80px;
  flex-shrink: 0;
}

.chart-card {
  height: 100%;
}

.chart-container {
  height: 400px;
  width: 100%;
}
</style>
