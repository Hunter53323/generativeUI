import { defineStore } from 'pinia'
import { ref } from 'vue'
import { config } from '@/config/api'

export const useEdgeBackendStore = defineStore('edgeBackend', () => {
  // 初始化默认连接
  const defaultConnection = {
    id: 1,
    name: '默认连接',
    host: '192.168.3.100',  // 默认主机地址
    port: 9654,               // 默认SSH端口
    username: 'admin',
    password: '123456',
    connected: false
  }

  const connections = ref([defaultConnection])
  const currentConnection = ref(null)

  // 创建新连接
  const createConnection = async (connectionData) => {
    const newConnection = {
      id: Date.now(),
      ...connectionData,
      connected: false
    }
    connections.value.push(newConnection)
    return newConnection
  }

  // 连接到服务器
  const connect = async (connection) => {
    try {
      // wssh 会在iframe中处理实际的连接
      connection.connected = true
      currentConnection.value = connection
    } catch (error) {
      console.error('连接失败:', error)
      throw error
    }
  }

  // 断开连接
  const disconnect = async (connection) => {
    connection.connected = false
    if (currentConnection.value?.id === connection.id) {
      currentConnection.value = null
    }
  }

  // 删除连接
  const deleteConnection = async (connection) => {
    const index = connections.value.findIndex(c => c.id === connection.id)
    if (index !== -1) {
      connections.value.splice(index, 1)
      if (currentConnection.value?.id === connection.id) {
        currentConnection.value = null
      }
    }
  }

  return {
    connections,
    currentConnection,
    createConnection,
    connect,
    disconnect,
    deleteConnection
  }
}) 