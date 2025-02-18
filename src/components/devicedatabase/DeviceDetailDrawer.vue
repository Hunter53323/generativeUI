<template>
  <el-drawer
    v-model="visible"
    :title="device?.deviceMeta?.deviceUID || '设备详情'"
    size="50%"
    :destroy-on-close="true"
  >
    <template v-if="device">
      <div class="device-detail">
        <!-- 基本信息 -->
        <el-card class="detail-section">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="设备ID">{{ device.deviceMeta.deviceUID }}</el-descriptions-item>
            <el-descriptions-item label="设备描述">{{ device.deviceMeta.deviceDesc || '暂无描述' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 资源信息 -->
        <el-card class="detail-section">
          <template #header>
            <div class="card-header">
              <span>资源信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="设备类型">
              <el-tag :type="store.getDeviceTagType(device.deviceResourceInfo.type)">
                {{ device.deviceResourceInfo.type }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="IP地址">{{ device.deviceResourceInfo.ip }}</el-descriptions-item>
            <el-descriptions-item label="主机名">{{ device.deviceResourceInfo.hostname }}</el-descriptions-item>
            <el-descriptions-item label="操作系统">{{ device.deviceResourceInfo.os }}</el-descriptions-item>
            <el-descriptions-item label="支持协议">
              <el-tag 
                v-for="protocol in device.deviceResourceInfo.protocol" 
                :key="protocol"
                class="protocol-tag"
              >
                {{ protocol }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 状态信息 -->
        <el-card class="detail-section">
          <template #header>
            <div class="card-header">
              <span>状态信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="健康状态">
              <el-tag :type="store.getStatusTagType(device.deviceWorkStatus.healthStatus)">
                {{ device.deviceWorkStatus.healthStatus }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="工作模式">{{ device.deviceWorkStatus.workMode }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ device.deviceWorkStatus.timestamp }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 帧信息 -->
        <el-card class="detail-section">
          <template #header>
            <div class="card-header">
              <span>帧配置信息</span>
            </div>
          </template>
          <div v-if="device.deviceMeta.frameInfos?.length">
            <div v-for="frame in device.deviceMeta.frameInfos" :key="frame.frameUID" class="frame-info">
              <h4>{{ frame.frameType.toUpperCase() }} 帧</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="帧ID">{{ frame.frameUID }}</el-descriptions-item>
                <el-descriptions-item label="帧类型">{{ frame.frameType }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
          <el-empty v-else description="暂无帧配置" />
        </el-card>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useDeviceDatabaseStore } from '@/stores/deviceDatabase'

const props = defineProps({
  modelValue: Boolean,
  deviceId: String
})

const emit = defineEmits(['update:modelValue'])
const store = useDeviceDatabaseStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const device = computed(() => {
  if (!props.deviceId) return null
  return store.devices.find(d => d.deviceMeta.deviceUID === props.deviceId)
})
</script>

<style scoped>
.device-detail {
  padding: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.protocol-tag {
  margin-right: 8px;
}

.frame-info {
  margin-bottom: 16px;
}

.frame-info h4 {
  margin: 0 0 12px;
  color: #303133;
}

:deep(.el-descriptions__label) {
  width: 120px;
  color: #606266;
}
</style> 