<template>
  <div class="protocol-config">
    <el-tabs v-model="activeTab" class="protocol-tabs">
      <!-- Modbus 配置列表 -->
      <el-tab-pane label="Modbus" name="modbus">
        <div class="protocol-header">
          <h3>Modbus 配置列表</h3>
          <el-button type="primary" @click="handleAddConfig('modbus')">
            <el-icon><Plus /></el-icon>添加配置
          </el-button>
        </div>
        
        <div v-for="config in protocolStore.modbusConfigs" :key="config.id" class="config-item">
          <el-card class="protocol-card">
            <template #header>
              <div class="card-header">
                <el-input v-model="config.name" placeholder="配置名称" class="config-name-input" />
                <div class="card-actions">
                  <el-switch v-model="config.enabled" active-text="启用" inactive-text="禁用" />
                  <el-button type="danger" link @click="handleDeleteConfig('modbus', config.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            
            <el-form :model="config" label-width="120px" class="protocol-form">
              <el-form-item label="传输模式">
                <el-radio-group v-model="config.mode">
                  <el-radio label="RTU">RTU</el-radio>
                  <el-radio label="TCP">TCP</el-radio>
                </el-radio-group>
              </el-form-item>

              <template v-if="config.mode === 'TCP'">
                <el-form-item label="IP地址">
                  <el-input v-model="config.ip" placeholder="例如: 192.168.1.100" />
                </el-form-item>
                <el-form-item label="端口">
                  <el-input-number v-model="config.port" :min="1" :max="65535" />
                </el-form-item>
              </template>

              <template v-else>
                <el-form-item label="串口">
                  <el-select v-model="config.serialPort">
                    <el-option label="COM1" value="COM1" />
                    <el-option label="COM2" value="COM2" />
                    <el-option label="COM3" value="COM3" />
                  </el-select>
                </el-form-item>
                <el-form-item label="波特率">
                  <el-select v-model="config.baudRate">
                    <el-option label="9600" value="9600" />
                    <el-option label="19200" value="19200" />
                    <el-option label="38400" value="38400" />
                    <el-option label="57600" value="57600" />
                    <el-option label="115200" value="115200" />
                  </el-select>
                </el-form-item>
              </template>

              <el-form-item label="超时时间(ms)">
                <el-input-number v-model="config.timeout" :min="100" :max="10000" :step="100" />
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- UART 配置 -->
      <el-tab-pane label="UART" name="uart">
        <div class="protocol-header">
          <h3>UART 配置列表</h3>
          <el-button type="primary" @click="handleAddConfig('uart')">
            <el-icon><Plus /></el-icon>添加配置
          </el-button>
        </div>
        
        <div v-for="config in protocolStore.uartConfigs" :key="config.id" class="config-item">
          <el-card class="protocol-card">
            <template #header>
              <div class="card-header">
                <el-input v-model="config.name" placeholder="配置名称" class="config-name-input" />
                <div class="card-actions">
                  <el-switch v-model="config.enabled" active-text="启用" inactive-text="禁用" />
                  <el-button type="danger" link @click="handleDeleteConfig('uart', config.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            
            <el-form :model="config" label-width="120px" class="protocol-form">
              <el-form-item label="串口">
                <el-select v-model="config.port">
                  <el-option label="COM1" value="COM1" />
                  <el-option label="COM2" value="COM2" />
                  <el-option label="COM3" value="COM3" />
                </el-select>
              </el-form-item>

              <el-form-item label="波特率">
                <el-select v-model="config.baudRate">
                  <el-option label="9600" value="9600" />
                  <el-option label="19200" value="19200" />
                  <el-option label="38400" value="38400" />
                  <el-option label="57600" value="57600" />
                  <el-option label="115200" value="115200" />
                </el-select>
              </el-form-item>

              <el-form-item label="数据位">
                <el-select v-model="config.dataBits">
                  <el-option label="7" value="7" />
                  <el-option label="8" value="8" />
                </el-select>
              </el-form-item>

              <el-form-item label="停止位">
                <el-select v-model="config.stopBits">
                  <el-option label="1" value="1" />
                  <el-option label="2" value="2" />
                </el-select>
              </el-form-item>

              <el-form-item label="校验方式">
                <el-select v-model="config.parity">
                  <el-option label="无校验" value="none" />
                  <el-option label="奇校验" value="odd" />
                  <el-option label="偶校验" value="even" />
                </el-select>
              </el-form-item>

              <el-form-item label="流控制">
                <el-select v-model="config.flowControl">
                  <el-option label="无" value="none" />
                  <el-option label="硬件流控" value="hardware" />
                  <el-option label="软件流控" value="software" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- TCP/IP 配置 -->
      <el-tab-pane label="TCP/IP" name="tcp">
        <div class="protocol-header">
          <h3>TCP/IP 配置列表</h3>
          <el-button type="primary" @click="handleAddConfig('tcp')">
            <el-icon><Plus /></el-icon>添加配置
          </el-button>
        </div>
        
        <div v-for="config in protocolStore.tcpConfigs" :key="config.id" class="config-item">
          <el-card class="protocol-card">
            <template #header>
              <div class="card-header">
                <el-input v-model="config.name" placeholder="配置名称" class="config-name-input" />
                <div class="card-actions">
                  <el-switch v-model="config.enabled" active-text="启用" inactive-text="禁用" />
                  <el-button type="danger" link @click="handleDeleteConfig('tcp', config.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            
            <el-form :model="config" label-width="120px" class="protocol-form">
              <el-form-item label="IP地址">
                <el-input v-model="config.ip" placeholder="例如: 192.168.1.100" />
              </el-form-item>

              <el-form-item label="端口">
                <el-input-number v-model="config.port" :min="1" :max="65535" />
              </el-form-item>

              <el-form-item label="超时时间(ms)">
                <el-input-number v-model="config.timeout" :min="100" :max="10000" :step="100" />
              </el-form-item>

              <el-form-item label="重试次数">
                <el-input-number v-model="config.retries" :min="0" :max="10" />
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useProtocolSettingsStore } from '@/stores/protocolSettings'
import { ElMessage, ElMessageBox } from 'element-plus'

const protocolStore = useProtocolSettingsStore()
const activeTab = ref('modbus')

// 添加新配置
const handleAddConfig = (type) => {
  protocolStore.addConfig(type)
}

// 删除配置
const handleDeleteConfig = async (type, id) => {
  try {
    await ElMessageBox.confirm('确定要删除此配置吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    protocolStore.deleteConfig(type, id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}
</script>

<style scoped>
.protocol-config {
  width: 100%;
}

.protocol-tabs {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
}

.protocol-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.protocol-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.config-item {
  margin-bottom: 20px;
}

.protocol-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-name-input {
  width: 200px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.protocol-form {
  max-width: 600px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 180px;
}

:deep(.el-select) {
  width: 180px;
}

:deep(.el-tabs__nav) {
  margin-bottom: 20px;
}

:deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #f5f7fa;
}
</style> 