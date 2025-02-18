<script setup>
import { ref, reactive } from 'vue'
import { useDeviceDatabaseStore } from '@/stores/deviceDatabase'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'success'])

const deviceDB = useDeviceDatabaseStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  ip: '',
  hostname: '',
  type: '',
  os: '',
  protocol: [],
  deviceDesc: ''
})

const rules = {
  ip: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  protocol: [{ required: true, message: '请选择至少一个协议', trigger: 'change' }]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await deviceDB.createDeviceResource({
      ip: form.ip,
      hostname: form.hostname,
      type: form.type,
      os: form.os,
      protocol: form.protocol
    })
    
    ElMessage.success('设备添加成功')
    emit('success')
    emit('update:modelValue', false)
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    title="添加设备"
    width="600px"
  >
    <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item label="IP地址" prop="ip">
        <el-input v-model="form.ip" placeholder="请输入IP地址" />
      </el-form-item>
      
      <el-form-item label="主机名" prop="hostname">
        <el-input v-model="form.hostname" placeholder="请输入主机名" />
      </el-form-item>
      
      <el-form-item label="设备类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择设备类型">
          <el-option label="风机" value="fan" />
          <el-option label="电机" value="motor" />
          <el-option label="虚拟设备" value="virtual" />
          <el-option label="PC" value="pc" />
          <el-option label="边缘设备" value="edge" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="操作系统" prop="os">
        <el-input v-model="form.os" placeholder="请输入操作系统" />
      </el-form-item>
      
      <el-form-item label="协议" prop="protocol">
        <el-select v-model="form.protocol" multiple placeholder="请选择协议">
          <el-option label="Modbus" value="modbus" />
          <el-option label="UART" value="uart" />
        </el-select>
      </el-form-item>

      <el-form-item label="设备描述" prop="deviceDesc">
        <el-input 
          v-model="form.deviceDesc" 
          type="textarea" 
          placeholder="请输入设备描述"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        确定
      </el-button>
    </template>
  </el-dialog>
</template> 