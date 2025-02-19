<template>
  <div class="edge-backend">
    <div class="header">
      <h2>边缘设备后台</h2>
      <el-button type="primary" @click="showConnectionDialog = true">
        <el-icon><Plus /></el-icon>新建连接
      </el-button>
    </div>

    <!-- 连接列表 -->
    <ConnectionList 
      :connections="edgeBackend.connections"
      @connect="handleConnect"
      @disconnect="handleDisconnect"
      @delete="handleDelete"
    />

    <!-- 终端窗口 -->
    <Terminal 
      v-if="edgeBackend.currentConnection"
      :connection="edgeBackend.currentConnection"
    />

    <!-- 新建连接对话框 -->
    <ConnectionDialog
      v-model="showConnectionDialog"
      @submit="handleCreateConnection"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import ConnectionList from '@/components/edgebackend/ConnectionList.vue'
import ConnectionDialog from '@/components/edgebackend/ConnectionDialog.vue'
import Terminal from '@/components/edgebackend/Terminal.vue'
import { useEdgeBackendStore } from '@/stores/edgeBackend'

const edgeBackend = useEdgeBackendStore()
const showConnectionDialog = ref(false)

// 处理创建新连接
const handleCreateConnection = async (connectionData) => {
  try {
    await edgeBackend.createConnection(connectionData)
    showConnectionDialog.value = false
    ElMessage.success('连接创建成功')
  } catch (error) {
    ElMessage.error('连接创建失败：' + error.message)
  }
}

// 处理连接
const handleConnect = async (connection) => {
  try {
    await edgeBackend.connect(connection)
    ElMessage.success('连接成功')
  } catch (error) {
    ElMessage.error('连接失败：' + error.message)
  }
}

// 处理断开连接
const handleDisconnect = async (connection) => {
  try {
    await edgeBackend.disconnect(connection)
    ElMessage.success('已断开连接')
  } catch (error) {
    ElMessage.error('断开连接失败：' + error.message)
  }
}

// 处理删除连接
const handleDelete = async (connection) => {
  try {
    await edgeBackend.deleteConnection(connection)
    ElMessage.success('连接已删除')
  } catch (error) {
    ElMessage.error('删除失败：' + error.message)
  }
}
</script>

<style scoped>
.edge-backend {
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
</style>
