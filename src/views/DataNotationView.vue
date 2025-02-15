<template>
  <div class="notation-container">
    <div class="redirect-message">
      <el-alert
        title="正在打开数据标注平台..."
        type="info"
        show-icon
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const LABEL_STUDIO_URL = 'http://127.0.0.1:8081'

onMounted(() => {
  // 在新窗口打开
  window.open(LABEL_STUDIO_URL, '_blank')
})
</script>

<style scoped>
.notation-container {
  width: 100%;
  height: calc(100vh - 60px);
  position: relative;
  background-color: #f5f7fa;
}

.redirect-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 500px;
  text-align: center;
}
</style> 