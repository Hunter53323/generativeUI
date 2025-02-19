<template>
  <el-card class="terminal-card">
    <template #header>
      <div class="terminal-header">
        <span class="terminal-title">终端 - {{ connection.name }}</span>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>
    </template>
    
    <iframe
      v-if="connection.connected"
      :src="terminalUrl"
      class="terminal-iframe"
      ref="terminalRef"
      @load="handleIframeLoad"
      @error="handleIframeError"
    ></iframe>
    <div v-else class="terminal-container">
      <div class="terminal-message">
        未连接到服务器
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  connection: {
    type: Object,
    required: true
  }
})

const error = ref('')

// 加密密码
const encryptPassword = (password) => {
  // 使用 Base64 编码
  return btoa(password)
}

// 构建终端URL，包含登录信息
const terminalUrl = computed(() => {
  if (!props.connection.connected) return ''
  
  const baseUrl = `http://${props.connection.host}:${props.connection.port}`
  const params = new URLSearchParams({
    hostname: props.connection.host,  // 目标主机
    username: props.connection.username,
    password: encryptPassword(props.connection.password), // 加密密码
    port: 22  // SSH端口
  })
  
  const url = `${baseUrl}/?${params.toString()}`
  console.log('生成的URL:', url)
  return url
})

// 处理iframe加载完成
const handleIframeLoad = (event) => {
  console.log('Terminal loaded')
  error.value = ''
}

// 处理iframe加载错误
const handleIframeError = (event) => {
  console.error('iframe加载失败:', event)
  error.value = '终端加载失败'
}
</script>

<style scoped>
.terminal-card {
  margin-top: 24px;
  background-color: #1e1e1e;
  border: none;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.terminal-card :deep(.el-card__header) {
  background-color: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
  padding: 12px 20px;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.terminal-title {
  color: #e0e0e0;
  font-size: 14px;
  font-weight: 500;
}

.error-message {
  color: #ff6b6b;
  font-size: 14px;
}

.terminal-iframe {
  width: 100%;
  height: 600px;
  border: none;
  background-color: #1e1e1e;
}

.terminal-container {
  background-color: #1e1e1e;
  color: #fff;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 4px 4px;
}

.terminal-message {
  color: #888;
  text-align: center;
  padding: 20px;
  word-break: break-all;
  font-family: monospace;
}

/* 添加一些过渡效果 */
.terminal-card {
  transition: box-shadow 0.3s ease;
}

.terminal-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0,0,0,0.2);
}
</style> 