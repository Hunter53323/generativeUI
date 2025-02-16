<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'add'])

// 计算属性来处理 v-model
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 新设备表单
const newDevice = reactive({
  name: '',
  ip: '',
  protocolType: 'Modbus TCP',
  modbustcp: {
    host: '',
    port: 502
  },
  modbusrtu: {
    port: 'COM1',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'
  },
  mqtt: {
    host: '',
    port: 1883,
    topic: ''
  },
  https: {
    url: ''
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleAdd = () => {
  emit('add', newDevice)
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加设备"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="newDevice" label-width="100px">
      <el-form-item label="设备名称">
        <el-input v-model="newDevice.name" placeholder="请输入设备名称" />
      </el-form-item>
      <el-form-item label="IP地址">
        <el-input v-model="newDevice.ip" placeholder="请输入IP地址" />
      </el-form-item>
      <el-form-item label="协议类型">
        <el-select v-model="newDevice.protocolType" style="width: 100%">
          <el-option label="Modbus TCP" value="Modbus TCP" />
          <el-option label="Modbus RTU" value="Modbus RTU" />
          <el-option label="MQTT" value="MQTT" />
          <el-option label="HTTPS" value="HTTPS" />
        </el-select>
      </el-form-item>

      <!-- Modbus TCP 参数 -->
      <template v-if="newDevice.protocolType === 'Modbus TCP'">
        <el-form-item label="TCP Host">
          <el-input 
            v-model="newDevice.modbustcp.host" 
            placeholder="默认使用设备IP"
          />
        </el-form-item>
        <el-form-item label="TCP Port">
          <el-input-number 
            v-model="newDevice.modbustcp.port" 
            :min="1" 
            :max="65535"
          />
        </el-form-item>
      </template>

      <!-- Modbus RTU 参数 -->
      <template v-if="newDevice.protocolType === 'Modbus RTU'">
        <el-form-item label="串口">
          <el-input 
            v-model="newDevice.modbusrtu.port" 
            placeholder="例如：COM1"
          />
        </el-form-item>
        <el-form-item label="波特率">
          <el-input-number 
            v-model="newDevice.modbusrtu.baudRate" 
            :min="1200"
            :max="115200"
          />
        </el-form-item>
        <el-form-item label="数据位">
          <el-input-number 
            v-model="newDevice.modbusrtu.dataBits" 
            :min="7"
            :max="8"
          />
        </el-form-item>
        <el-form-item label="停止位">
          <el-input-number 
            v-model="newDevice.modbusrtu.stopBits" 
            :min="1"
            :max="2"
          />
        </el-form-item>
        <el-form-item label="校验">
          <el-select v-model="newDevice.modbusrtu.parity">
            <el-option label="无校验" value="none" />
            <el-option label="偶校验" value="even" />
            <el-option label="奇校验" value="odd" />
          </el-select>
        </el-form-item>
      </template>

      <!-- MQTT 参数 -->
      <template v-if="newDevice.protocolType === 'MQTT'">
        <el-form-item label="MQTT Host">
          <el-input 
            v-model="newDevice.mqtt.host" 
            placeholder="请输入MQTT服务器地址"
          />
        </el-form-item>
        <el-form-item label="MQTT Port">
          <el-input-number 
            v-model="newDevice.mqtt.port" 
            :min="1" 
            :max="65535"
          />
        </el-form-item>
        <el-form-item label="Topic">
          <el-input 
            v-model="newDevice.mqtt.topic" 
            placeholder="请输入Topic"
          />
        </el-form-item>
      </template>

      <!-- HTTPS 参数 -->
      <template v-if="newDevice.protocolType === 'HTTPS'">
        <el-form-item label="URL">
          <el-input 
            v-model="newDevice.https.url" 
            placeholder="请输入HTTPS URL"
          />
        </el-form-item>
      </template>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template> 