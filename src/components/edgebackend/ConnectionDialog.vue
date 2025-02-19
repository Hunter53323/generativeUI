<template>
  <el-dialog
    :title="isEdit ? '编辑连接' : '新建连接'"
    v-model="dialogVisible"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入连接名称" />
      </el-form-item>
      
      <el-form-item label="主机地址" prop="host">
        <el-input v-model="form.host" placeholder="请输入主机地址" />
      </el-form-item>
      
      <el-form-item label="端口" prop="port">
        <el-input-number 
          v-model="form.port" 
          :min="1" 
          :max="65535" 
          placeholder="请输入端口号"
        />
      </el-form-item>
      
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>
      
      <el-form-item label="密码" prop="password">
        <el-input 
          v-model="form.password" 
          type="password" 
          placeholder="请输入密码" 
          show-password
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  connection: {
    type: Object,
    default: () => ({
      name: '',
      host: '',
      port: 9654,
      username: '',
      password: ''
    })
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const dialogVisible = ref(false)
const formRef = ref(null)

const form = ref({
  name: '',
  host: '',
  port: 9654,
  username: '',
  password: ''
})

const rules = {
  name: [
    { required: true, message: '请输入连接名称', trigger: 'blur' }
  ],
  host: [
    { required: true, message: '请输入主机地址', trigger: 'blur' }
  ],
  port: [
    { required: true, message: '请输入端口', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val && props.isEdit) {
    // 编辑模式，填充表单
    form.value = { ...props.connection }
  } else {
    // 新建模式，重置表单
    form.value = {
      name: '',
      host: '',
      port: 9654,
      username: '',
      password: ''
    }
  }
})

// 监听dialog visible变化
watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', { ...form.value })
    handleClose()
  } catch (error) {
    ElMessage.error('请填写完整信息')
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 