<script setup>
import { RouterView } from 'vue-router'
import AsideMenu from './components/AsideMenu.vue'
import { useDashboardStore, useSettingsStore, useDBStore, useGlobalStore } from '@/stores/global'
import { onMounted, reactive, h } from '@vue/runtime-core';
import { ElMessageBox, ElMessage } from 'element-plus';
import UserChangeBox from './components/UserChangeBox.vue';
import { useRouter } from 'vue-router';
import TopInfoBar from '@/components/common/TopInfoBar.vue'
import logoUrl from '@/assets/logo.png'

const router = useRouter()
const global = useGlobalStore()
const dashboard = useDashboardStore()
const settings = useSettingsStore()
const db = useDBStore()

// const changeUser = () => {
//   let formUser = reactive({
//     name: settings.user.name,
//     email: settings.user.email,
//   })
//   ElMessageBox({
//     title: '请输入您的信息',
//     customClass: "user-change-form",
//     message:
//       h(UserChangeBox, { modelValue: formUser, 'onUpdate:modelValue': value => formUser = value }),
//     confirmButtonText: '确认',
//     showConfirmButton: false,
//     closeOnClickModal: false,
//     closeOnPressEscape: false,
//     "show-close": false
//   })
//   router.push({
//     name: 'dashboard'
//   })
// }

// onMounted(() => {
//   changeUser()
// })

</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-row>
          <el-col :span="12">
            <el-page-header :icon="null">
              <template #title>
                <div class="logo">
                  <!-- <img :src="logoUrl" alt="logo" id="logo-img" /> -->
                  国创中心生成式控制综合管控系统
                </div>
              </template>
            </el-page-header>
          </el-col>
          <el-col :span="12">
            <div class="user-info">
              <top-info-bar 
                :user="settings.user" 
                @user-click="settings.changeUser"
              />
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <AsideMenu />
        </el-aside>
        <el-main>
          <RouterView />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style>
.common-layout {
  min-height: 100vh;
}

.el-container {
  height: 100%;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.el-aside {
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 30px;
  color: #2d2d2f;
  font-weight: bold;
}

.user-info {
  height: 70px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 20px;
}

.info-divider {
  border-color: #6b6d71;
}

.el-page-header__header .el-divider {
  border-width: 0px;
}

#logo-img {
  width: 70px;
  height: 70px;
  margin-right: 10px;
}

.el-message-box__message {
  width: 100%;
}

.el-message-box__btns .el-button {
  margin: 0 0 0 10px;
}

.el-message-box__content .el-form-item {
  margin-bottom: 12px;
}

.el-message-box__content .el-form-item:last-child {
  margin-bottom: 0;
}

.el-input-number .el-input__inner {
  text-align: left;
}

.user-change-form .el-message-box__btns {
  padding: 0;
}
</style>
