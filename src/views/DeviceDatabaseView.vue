<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDeviceDatabaseStore } from '@/stores/deviceDatabase'
import AddDeviceDialog from '@/components/devicedatabase/AddDeviceDialog.vue'
import { Plus } from '@element-plus/icons-vue'
import DeviceDetailDrawer from '@/components/devicedatabase/DeviceDetailDrawer.vue'

const deviceDB = useDeviceDatabaseStore()
const showDialog = ref(false)
const showDetail = ref(false)
const currentDeviceId = ref('')

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
    await deviceDB.fetchDevices()
  } catch (error) {
    ElMessage.error('加载设备数据失败')
  }
}

const handleCreateDevice = async (deviceInfo) => {
  try {
    await deviceDB.createDeviceResource(deviceInfo)
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
    await deviceDB.deleteDeviceResource(deviceUID)
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

const showAddDeviceDialog = () => {
  showDialog.value = true
}

const handleAddSuccess = () => {
  loadData()
}

const handleEdit = (device) => {
  // TODO: 实现编辑功能
  console.log('编辑设备:', device)
}

const handleDelete = async (device) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除设备 ${device.deviceMeta.deviceUID} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deviceDB.deleteDeviceResource(device.deviceMeta.deviceUID)
    ElMessage.success('设备删除成功')
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除设备失败')
    }
  }
}

// 处理行点击
const handleRowClick = () => {}

// 添加显示详情方法
const handleShowDetail = async (row) => {
  currentDeviceId.value = row.deviceMeta.deviceUID
  try {
    await deviceDB.fetchDeviceDetail(row.deviceMeta.deviceUID)
    showDetail.value = true
  } catch (error) {
    console.error('获取设备详情失败:', error)
  }
}
</script>

<template>
  <div class="device-database">
    <div class="header">
      <h2>设备数据库</h2>
      <el-button type="primary" @click="showAddDeviceDialog">
        <el-icon><Plus /></el-icon>添加设备
      </el-button>
    </div>
    
    <el-table 
      v-loading="deviceDB.loading"
      :data="deviceDB.devices" 
      border 
      style="width: 100%"
    >
      <!-- 基本信息 -->
      <el-table-column label="基本信息" min-width="300">
        <template #default="{ row }">
          <div class="device-info">
            <div class="device-name">
              <span class="label">设备ID:</span>
              <span class="value">{{ row.deviceMeta.deviceUID }}</span>
            </div>
            <div class="device-desc">
              <span class="label">描述:</span>
              <span class="value">{{ row.deviceMeta.deviceDesc || '暂无描述' }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 设备类型 -->
      <el-table-column label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="deviceDB.getDeviceTagType(row.deviceResourceInfo.type)">
            {{ row.deviceResourceInfo.type }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 状态信息 -->
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="deviceDB.getStatusTagType(row.deviceWorkStatus.healthStatus)">
            {{ row.deviceWorkStatus.healthStatus }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 网络信息 -->
      <el-table-column label="网络信息" min-width="200">
        <template #default="{ row }">
          <div class="network-info">
            <div>
              <span class="label">IP:</span>
              <span class="value">{{ row.deviceResourceInfo.ip }}</span>
            </div>
            <div>
              <span class="label">主机名:</span>
              <span class="value">{{ row.deviceResourceInfo.hostname }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 协议信息 -->
      <el-table-column label="协议" width="150">
        <template #default="{ row }">
          <div class="protocol-tags">
            <el-tag 
              v-for="protocol in row.deviceResourceInfo.protocol" 
              :key="protocol"
              size="small"
              :type="protocol ? '' : 'info'"
            >
              {{ protocol || 'unknown' }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button 
              size="small" 
              type="primary"
              @click.stop="handleShowDetail(row)"
            >
              详情
            </el-button>
            <el-button 
              size="small" 
              @click.stop="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              size="small"
              type="danger"
              @click.stop="handleDelete(row)"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    
    <AddDeviceDialog
      v-model="showDialog"
      @success="handleAddSuccess"
    />

    <!-- 添加设备详情抽屉 -->
    <DeviceDetailDrawer
      v-model="showDetail"
      :device-id="currentDeviceId"
    />
  </div>
</template>

<style scoped>
.device-database {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.device-info,
.network-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  color: #909399;
  margin-right: 8px;
}

.value {
  color: #303133;
}

.protocol-tags {
  display: flex;
  gap: 4px;
}

:deep(.el-table__header) {
  background-color: #f5f7fa;
}

:deep(.el-table__row:hover) {
  background-color: #ecf5ff !important;
}

:deep(.el-button-group) {
  display: flex;
  gap: 4px;
}

:deep(.el-button-group .el-button) {
  margin-left: 0 !important;
}
</style> 