<template>
  <div class="top-info-bar">
    <div class="time-section">
      <el-icon :size="16" class="time-icon">
        <Clock />
      </el-icon>
      <span class="time-text">{{ currentTime }}</span>
    </div>
    <el-divider direction="vertical" class="info-divider" />
    <div class="user-section">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info-trigger">
          <el-avatar :size="32" class="user-avatar">
            {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
          </el-avatar>
          <div class="user-details">
            <span class="user-name">{{ user.name || '未设置用户名' }}</span>
            <span class="user-email">{{ user.email || '未设置邮箱' }}</span>
          </div>
          <el-icon class="dropdown-icon"><CaretBottom /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="editProfile">
              <el-icon><Edit /></el-icon>
              <span>修改信息</span>
            </el-dropdown-item>
            <el-dropdown-item command="lastLogin">
              <el-icon><Timer /></el-icon>
              <span>上次登录: {{ user.lastTime || '未记录' }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { Clock, CaretBottom, Edit, Timer } from '@element-plus/icons-vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({ name: '', email: '' })
  }
})

const emit = defineEmits(['user-click'])

const currentTime = ref('')
let timer = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const handleCommand = (command) => {
  if (command === 'editProfile') {
    emit('user-click')
  }
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.top-info-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 100%;
}

.time-section {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
}

.time-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.info-divider {
  height: 1.2em;
  border-color: var(--el-border-color-lighter);
}

.user-section {
  display: flex;
  align-items: center;
}

.user-info-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-info-trigger:hover {
  background-color: var(--el-fill-color-light);
}

.user-avatar {
  background: var(--el-color-primary);
  color: white;
  font-weight: bold;
}

.user-details {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  margin-right: 4px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.user-email {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.dropdown-icon {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  line-height: 1.4;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 4px;
  font-size: 16px;
}
</style> 