<template>
  <div class="connection-list">
    <div class="list-header">
      <h3>连接列表</h3>
      <el-button type="primary" @click="handleAdd">新建连接</el-button>
    </div>
    
    <el-table :data="connections" style="width: 100%">
      <el-table-column prop="name" label="名称" min-width="120" />
      <el-table-column prop="host" label="主机地址" min-width="140" />
      <el-table-column prop="port" label="端口" width="100" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.connected ? 'success' : 'info'" size="small">
            {{ scope.row.connected ? '已连接' : '未连接' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <div class="operation-buttons">
            <el-button
              :type="row.connected ? 'danger' : 'primary'"
              size="small"
              @click="handleConnection(row)"
            >
              {{ row.connected ? '断开' : '连接' }}
            </el-button>
            <el-button
              type="primary"
              plain
              size="small"
              @click="handleEdit(row)"
              :disabled="row.connected"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              plain
              size="small"
              @click="handleDelete(row)"
              :disabled="row.connected"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <connection-dialog
      v-model:visible="dialogVisible"
      :is-edit="isEdit"
      :connection="currentConnection"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEdgeBackendStore } from '@/stores/edgeBackend'
import ConnectionDialog from './ConnectionDialog.vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const store = useEdgeBackendStore()
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentConnection = ref(null)

const connections = computed(() => store.connections)

const handleAdd = () => {
  isEdit.value = false
  currentConnection.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentConnection.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该连接吗？', '提示', {
      type: 'warning'
    })
    await store.deleteConnection(row)
  } catch (error) {
    // 用户取消删除
  }
}

const handleConnection = async (connection) => {
  try {
    if (connection.connected) {
      await store.disconnect(connection)
    } else {
      await store.connect(connection)
    }
  } catch (error) {
    ElMessage.error(error.message)
  }
}

const handleSubmit = async (formData) => {
  try {
    if (isEdit.value) {
      // 更新连接
      await store.updateConnection({ ...currentConnection.value, ...formData })
    } else {
      // 创建新连接
      await store.createConnection(formData)
    }
  } catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

<style scoped>
.connection-list {
  padding: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h3 {
  margin: 0;
  color: #333;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}
</style> 