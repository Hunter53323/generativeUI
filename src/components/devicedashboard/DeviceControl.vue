<script setup>
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import { DEVICE_PARAMS_CONFIG } from '@/constants/deviceControl'
import { useDeviceControlStore } from '@/stores/deviceControl'
import { ElMessage } from 'element-plus'

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const deviceControlStore = useDeviceControlStore()
const speedInput = ref('')
const targetSpeed = ref(0)

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
  if (!props.device.connected) {
    ElMessage.warning('设备未连接，请先连接设备')
    return
  }
  deviceControlStore.startDevice(props.device.id, props.device.type)
}

const handleStop = () => {
  deviceControlStore.stopDevice(props.device.id)
}

const handleSpeedSubmit = () => {
  const speed = Number(speedInput.value)
  if (isNaN(speed) || speed < 0 || speed > 3000) {
    ElMessage.warning('请输入0-3000之间的转速值')
    return
  }
  targetSpeed.value = speed
  deviceControlStore.updateDeviceParam(props.device.id, 'targetSpeed', speed)
  ElMessage.success('转速设置已下发')
}

const formatNumber = (num) => {
  return Number(num).toFixed(2)
}

const updateRate = computed(() => deviceControlStore.getDeviceUpdateRate(props.device.id))

</script>

<template>
  <div class="device-control">
    <div class="control-header">
      <el-button
        :type="isRunning ? 'danger' : 'success'"
        :disabled="!device.connected"
        @click="isRunning ? handleStop() : handleStart()"
      >
        {{ isRunning ? '停止' : '启动' }}
      </el-button>
    </div>
    
    <div v-if="isRunning" class="update-rate">
      更新频率: {{ updateRate || 0 }}ms
    </div>
    
    <div class="params-display">
      <template v-if="device.type === 'stepper_motor'">
        <div class="param-item">
          <span class="param-label">转速设置：</span>
          <div class="speed-input-group">
            <el-input
              v-model="speedInput"
              :disabled="!isRunning"
              placeholder="0-3000"
              style="width: 180px"
            >
              <template #append>RPM</template>
            </el-input>
            <el-button 
              type="primary" 
              :disabled="!isRunning"
              @click="handleSpeedSubmit"
            >
              下发
            </el-button>
          </div>
        </div>
        <div class="param-item">
          <span class="param-label">当前转速：</span>
          <span class="param-value">{{ formatNumber(currentParams.speed) }} RPM</span>
        </div>
        <div class="param-item">
          <span class="param-label">电流：</span>
          <span class="param-value">{{ formatNumber(currentParams.current) }} A</span>
        </div>
        <div class="param-item">
          <span class="param-label">电压：</span>
          <span class="param-value">{{ formatNumber(currentParams.voltage) }} V</span>
        </div>
        <div class="param-item">
          <span class="param-label">功率：</span>
          <span class="param-value">{{ formatNumber(currentParams.power) }} kW</span>
        </div>
        <div class="param-item">
          <span class="param-label">位置：</span>
          <span class="param-value">{{ formatNumber(currentParams.position) }} °</span>
        </div>
      </template>

      <template v-else-if="device.type === 'async_motor'">
        <div class="param-item">
          <span class="param-label">转速设置：</span>
          <div class="speed-input-group">
            <el-input
              v-model="speedInput"
              :disabled="!isRunning"
              placeholder="0-3000"
              style="width: 180px"
            >
              <template #append>RPM</template>
            </el-input>
            <el-button 
              type="primary" 
              :disabled="!isRunning"
              @click="handleSpeedSubmit"
            >
              下发
            </el-button>
          </div>
        </div>
        <div class="param-item">
          <span class="param-label">当前转速：</span>
          <span class="param-value">{{ formatNumber(currentParams.speed) }} RPM</span>
        </div>
        <div class="param-item">
          <span class="param-label">电流：</span>
          <span class="param-value">{{ formatNumber(currentParams.current) }} A</span>
        </div>
        <div class="param-item">
          <span class="param-label">电压：</span>
          <span class="param-value">{{ formatNumber(currentParams.voltage) }} V</span>
        </div>
        <div class="param-item">
          <span class="param-label">功率：</span>
          <span class="param-value">{{ formatNumber(currentParams.power) }} kW</span>
        </div>
        <div class="param-item">
          <span class="param-label">频率：</span>
          <span class="param-value">{{ formatNumber(currentParams.frequency) }} Hz</span>
        </div>
        <div class="param-item">
          <span class="param-label">转差率：</span>
          <span class="param-value">{{ formatNumber(currentParams.slip) }} %</span>
        </div>
      </template>

      <template v-else-if="device.type === 'pmsm_motor'">
        <div class="param-item">
          <span class="param-label">转速设置：</span>
          <div class="speed-input-group">
            <el-input
              v-model="speedInput"
              :disabled="!isRunning"
              placeholder="0-3000"
              style="width: 180px"
            >
              <template #append>RPM</template>
            </el-input>
            <el-button 
              type="primary" 
              :disabled="!isRunning"
              @click="handleSpeedSubmit"
            >
              下发
            </el-button>
          </div>
        </div>
        <div class="param-item">
          <span class="param-label">当前转速：</span>
          <span class="param-value">{{ formatNumber(currentParams.speed) }} RPM</span>
        </div>
        <div class="param-item">
          <span class="param-label">电流：</span>
          <span class="param-value">{{ formatNumber(currentParams.current) }} A</span>
        </div>
        <div class="param-item">
          <span class="param-label">电压：</span>
          <span class="param-value">{{ formatNumber(currentParams.voltage) }} V</span>
        </div>
        <div class="param-item">
          <span class="param-label">功率：</span>
          <span class="param-value">{{ formatNumber(currentParams.power) }} kW</span>
        </div>
        <div class="param-item">
          <span class="param-label">转矩：</span>
          <span class="param-value">{{ formatNumber(currentParams.torque) }} N·m</span>
        </div>
        <div class="param-item">
          <span class="param-label">效率：</span>
          <span class="param-value">{{ formatNumber(currentParams.efficiency) }} %</span>
        </div>
      </template>

      <template v-else-if="device.type === 'fan'">
        <div class="param-item">
          <span class="param-label">转速：</span>
          <span class="param-value">{{ formatNumber(currentParams.speed) }} RPM</span>
        </div>
        <div class="param-item">
          <span class="param-label">风量：</span>
          <span class="param-value">{{ formatNumber(currentParams.airflow) }} m³/h</span>
        </div>
        <div class="param-item">
          <span class="param-label">静压：</span>
          <span class="param-value">{{ formatNumber(currentParams.pressure) }} Pa</span>
        </div>
        <div class="param-item">
          <span class="param-label">功率：</span>
          <span class="param-value">{{ formatNumber(currentParams.power) }} kW</span>
        </div>
      </template>

      <template v-else-if="device.type === 'pump'">
        <div class="param-item">
          <span class="param-label">转速：</span>
          <span class="param-value">{{ formatNumber(currentParams.speed) }} RPM</span>
        </div>
        <div class="param-item">
          <span class="param-label">流量：</span>
          <span class="param-value">{{ formatNumber(currentParams.flow) }} m³/h</span>
        </div>
        <div class="param-item">
          <span class="param-label">扬程：</span>
          <span class="param-value">{{ formatNumber(currentParams.head) }} m</span>
        </div>
        <div class="param-item">
          <span class="param-label">功率：</span>
          <span class="param-value">{{ formatNumber(currentParams.power) }} kW</span>
        </div>
      </template>

      <template v-else-if="device.type === 'compressor'">
        <div class="param-item">
          <span class="param-label">转速：</span>
          <span class="param-value">{{ formatNumber(currentParams.speed) }} RPM</span>
        </div>
        <div class="param-item">
          <span class="param-label">排气压力：</span>
          <span class="param-value">{{ formatNumber(currentParams.pressure) }} MPa</span>
        </div>
        <div class="param-item">
          <span class="param-label">排气温度：</span>
          <span class="param-value">{{ formatNumber(currentParams.temperature) }} °C</span>
        </div>
        <div class="param-item">
          <span class="param-label">功率：</span>
          <span class="param-value">{{ formatNumber(currentParams.power) }} kW</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.device-control {
  padding: 15px;
  position: relative;
}

.control-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.params-display {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.param-label {
  width: 80px;
  color: #606266;
}

.param-value {
  color: #303133;
  font-family: monospace;
  font-size: 16px;
}

.speed-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  max-width: 300px;
}

.speed-input-group .el-input {
  flex: 1;
}

.update-rate {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 12px;
  color: #909399;
  background-color: #f4f4f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
}
</style> 