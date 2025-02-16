import { defineStore } from 'pinia'

const defaultDevices = [
  {
    id: 1,
    name: '树莓派 1',
    ip: '192.168.1.101',
    status: false,
    loading: false,
    protocol: {
      type: 'Modbus',
      config: {
        type: 'TCP',
        host: '192.168.1.101',
        tcpPort: 502
      }
    },
    models: []
  },
  {
    id: 2,
    name: '树莓派 2',
    ip: '192.168.1.102',
    status: false,
    loading: false,
    protocol: {
      type: 'Modbus',
      config: {
        type: 'RTU',
        port: 'COM1',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      }
    },
    models: []
  },
  {
    id: 3,
    name: '树莓派 3',
    ip: '192.168.1.103',
    status: false,
    loading: false,
    protocol: {
      type: 'MQTT',
      config: {
        host: 'mqtt.example.com',
        port: 1883,
        topic: 'device/data'
      }
    },
    models: []
  },
  {
    id: 4,
    name: '树莓派 4',
    ip: '192.168.1.104',
    status: false,
    loading: false,
    protocol: {
      type: 'HTTPS',
      config: {
        url: 'https://api.example.com'
      }
    },
    models: []
  },
  {
    id: 5,
    name: '树莓派 5',
    ip: '192.168.1.105',
    status: false,
    loading: false,
    protocol: {
      type: 'MQTT',
      config: {
        host: 'iot.example.com',
        port: 8883,
        topic: 'sensors/data'
      }
    },
    models: []
  },
  {
    id: 6,
    name: '树莓派 6',
    ip: '192.168.1.106',
    status: false,
    loading: false,
    protocol: {
      type: 'Modbus',
      config: {
        type: 'TCP',
        host: '192.168.1.106',
        tcpPort: 502
      }
    },
    models: []
  }
]

export const useEdgeDevicesStore = defineStore('edgeDevices', {
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'edge-devices',
        storage: localStorage,
        paths: ['devices', 'connectionStatus']
      }
    ]
  },
  state: () => ({
    devices: defaultDevices,
    connectionStatus: {}
  }),

  actions: {
    addDevice(device) {
      const newId = this.devices.length > 0 
        ? Math.max(...this.devices.map(d => d.id)) + 1 
        : 1
      this.devices.push({
        ...device,
        id: newId,
        status: false,
        loading: false,
        models: []
      })
    },

    removeDevice(id) {
      this.devices = this.devices.filter(device => device.id !== id)
    },

    updateDeviceStatus(id, status) {
      const device = this.devices.find(d => d.id === id)
      if (device) {
        device.status = status
        this.connectionStatus[id] = status
      }
    },

    setDeviceLoading(id, loading) {
      const device = this.devices.find(d => d.id === id)
      if (device) {
        device.loading = loading
      }
    },

    getDeviceStatus(id) {
      return this.connectionStatus[id] || false
    },

    disconnectAllDevices() {
      this.devices.forEach(device => {
        if (device.status) {
          this.updateDeviceStatus(device.id, false)
        }
      })
      this.connectionStatus = {}
    },

    addModel(deviceId, model) {
      const device = this.devices.find(d => d.id === deviceId)
      if (device) {
        const newModel = {
          ...model,
          id: Date.now().toString(),
          active: false
        }
        device.models.push(newModel)
      }
    },

    removeModel(deviceId, modelId) {
      const device = this.devices.find(d => d.id === deviceId)
      if (device) {
        device.models = device.models.filter(m => m.id !== modelId)
      }
    },

    activateModel(deviceId, modelId) {
      const device = this.devices.find(d => d.id === deviceId)
      if (device) {
        device.models.forEach(m => {
          m.active = m.id === modelId
        })
      }
    }
  }
}) 