<script setup>
import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
import { DEVICE_PARAMS_CONFIG } from '@/constants/deviceControl'
import { useDeviceControlStore } from '@/stores/deviceControl'
import { ElMessage } from 'element-plus'
import { API_CONFIG } from '@/config/api'

// 修改 API URL 常量定义
const DC_MOTOR_API_URL = API_CONFIG.DC_MOTOR_API_URL
const STEPPER_MOTOR_API_URL = API_CONFIG.STEPPER_MOTOR_API_URL

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
})

const deviceControlStore = useDeviceControlStore()
const speedInput = ref('')
const targetSpeed = ref(0)
const transmitterInput = ref('')
const receiverInput = ref('')

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
  if (props.device.type === 'stepper_motor') {
    const loading = ElMessage({
      message: '正在启动设备...',
      duration: 0
    })
    
    fetch(`${STEPPER_MOTOR_API_URL}/api/v1/control/startControl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceUID: props.device.id
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    })
    .then(data => {
      loading.close()
      if (data.result === 'success') {
        deviceControlStore.startDevice(props.device.id, props.device.type)
        ElMessage.success('设备启动成功')
      } else {
        ElMessage.error('设备启动失败：' + (data.message || '请检查设备状态'))
      }
    })
    .catch(error => {
      loading.close()
      console.error('Error starting device:', error)
      ElMessage.error('设备启动失败：请检查网络连接')
    })
    return
  }

  if (!props.device.connected) {
    ElMessage.warning('设备未连接，请先连接设备')
    return
  }

  if (props.device.type === 'dc_motor') {
    const loading = ElMessage({
      message: '正在启动设备...',
      duration: 0
    })
    
    fetch(`${DC_MOTOR_API_URL}/api/v1/control/startControl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceUID: props.device.id
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    })
    .then(data => {
      loading.close()
      if (data.result === 'success') {
        deviceControlStore.startDevice(props.device.id, props.device.type)
        ElMessage.success('设备启动成功')
      } else {
        ElMessage.error('设备启动失败：' + (data.message || '请检查设备状态'))
      }
    })
    .catch(error => {
      loading.close()
      console.error('Error starting device:', error)
      ElMessage.error('设备启动失败：请检查网络连接')
    })
    return
  }

  // 其他设备类型的原有启动逻辑
  try {
    deviceControlStore.startDevice(props.device.id, props.device.type)
    ElMessage.success('设备启动成功')
  } catch (error) {
    console.error('Error starting device:', error)
    ElMessage.error('设备启动失败')
  }
}

const handleStop = () => {
  if (props.device.type === 'stepper_motor') {
    const loading = ElMessage({
      message: '正在停止设备...',
      duration: 0
    })

    fetch(`${STEPPER_MOTOR_API_URL}/api/v1/control/stopControl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceUID: props.device.id
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    })
    .then(data => {
      loading.close()
      if (data.result === 'success') {
        deviceControlStore.stopDevice(props.device.id)
        ElMessage.success('设备已停止')
      } else {
        ElMessage.error('设备停止失败：' + (data.message || '请检查设备状态'))
      }
    })
    .catch(error => {
      loading.close()
      console.error('Error stopping device:', error)
      ElMessage.error('设备停止失败：请检查网络连接')
    })
    return
  }

  if (props.device.type === 'dc_motor') {
    const loading = ElMessage({
      message: '正在停止设备...',
      duration: 0
    })

    fetch(`${DC_MOTOR_API_URL}/api/v1/control/stopControl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceUID: props.device.id
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    })
    .then(data => {
      loading.close()
      if (data.result === 'success') {
        deviceControlStore.stopDevice(props.device.id)
        ElMessage.success('设备已停止')
      } else {
        ElMessage.error('设备停止失败：' + (data.message || '请检查设备状态'))
      }
    })
    .catch(error => {
      loading.close()
      console.error('Error stopping device:', error)
      ElMessage.error('设备停止失败：请检查网络连接')
    })
    return
  }

  // 其他设备类型的停止逻辑
  try {
    deviceControlStore.stopDevice(props.device.id)
    ElMessage.success('设备已停止')
  } catch (error) {
    console.error('Error stopping device:', error)
    ElMessage.error('设备停止失败')
  }
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

