import { defineStore } from 'pinia'

export const useProtocolSettingsStore = defineStore('protocolSettings', {
  state: () => ({
    modbusConfig: {
      enabled: true,
      mode: 'TCP',
      ip: '192.168.1.100',
      port: 502,
      serialPort: 'COM1',
      baudRate: '9600',
      timeout: 1000
    },
    uartConfig: {
      enabled: false,
      port: 'COM1',
      baudRate: '9600',
      dataBits: '8',
      stopBits: '1',
      parity: 'none',
      flowControl: 'none'
    },
    tcpConfig: {
      enabled: false,
      ip: '192.168.1.100',
      port: 8080,
      timeout: 1000,
      retries: 3
    }
  }),

  actions: {
    async saveConfigurations() {
      // 实现保存逻辑
    }
  }
}) 