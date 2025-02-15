<script setup>
import { computed } from 'vue'
import { DEVICE_PARAMS_CONFIG } from '@/constants/deviceControl'
import { useDeviceControlStore } from '@/stores/deviceControl'

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const deviceControlStore = useDeviceControlStore()

const isRunning = computed(() => 
  deviceControlStore.getDeviceStatus(props.device.id) === 'running'
)

const deviceParams = computed(() => 
  DEVICE_PARAMS_CONFIG[props.device.type]?.controlParams || []
)

const currentParams = computed(() => 
  deviceControlStore.getDeviceParams(props.device.id)
)

const handleStart = () => {
  deviceControlStore.startDevice(props.device.id, props.device.type)
}

const handleStop = () => {
  deviceControlStore.stopDevice(props.device.id)
}

const handleParamChange = (paramKey, value) => {
  deviceControlStore.updateDeviceParam(props.device.id, paramKey, value)
}
</script>

<template>
  <div class="device-control">
    <div class="control-header">
      <el-button
        :type="isRunning ? 'danger' : 'success'"
        @click="isRunning ? handleStop() : handleStart()"
      >
        {{ isRunning ? '停止' : '启动' }}
      </el-button>
    </div>
    
    <div class="params-control">
      <div v-for="param in deviceParams" :key="param.key" class="param-control-item">
        <span class="param-label">{{ param.label }}</span>
        <el-slider
          v-model="currentParams[param.key]"
          :min="param.min"
          :max="param.max"
          :step="1"
          :disabled="!isRunning"
          @change="value => handleParamChange(param.key, value)"
        >
          <template #default="{ value }">
            <span>{{ value }}{{ param.unit }}</span>
          </template>
        </el-slider>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-control {
  padding: 15px;
}

.control-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.params-control {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.param-control-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.param-label {
  width: 60px;
  color: #606266;
  font-size: 14px;
}

:deep(.el-slider) {
  flex: 1;
}
</style> 