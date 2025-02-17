<template>
  <div class="settings-container">
      <div class="header">
        <h2>协议配置</h2>
        <div class="actions">
          <el-button type="primary">
            保存所有配置
          </el-button>
        </div>
      </div>
  
      <el-tabs v-model="activeTab" class="protocol-tabs">
        <!-- Modbus 配置 -->
        <el-tab-pane label="Modbus" name="modbus">
          <el-form :model="protocolStore.modbusConfig" label-width="120px" class="protocol-form">
            <el-card class="protocol-card">
              <template #header>
                <div class="card-header">
                  <span>Modbus 基本配置</span>
                  <el-switch v-model="protocolStore.modbusConfig.enabled" active-text="启用" inactive-text="禁用" />
                </div>
              </template>
              
              <el-form-item label="传输模式">
                <el-radio-group v-model="protocolStore.modbusConfig.mode">
                  <el-radio label="RTU">RTU</el-radio>
                  <el-radio label="TCP">TCP</el-radio>
                </el-radio-group>
              </el-form-item>
  
              <template v-if="protocolStore.modbusConfig.mode === 'TCP'">
                <el-form-item label="IP地址">
                  <el-input v-model="protocolStore.modbusConfig.ip" placeholder="例如: 192.168.1.100" />
                </el-form-item>
                <el-form-item label="端口">
                  <el-input-number v-model="protocolStore.modbusConfig.port" :min="1" :max="65535" />
                </el-form-item>
              </template>
  
              <template v-else>
                <el-form-item label="串口">
                  <el-select v-model="protocolStore.modbusConfig.serialPort">
                    <el-option label="COM1" value="COM1" />
                    <el-option label="COM2" value="COM2" />
                    <el-option label="COM3" value="COM3" />
                  </el-select>
                </el-form-item>
                <el-form-item label="波特率">
                  <el-select v-model="protocolStore.modbusConfig.baudRate">
                    <el-option label="9600" value="9600" />
                    <el-option label="19200" value="19200" />
                    <el-option label="38400" value="38400" />
                    <el-option label="57600" value="57600" />
                    <el-option label="115200" value="115200" />
                  </el-select>
                </el-form-item>
              </template>
  
              <el-form-item label="超时时间(ms)">
                <el-input-number v-model="protocolStore.modbusConfig.timeout" :min="100" :max="10000" :step="100" />
              </el-form-item>
            </el-card>
          </el-form>
        </el-tab-pane>
  
        <!-- UART 配置 -->
        <el-tab-pane label="UART" name="uart">
          <el-form :model="protocolStore.uartConfig" label-width="120px" class="protocol-form">
            <el-card class="protocol-card">
              <template #header>
                <div class="card-header">
                  <span>UART 基本配置</span>
                  <el-switch v-model="protocolStore.uartConfig.enabled" active-text="启用" inactive-text="禁用" />
                </div>
              </template>
  
              <el-form-item label="串口">
                <el-select v-model="protocolStore.uartConfig.port">
                  <el-option label="COM1" value="COM1" />
                  <el-option label="COM2" value="COM2" />
                  <el-option label="COM3" value="COM3" />
                </el-select>
              </el-form-item>
  
              <el-form-item label="波特率">
                <el-select v-model="protocolStore.uartConfig.baudRate">
                  <el-option label="9600" value="9600" />
                  <el-option label="19200" value="19200" />
                  <el-option label="38400" value="38400" />
                  <el-option label="57600" value="57600" />
                  <el-option label="115200" value="115200" />
                </el-select>
              </el-form-item>
  
              <el-form-item label="数据位">
                <el-select v-model="protocolStore.uartConfig.dataBits">
                  <el-option label="7" value="7" />
                  <el-option label="8" value="8" />
                </el-select>
              </el-form-item>
  
              <el-form-item label="停止位">
                <el-select v-model="protocolStore.uartConfig.stopBits">
                  <el-option label="1" value="1" />
                  <el-option label="2" value="2" />
                </el-select>
              </el-form-item>
  
              <el-form-item label="校验方式">
                <el-select v-model="protocolStore.uartConfig.parity">
                  <el-option label="无校验" value="none" />
                  <el-option label="奇校验" value="odd" />
                  <el-option label="偶校验" value="even" />
                </el-select>
              </el-form-item>
  
              <el-form-item label="流控制">
                <el-select v-model="protocolStore.uartConfig.flowControl">
                  <el-option label="无" value="none" />
                  <el-option label="硬件流控" value="hardware" />
                  <el-option label="软件流控" value="software" />
                </el-select>
              </el-form-item>
            </el-card>
          </el-form>
        </el-tab-pane>
  
        <!-- TCP/IP 配置 -->
        <el-tab-pane label="TCP/IP" name="tcp">
          <el-form :model="protocolStore.tcpConfig" label-width="120px" class="protocol-form">
            <el-card class="protocol-card">
              <template #header>
                <div class="card-header">
                  <span>TCP/IP 基本配置</span>
                  <el-switch v-model="protocolStore.tcpConfig.enabled" active-text="启用" inactive-text="禁用" />
                </div>
              </template>
  
              <el-form-item label="IP地址">
                <el-input v-model="protocolStore.tcpConfig.ip" placeholder="例如: 192.168.1.100" />
              </el-form-item>
  
              <el-form-item label="端口">
                <el-input-number v-model="protocolStore.tcpConfig.port" :min="1" :max="65535" />
              </el-form-item>
  
              <el-form-item label="超时时间(ms)">
                <el-input-number v-model="protocolStore.tcpConfig.timeout" :min="100" :max="10000" :step="100" />
              </el-form-item>
  
              <el-form-item label="重试次数">
                <el-input-number v-model="protocolStore.tcpConfig.retries" :min="0" :max="10" />
              </el-form-item>
            </el-card>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useProtocolSettingsStore } from '@/stores/protocolSettings'
  
  const protocolStore = useProtocolSettingsStore()
  const activeTab = ref('modbus')
  </script>
  
  <style scoped>
  /* 添加命名空间避免样式冲突 */
  .settings-container {
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
  
  .protocol-tabs {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
  }
  
  .protocol-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .protocol-form {
    max-width: 600px;
  }
  
  .settings-container :deep(.el-form-item__label) {
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
  
  