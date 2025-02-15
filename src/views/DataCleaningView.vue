<template>
  <div class="cleaning-container">
    <div v-if="loading" class="loading-container">
      <el-loading :fullscreen="false">加载中...</el-loading>
    </div>
    
    <iframe 
      v-show="!loading"
      :src="CLEANING_URL"
      class="cleaning-iframe"
      @load="handleIframeLoad"
      @error="handleIframeError"
      allow="same-origin"
      referrerpolicy="origin"
    ></iframe>

    <div v-if="error" class="error-message">
      <el-alert
        :title="errorMessage"
        type="error"
        :description="errorDescription"
        show-icon
      />
      <el-button type="primary" class="retry-button" @click="retryLoading">
        重试
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const CLEANING_URL = 'http://127.0.0.1:3333'
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('加载失败')
const errorDescription = ref('无法连接到数据清洗平台')

const handleIframeLoad = () => {
  loading.value = false
  error.value = false
}

const handleIframeError = () => {
  loading.value = false
  error.value = true
  errorMessage.value = '连接失败'
  errorDescription.value = '无法连接到数据清洗平台，请确保服务已启动'
}

const retryLoading = () => {
  loading.value = true
  error.value = false
  // 重新加载iframe
  const iframe = document.querySelector('.cleaning-iframe')
  if (iframe) {
    iframe.src = CLEANING_URL
  }
}
</script>

<style scoped>
.cleaning-container {
  width: 100%;
  height: calc(100vh - 60px);
  position: relative;
  background-color: #f5f7fa;
  overflow: hidden;
}

.cleaning-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: white;
}

.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 500px;
  text-align: center;
}

.retry-button {
  margin-top: 20px;
}
</style> 