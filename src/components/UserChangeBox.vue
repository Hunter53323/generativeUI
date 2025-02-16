<script setup lang="js">
import { ref } from 'vue'
import { useGlobalStore, useSettingsStore } from '@/stores/global'
import { ElMessage, ElMessageBox } from 'element-plus'

const global = useGlobalStore()
const settings = useSettingsStore()

const formUser = ref({
  name: settings.user.name || '',
  email: settings.user.email || ''
})

const handleSubmit = async () => {
  const formData = new FormData()
  formData.append('receiver_email', formUser.value.email)
  formData.append('receiver_name', formUser.value.name)
  
  // 更新 store 中的用户信息
  settings.user = {
    ...settings.user,
    name: formUser.value.name,
    email: formUser.value.email,
    lastTime: new Date().toLocaleString()
  }
  
  // 更新后端数据
  await settings.updateUser()
  
  ElMessage.success('用户信息更新成功')
  ElMessageBox.close()
}
</script>

<template>
  <el-form 
    :model="formUser"
    label-width="80px"
  >
    <el-form-item label="用户名">
      <el-input 
        v-model="formUser.name"
        placeholder="请输入用户名"
      />
    </el-form-item>
    <el-form-item label="邮箱">
      <el-input 
        v-model="formUser.email"
        placeholder="请输入邮箱地址"
      />
    </el-form-item>
    <el-form-item class="dialog-footer">
      <el-button type="primary" @click="handleSubmit">
        确认
      </el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.dialog-footer {
  margin-bottom: 0;
  padding-top: 18px;
  text-align: right;
}

:deep(.el-input__wrapper) {
  width: 100%;
}
</style>
