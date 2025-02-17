<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'created'])

const formData = reactive({
  IP: '',
  hostname: '',
  type: '',
  OS: '',
  protocol: [],
  CPU: { amount: 0, type: '', unit: '' },
  GPU: { amount: 0, type: '', unit: '' },
  disk: { amount: 0, type: '', unit: '' },
  mem: { amount: 0, type: '', unit: '' }
})

const deviceTypes = [
  { label: '风机', value: 'fan' },
  { label: '电机', value: 'motor' },
  { label: '虚拟设备', value: 'virtual' },
  { label: 'PC', value: 'pc' },
  { label: '边缘设备', value: 'edge' }
]

const protocolOptions = [
  { label: 'Modbus', value: 'modbus' },
  { label: 'UART', value: 'uart' }
]

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = () => {
  emit('created', formData)
  handleClose()
}
</script>

<template>
  <el-dialog 
    title="添加设备" 
    :visible="visible" 
    @close="handleClose"
    width="600px"
  >
    <el-form :model="formData" label-width="100px">
      <el-form-item label="IP地址" required>
        <el-input v-model="formData.IP" placeholder="请输入IP地址" />
      </el-form-item>
      
      <el-form-item label="主机名">
        <el-input v-model="formData.hostname" placeholder="请输入主机名" />
      </el-form-item>
      
      <el-form-item label="设备类型" required>
        <el-select v-model="formData.type" placeholder="请选择设备类型">
          <el-option 
            v-for="item in deviceTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="操作系统">
        <el-input v-model="formData.OS" placeholder="请输入操作系统" />
      </el-form-item>
      
      <el-form-item label="通信协议" required>
        <el-select 
          v-model="formData.protocol" 
          multiple 
          placeholder="请选择通信协议"
        >
          <el-option
            v-for="item in protocolOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="CPU">
        <el-row :gutter="10">
          <el-col :span="8">
            <el-input-number v-model="formData.CPU.amount" placeholder="数量" />
          </el-col>
          <el-col :span="8">
            <el-input v-model="formData.CPU.type" placeholder="类型" />
          </el-col>
          <el-col :span="8">
            <el-input v-model="formData.CPU.unit" placeholder="单位" />
          </el-col>
        </el-row>
      </el-form-item>
      
      <!-- 类似的表单项用于 GPU、内存和磁盘 -->
      
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template> 