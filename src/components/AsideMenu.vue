<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
  Refresh,
  TurnOff,
  Message,
  HomeFilled,
  Monitor,
  DataLine,
  Collection,
  Folder,
  Connection
} from '@element-plus/icons-vue'
import { useDashboardStore } from '@/stores/global';

const dashboard = useDashboardStore()
const route = useRoute()
const activeMenu = ref(route.path)

// 监听路由变化，更新菜单选中状态
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
})

</script>


<template>
  <el-menu 
    :default-active="activeMenu" 
    class="el-menu-vertical-demo" 
    :router="true"
  >
    <!-- 首页 -->
    <el-menu-item index="/">
      <el-icon><home-filled /></el-icon>
      <template #title>首页</template>
    </el-menu-item>

    <!-- 设备管理 -->
    <el-sub-menu index="/device">
      <template #title>
        <el-icon><monitor /></el-icon>
        <span>设备管理</span>
      </template>
      <el-menu-item index="/devicedashboard">
        <el-icon><location /></el-icon>
        <span>设备仪表盘</span>
      </el-menu-item>
      <el-menu-item index="/dashboard">
        <el-icon><location /></el-icon>
        <span>仪表盘</span>
      </el-menu-item>
      <el-menu-item index="/edge-devices">
        <el-icon><location /></el-icon>
        <span>边缘设备管理</span>
      </el-menu-item>
      <el-menu-item index="/edge-backend">
        <el-icon><Connection /></el-icon>
        <span>边缘设备后台</span>
      </el-menu-item>
      <el-menu-item index="/settings">
        <el-icon><setting /></el-icon>
        <span>协议配置</span>
      </el-menu-item>
    </el-sub-menu>

    <!-- 数据管理 -->
    <el-sub-menu index="/data">
      <template #title>
        <el-icon><data-line /></el-icon>
        <span>数据管理</span>
      </template>
      <el-menu-item index="/database">
        <el-icon><icon-menu /></el-icon>
        <span>数据库</span>
      </el-menu-item>
      <el-menu-item index="/device-database">
        <el-icon><folder /></el-icon>
        <span>设备数据库</span>
      </el-menu-item>
    </el-sub-menu>

    <!-- 模型管理 -->
    <el-sub-menu index="/model">
      <template #title>
        <el-icon><collection /></el-icon>
        <span>模型管理</span>
      </template>
      <el-menu-item index="/datanotation">
        <el-icon><document /></el-icon>
        <span>数据标注平台</span>
      </el-menu-item>
      <el-menu-item index="/datacleaning">
        <el-icon><refresh /></el-icon>
        <span>数据清洗</span>
      </el-menu-item>
      <el-menu-item index="/model">
        <el-icon><turn-off /></el-icon>
        <span>模型管理</span>
      </el-menu-item>
      <el-menu-item index="/modeltrain">
        <el-icon><message /></el-icon>
        <span>模型训练</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>


<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  height: 85vh;
}

.el-menu-item {
  padding-left: 30px !important;
}

.el-sub-menu .el-menu-item {
  padding-left: 50px !important;
}

:deep(.el-sub-menu__title) {
  padding-left: 20px !important;
}

/* 添加激活菜单项的样式 */
.el-menu-item.is-active {
  background-color: #ecf5ff !important;
  color: #409EFF !important;
}

/* 添加子菜单展开时的样式 */
.el-sub-menu.is-opened > .el-sub-menu__title {
  color: #409EFF !important;
}
</style>