<template>
  <el-card class="connection-list">
    <template #header>
      <div class="card-header">
        <span>连接列表</span>
      </div>
    </template>

    <el-table :data="connections" style="width: 100%">
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="host" label="主机" />
      <el-table-column prop="port" label="端口" width="100" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.connected ? 'success' : 'info'">
            {{ scope.row.connected ? '已连接' : '未连接' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button
            :type="scope.row.connected ? 'warning' : 'primary'"
            size="small"
            @click="scope.row.connected ? $emit('disconnect', scope.row) : $emit('connect', scope.row)"
          >
            {{ scope.row.connected ? '断开' : '连接' }}
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="$emit('delete', scope.row)"
            :disabled="scope.row.connected"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
defineProps({
  connections: {
    type: Array,
    required: true
  }
})

defineEmits(['connect', 'disconnect', 'delete'])
</script>

<style scoped>
.connection-list {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 