<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDeviceDatabaseStore } from '@/stores/deviceDatabase'
import AddDeviceDialog from '@/components/devicedatabase/AddDeviceDialog.vue'

const store = useDeviceDatabaseStore()
const addDialogVisible = ref(false)

const tableColumns = [
  { prop: 'deviceUID', label: '设备ID', width: '180' },
  { prop: 'deviceResourceInfo.type', label: '设备类型', width: '120' },
  { prop: 'deviceResourceInfo.IP', label: 'IP地址', width: '140' },
  { prop: 'deviceWorkStatus.healthStatus', label: '健康状态', width: '120' },
  { prop: 'deviceWorkStatus.workMode', label: '工作模式', width: '120' },
  { prop: 'deviceWorkStatus.timestamp', label: '更新时间', width: '180' }
]

const loadData = async () => {
  try {
    await store.listDevices()
  } catch (error) {
    ElMessage.error('加载设备数据失败')
  }
}

const handleCreateDevice = async (deviceInfo) => {
  try {
    await store.createDeviceResource(deviceInfo)
    ElMessage.success('设备添加成功')
    loadData()
  } catch (error) {
    ElMessage.error('设备添加失败')
  }
}

const handleDeleteDevice = async (deviceUID) => {
  try {
    await ElMessageBox.confirm('确定要删除该设备吗？', '警告', {
      type: 'warning'
    })
    await store.deleteDeviceResource(deviceUID)
    ElMessage.success('设备删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('设备删除失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="device-database">
    <div class="header">
      <h2>设备数据库</h2>
      <el-button type="primary" @click="addDialogVisible = true">添加设备</el-button>
    </div>
    
    <el-table 
      v-loading="store.loading"
      :data="store.devices" 
      border 
      style="width: 100%"
    >
      <el-table-column 
        v-for="col in tableColumns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
      />
      
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="danger" 
            size="small"
            @click="handleDeleteDevice(row.deviceUID)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <add-device-dialog
      v-model:visible="addDialogVisible"
      @created="handleCreateDevice"
    />
  </div>
</template>

<style scoped>
.device-database {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}
</style> 