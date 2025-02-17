<template>
  <div class="settings-container">
    <div class="header">
      <h2>协议配置</h2>
      <div class="actions">
        <el-button type="primary" @click="handleSaveAll">
          <el-icon><Document /></el-icon>
          保存所有配置
        </el-button>
      </div>
    </div>

    <ProtocolConfig />
  </div>
</template>

<script setup>
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ProtocolConfig from '@/components/settings/ProtocolConfig.vue'
import { useProtocolSettingsStore } from '@/stores/protocolSettings'

const protocolStore = useProtocolSettingsStore()

const handleSaveAll = async () => {
  try {
    await protocolStore.saveConfigurations()
    ElMessage.success('配置保存成功')
  } catch (error) {
    ElMessage.error('配置保存失败')
  }
}
</script>

<style scoped>
.settings-container {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
</style>
  
  