const handlePwmSubmit = () => {
  const pwm = Number(speedInput.value)
  if (isNaN(pwm) || pwm < -10000 || pwm > 10000) {
    ElMessage.warning('请输入-10000~10000之间的PWM值')
    return
  }

  if (props.device.type === 'dc_motor') {
    const loading = ElMessage({
      message: '正在设置PWM...',
      duration: 0
    })

    fetch(`${DC_MOTOR_API_URL}/api/v1/control/setValue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceUID: props.device.id,
        values: [
          {
            index: 'pwm',
            name: 'pwm',
            value: pwm.toString()
          }
        ]
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    })
    .then(data => {
      loading.close()
      if (data.result === 'success') {
        deviceControlStore.updateDeviceParam(props.device.id, 'pwm', pwm)
        ElMessage.success('PWM设置成功')
      } else {
        ElMessage.error('PWM设置失败：' + (data.message || '请检查设备状态'))
      }
    })
    .catch(error => {
      loading.close()
      console.error('Error setting PWM:', error)
      ElMessage.error('PWM设置失败：请检查网络连接')
    })
    return
  }
  
  deviceControlStore.updateDeviceParam(props.device.id, 'pwm', pwm)
  ElMessage.success('PWM设置已下发')
}

const handleDutyCycleSubmit = () => {
  if (props.device.type === 'stepper_motor') {
    const transmitter = Number(transmitterInput.value)
    const receiver = Number(receiverInput.value)
    
    // 验证两个输入值
    if (isNaN(transmitter) || transmitter < 0 || transmitter > 100 ||
        isNaN(receiver) || receiver < 0 || receiver > 100) {
      ElMessage.warning('请输入0-100之间的占空比值')
      return
    }

    const loading = ElMessage({
      message: '正在设置占空比...',
      duration: 0
    })

    fetch(`${STEPPER_MOTOR_API_URL}/api/v1/control/setValue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceUID: props.device.id,
        values: [
          {
            index: 'transmitter',
            name: 'transmitter',
            value: transmitter.toString()
          },
          {
            index: 'receiver',
            name: 'receiver',
            value: receiver.toString()
          }
        ]
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok')
      return response.json()
    })
    .then(data => {
      loading.close()
      if (data.result === 'success') {
        deviceControlStore.updateDeviceParam(props.device.id, 'transmitter', transmitter)
        deviceControlStore.updateDeviceParam(props.device.id, 'receiver', receiver)
        ElMessage.success('占空比设置成功')
      } else {
        ElMessage.error('占空比设置失败：' + (data.message || '请检查设备状态'))
      }
    })
    .catch(error => {
      loading.close()
      console.error('Error setting duty cycle:', error)
      ElMessage.error('占空比设置失败：请检查网络连接')
    })
  }
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
        <div class="param-group">
          <div class="param-item">
            <span class="param-label">发送机占空比设置：</span>
            <div class="speed-input-group">
              <el-input
                v-model="transmitterInput"
                :disabled="!isRunning"
                placeholder="0-100"
                style="width: 180px"
              >
                <template #append>%</template>
              </el-input>
            </div>
          </div>
          <div class="param-item">
            <span class="param-label">接收机占空比设置：</span>
            <div class="speed-input-group">
              <el-input
                v-model="receiverInput"
                :disabled="!isRunning"
                placeholder="0-100"
                style="width: 180px"
              >
                <template #append>%</template>
              </el-input>
            </div>
          </div>
          <el-button 
            type="primary" 
            :disabled="!isRunning"
            @click="handleDutyCycleSubmit"
          >
            下发占空比
          </el-button>
        </div>
        <div class="param-item">
          <span class="param-label">当前发送机占空比：</span>
          <span class="param-value">{{ formatNumber(currentParams.transmitter) }} %</span>
        </div>
        <div class="param-item">
          <span class="param-label">当前接收机占空比：</span>
          <span class="param-value">{{ formatNumber(currentParams.receiver) }} %</span>
        </div>
        <div class="param-item">
          <span class="param-label">轴角偏差：</span>
          <span class="param-value">{{ formatNumber(currentParams.axis_deviation) }} °</span>
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

      <template v-else-if="device.type === 'dc_motor'">
        <div class="param-item">
          <span class="param-label">PWM设置：</span>
          <div class="speed-input-group">
            <el-input
              v-model="speedInput"
              :disabled="!isRunning"
              placeholder="-10000~10000"
              style="width: 180px"
            >
              <template #append>PWM</template>
            </el-input>
            <el-button 
              type="primary" 
              :disabled="!isRunning"
              @click="handlePwmSubmit"
            >
              下发
            </el-button>
          </div>
        </div>
        <div class="param-item">
          <span class="param-label">当前PWM：</span>
          <span class="param-value">{{ formatNumber(currentParams.pwm) }}</span>
        </div>
        <div class="param-item">
          <span class="param-label">电压：</span>
          <span class="param-value">{{ formatNumber(currentParams.voltage) }} V</span>
        </div>
        <div class="param-item">
          <span class="param-label">U相电流：</span>
          <span class="param-value">{{ formatNumber(currentParams.current_u, 'mA') }} mA</span>
        </div>
        <div class="param-item">
          <span class="param-label">V相电流：</span>
          <span class="param-value">{{ formatNumber(currentParams.current_v, 'mA') }} mA</span>
        </div>
        <div class="param-item">
          <span class="param-label">W相电流：</span>
          <span class="param-value">{{ formatNumber(currentParams.current_w, 'mA') }} mA</span>
        </div>
        <div class="param-item">
          <span class="param-label">母线电流：</span>
          <span class="param-value">{{ formatNumber(currentParams.current_bus, 'mA') }} mA</span>
        </div>
        <div class="param-item">
          <span class="param-label">温度：</span>
          <span class="param-value">{{ formatNumber(currentParams.temperature) }} ℃</span>
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

.param-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
</style> 