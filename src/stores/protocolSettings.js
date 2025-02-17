import { defineStore } from 'pinia'

export const useProtocolSettingsStore = defineStore('protocolSettings', {
  state: () => ({
    modbusConfigs: [
      {
        id: 1,
        name: 'Modbus配置1',
        enabled: true,
        mode: 'TCP',
        ip: '192.168.1.100',
        port: 502,
        serialPort: 'COM1',
        baudRate: '9600',
        timeout: 1000
      }
    ],
    uartConfigs: [
      {
        id: 2,
        name: 'UART配置1',
        enabled: false,
        port: 'COM1',
        baudRate: '9600',
        dataBits: '8',
        stopBits: '1',
        parity: 'none',
        flowControl: 'none'
      }
    ],
    tcpConfigs: [
      {
        id: 3,
        name: 'TCP配置1',
        enabled: false,
        ip: '192.168.1.100',
        port: 8080,
        timeout: 1000,
        retries: 3
      }
    ]
  }),

  actions: {
    // 添加新配置
    addConfig(type) {
      const id = Date.now()
      const defaultConfigs = {
        modbus: {
          id,
          name: `Modbus配置${this.modbusConfigs.length + 1}`,
          enabled: true,
          mode: 'TCP',
          ip: '192.168.1.100',
          port: 502,
          serialPort: 'COM1',
          baudRate: '9600',
          timeout: 1000
        },
        uart: {
          id,
          name: `UART配置${this.uartConfigs.length + 1}`,
          enabled: false,
          port: 'COM1',
          baudRate: '9600',
          dataBits: '8',
          stopBits: '1',
          parity: 'none',
          flowControl: 'none'
        },
        tcp: {
          id,
          name: `TCP配置${this.tcpConfigs.length + 1}`,
          enabled: false,
          ip: '192.168.1.100',
          port: 8080,
          timeout: 1000,
          retries: 3
        }
      }

      const configsMap = {
        modbus: 'modbusConfigs',
        uart: 'uartConfigs',
        tcp: 'tcpConfigs'
      }

      this[configsMap[type]].push(defaultConfigs[type])
    },

    // 删除配置
    deleteConfig(type, id) {
      const configsMap = {
        modbus: 'modbusConfigs',
        uart: 'uartConfigs',
        tcp: 'tcpConfigs'
      }

      this[configsMap[type]] = this[configsMap[type]].filter(config => config.id !== id)
    },

    // 保存所有配置
    async saveConfigurations() {
      try {
        // 这里添加与后端的通信逻辑
        // await api.saveProtocolConfigs({
        //   modbus: this.modbusConfigs,
        //   uart: this.uartConfigs,
        //   tcp: this.tcpConfigs
        // })
        return true
      } catch (error) {
        console.error('保存配置失败:', error)
        throw error
      }
    }
  }
}) 