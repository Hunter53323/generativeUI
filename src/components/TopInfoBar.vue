<template>
  <div class="top-info-bar">
    <div class="user-info">
      <el-dropdown>
        <span class="user-dropdown">
          <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
          <span class="username">{{ settings.user.name || '测试用户' }}</span>
          <el-icon><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <span>邮箱: {{ settings.user.email || 'test@example.com' }}</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="settings.changeUser">
              <el-icon><setting /></el-icon>
              <span>修改信息</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template> 