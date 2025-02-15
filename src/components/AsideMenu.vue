<script lang="ts" setup>
import { ref } from 'vue'
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
  Refresh,
  TurnOff,
  Message,
  HomeFilled
} from '@element-plus/icons-vue'
import { useDashboardStore } from '@/stores/global';

const dashboard = useDashboardStore()

const judgeShow = () => {
  return dashboard.isFanRunning || dashboard.isTestRunning || dashboard.autoCollectStatus == 3 || dashboard.autoCollectStatus == 4 || dashboard.isFanConnected || dashboard.isTestConnected
}

</script>


<template>
  <el-menu default-active="/" class="el-menu-vertical-demo" :router="true">
    <el-menu-item index="/">
      <el-icon>
        <home-filled />
      </el-icon>
      <template #title>首页</template>
    </el-menu-item>
    <el-menu-item index="/devicedashboard">
      <el-icon>
        <location />
      </el-icon>
      <template #title>设备仪表盘</template>
    </el-menu-item>
    <el-menu-item index="/dashboard">
      <el-icon>
        <location />
      </el-icon>
      <template #title>仪表盘</template>
    </el-menu-item>
    <el-menu-item index="/database">
      <el-icon>
        <icon-menu />
      </el-icon>
      <template #title>数据库</template>
    </el-menu-item>
    <el-menu-item index="/settings" :disabled="judgeShow()">
      <el-icon>
        <setting />
      </el-icon>
      <template #title>协议配置</template>
    </el-menu-item>
    <el-menu-item index="/datanotation">
      <el-icon>
        <document />
      </el-icon>
      <span>数据标注平台</span>
    </el-menu-item>
    <el-menu-item index="/datacleaning">
      <el-icon>
        <refresh />
      </el-icon>
      <span>数据清洗</span>
    </el-menu-item>
    <el-menu-item index="/model">
      <el-icon>
        <turn-off />
      </el-icon>
      <template #title>模型管理</template>
    </el-menu-item>
    <el-menu-item index="/training">
      <el-icon>
        <message />
      </el-icon>
      <template #title>模型训练</template>
    </el-menu-item>
  </el-menu>
</template>


<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 150px;
  height: 85vh;
}
</style>