<script lang="ts" setup>
import { reactive, ref, onMounted, h } from 'vue'
import { ElTable, ElButton, ElSelect, ElOption } from 'element-plus'
import DBPagination from '@/components/database/DBPagination.vue'
import { useGlobalStore, useDashboardStore, useSettingsStore, useDBStore } from '@/stores/global'
import { useDeviceManagerStore } from '@/stores/deviceManager'
import { Plus, Download, Delete } from '@element-plus/icons-vue'

const global = useGlobalStore()
const db = useDBStore()
const dashboard = useDashboardStore()
const settings = useSettingsStore()
const deviceManager = useDeviceManagerStore()

const multipleSelection = ref([])
const currentDevice = ref('')

const handleSelectionChange = (val) => {
  multipleSelection.value = []
  val.forEach((element) => {
    multipleSelection.value.push(element.ID)
  })
}

const getWidth = (key) => {
  let baseLength = key.length
  db.dbDataObjList.forEach((element) => {
    baseLength = Math.max((element[key] != null ? element[key] : 0).toString().length, baseLength)
  })
  return baseLength * 16 + 20
}

const handleDeviceChange = (deviceId) => {
  if (!deviceId) return
  const device = deviceManager.devices.find(d => d.deviceUID === deviceId)
  if (device) {
    db.initDeviceDatabase(deviceId, device.deviceResourceInfo.type)
    db.switchDevice(deviceId)
  }
}

onMounted(async () => {
  deviceManager.initDevices()
  // 注释掉原有的API调用
  // dashboard.initList()
  // dashboard.updateDeviceState()
  // settings.updateProtocol()
  // settings.updateConf()
  // settings.updateDefined()
  // settings.updateUser()
  // settings.updateSteady()
  // db.updateMeta()
  db.dbDataUpdate() // 保留这个调用，因为它现在使用的是本地数据
})

// 格式化显示值
const formatValue = (key, value) => {
  if (key === 'timestamp') {
    return new Date(value).toLocaleString()
  }
  if (key === 'ID') {
    return value // ID保持整数
  }
  if (typeof value === 'number') {
    return value.toFixed(2) // 其他数值保留2位小数
  }
  return value
}

// 判断是否需要高亮显示
const isHighlightValue = (key, value) => {
  if (key.includes('speed') && value > 2800) return true
  if (key.includes('current') && value > 8) return true
  if (key.includes('power') && value > 5) return true
  return false
}

// 获取设备类型对应的标签类型
const getDeviceTagType = (type) => {
  const typeMap = {
    'stepper_motor': 'success',
    'async_motor': 'warning',
    'pmsm_motor': 'danger',
    'fan': 'info',
    'pump': 'primary',
    'compressor': ''
  }
  return typeMap[type] || ''
}

// 获取数据单位
const getUnit = (key) => {
  const unitMap = {
    'speed': 'RPM',
    'current': 'A',
    'voltage': 'V',
    'power': 'kW',
    'position': '°',
    'frequency': 'Hz',
    'slip': '%',
    'torque': 'N·m',
    'efficiency': '%',
    'airflow': 'm³/h',
    'pressure': 'Pa',
    'flow': 'm³/h',
    'head': 'm',
    'temperature': '°C'
  }
  return unitMap[key] || ''
}
</script>

<template>
  <div class="database-view">
    <div class="header">
      <div class="left-section">
        <h2 class="title">设备数据库</h2>
        <div class="device-select">
          <el-select 
            v-model="currentDevice" 
            placeholder="请选择设备"
            @change="handleDeviceChange"
            class="device-select-input"
          >
            <el-option
              v-for="device in deviceManager.devices"
              :key="device.deviceUID"
              :label="device.deviceMeta.deviceDesc"
              :value="device.deviceUID"
            >
              <div class="device-option">
                <span class="device-name">{{ device.deviceMeta.deviceDesc }}</span>
                <el-tag size="small" :type="getDeviceTagType(device.deviceResourceInfo.type)">
                  {{ device.deviceResourceInfo.type }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </div>
      </div>

      <div class="operation-buttons">
        <el-button-group class="main-actions">
          <el-button type="primary" @click="db.handleDBAdd">
            <el-icon><Plus /></el-icon>新增数据
          </el-button>
          <el-button type="primary" @click="db.handleDBExport">
            <el-icon><Download /></el-icon>导出CSV
          </el-button>
        </el-button-group>
        <el-button-group class="danger-actions">
          <el-button type="danger" @click="db.handleDBDelete(multipleSelection)">
            <el-icon><Delete /></el-icon>删除所选
          </el-button>
          <el-button type="danger" @click="db.handleDBClear">
            <el-icon><Delete /></el-icon>清空数据
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <el-card class="data-table-card" shadow="hover">
      <el-table 
        :data="db.dbDataObjList" 
        @selection-change="handleSelectionChange" 
        table-layout="auto"
        border
        stripe
        highlight-current-row
      >
        <el-table-column type="selection" width="50" fixed align="center" />
        <el-table-column 
          v-for="key in db.colunmsShowSelected" 
          :key="key"
          :prop="key" 
          :label="key" 
          :width="getWidth(key)"
          align="center"
        >
          <template #default="{ row }">
            <span :class="['data-value', { 'warning': isHighlightValue(key, row[key]) }]">
              {{ formatValue(key, row[key]) }}
              <small v-if="getUnit(key)" class="unit">{{ getUnit(key) }}</small>
            </span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150" align="center">
          <template #default="scope">
            <el-space>
              <el-button type="primary" plain size="small" @click="db.handleDBEdit(scope.row['ID'])">
                编辑
              </el-button>
              <el-button type="danger" plain size="small" @click="db.handleDBDelete([scope.row['ID']])">
                删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <DBPagination />
  </div>
</template>

<style scoped>
.database-view {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.title {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.device-select-input {
  width: 260px;
}

.device-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.device-name {
  font-weight: 500;
}

.operation-buttons {
  display: flex;
  gap: 16px;
}

.data-table-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.data-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.warning {
  color: #e6a23c;
  font-weight: 600;
}

.unit {
  color: #909399;
  font-size: 12px;
}

:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table__header) {
  background-color: #f5f7fa;
}

:deep(.el-table__header-row th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table__row) {
  transition: background-color 0.3s ease;
}

:deep(.el-table__row:hover) {
  background-color: #ecf5ff !important;
}

:deep(.el-button-group) {
  display: inline-flex;
}

:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
