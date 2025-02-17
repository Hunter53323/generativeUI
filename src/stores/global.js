import { defineStore } from 'pinia'
import { ref, h, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, ElForm, ElFormItem, ElInput, ElLoading } from 'element-plus'
import DBExportBox from '@/components/database/DBExportBox.vue'
import StatementBox from '@/components/database/StatementBox.vue'
import DBEditBox from '@/components/database/DBEditBox.vue'
import DBAddBox from '@/components/database/DBAddBox.vue'
import UserChangeBox from '@/components/UserChangeBox.vue'
import { protocol } from 'socket.io-client'

export const useGlobalStore = defineStore('global', {
  state: () => {
    return {
      url: 'http://127.0.0.1:5000'
    }
  },
  actions: {
    getUnit(key) {
      return ''
      if (key.includes('转速')) {
        return 'rpm'
      } else if (key.includes('电流环')) {
        return ''
      } else if (key.includes('电流')) {
        return 'A'
      } else if (key.includes('电压')) {
        return 'V'
      } else if (key.includes('功率')) {
        return 'W'
      } else if (key.includes('温度')) {
        return '°C'
      } else if (key.includes('湿度')) {
        return '%'
      } else {
        return ''
      }
    }
  }
})

export const useDBStore = defineStore('database', {
  state: () => ({
    columns: [],
    columnsToFill: [],
    colunmsShowSelected: [],
    dbDataObjList: [],
    totalCount: 0,
    pageSize: 10,
    currentPage: 1,
    currentDevice: null, // 当前选中的设备
    deviceDatabases: {}, // 存储各设备的数据库数据
    lastId: 0,
    lastTimestamp: Date.now() - 3600000,
    lastValues: {}, // 存储上一次的数据值，用于生成渐变数据
    loading: false,
  }),
  actions: {
    // 生成渐变随机数
    generateGradientValue(lastValue, targetValue, step = 0.1) {
      if (lastValue === undefined) return targetValue
      const diff = targetValue - lastValue
      return lastValue + diff * step
    },

    // 生成随机数据
    generateRandomData(deviceType) {
      this.lastId++
      this.lastTimestamp += 1000 // 每条数据间隔1秒
      
      if (!this.lastValues[deviceType]) {
        this.lastValues[deviceType] = {}
      }

      const data = {
        ID: this.lastId,
        timestamp: new Date(this.lastTimestamp).toISOString()
      }
      
      switch(deviceType) {
        case 'stepper_motor': {
          // 目标值
          const targetSpeed = Math.floor(Math.random() * 1000 + 2000)
          const targetCurrent = Number((Math.random() * 2 + 1).toFixed(2))
          const targetVoltage = Number((Math.random() * 20 + 20).toFixed(2))
          
          // 生成渐变值
          data.speed = Math.floor(this.generateGradientValue(this.lastValues[deviceType].speed, targetSpeed))
          data.current = Number(this.generateGradientValue(this.lastValues[deviceType].current, targetCurrent).toFixed(2))
          data.voltage = Number(this.generateGradientValue(this.lastValues[deviceType].voltage, targetVoltage).toFixed(2))
          data.power = Number((data.current * data.voltage / 1000).toFixed(2))
          data.position = Number(((data.speed / 3000 * 360) % 360).toFixed(2))
          
          // 更新上一次的值
          this.lastValues[deviceType] = {
            speed: data.speed,
            current: data.current,
            voltage: data.voltage
          }
          break
        }
        case 'async_motor': {
          const targetSpeed = Math.floor(Math.random() * 1000 + 2000)
          const targetCurrent = Number((Math.random() * 5 + 5).toFixed(2))
          const targetVoltage = Number((Math.random() * 100 + 340).toFixed(2))
          
          data.speed = Math.floor(this.generateGradientValue(this.lastValues[deviceType].speed, targetSpeed))
          data.current = Number(this.generateGradientValue(this.lastValues[deviceType].current, targetCurrent).toFixed(2))
          data.voltage = Number(this.generateGradientValue(this.lastValues[deviceType].voltage, targetVoltage).toFixed(2))
          data.power = Number((data.current * data.voltage * 1.732 * 0.85 / 1000).toFixed(2))
          data.frequency = Number((data.speed / 3000 * 50).toFixed(2))
          data.slip = Number((Math.random() * 5).toFixed(2))
          
          this.lastValues[deviceType] = {
            speed: data.speed,
            current: data.current,
            voltage: data.voltage
          }
          break
        }
        case 'pmsm_motor': {
          const speed = Math.floor(Math.random() * 1000 + 2000) // 2000-3000 RPM
          data.speed = speed
          data.current = Number((Math.random() * 5 + 3).toFixed(2)) // 3-8A
          data.voltage = Number((Math.random() * 100 + 300).toFixed(2)) // 300-400V
          data.power = Number((data.current * data.voltage * 1.732 * 0.95 / 1000).toFixed(2)) // kW
          data.torque = Number((Math.random() * 10 + 10).toFixed(2)) // 10-20Nm
          data.efficiency = Number((Math.random() * 5 + 93).toFixed(2)) // 93-98%
          break
        }
        case 'fan': {
          const speed = Math.floor(Math.random() * 1000 + 2000) // 2000-3000 RPM
          data.speed = speed
          data.airflow = Number((speed / 3000 * 5000).toFixed(2)) // 0-5000 m³/h
          data.pressure = Number((Math.pow(speed / 3000, 2) * 1000).toFixed(2)) // 0-1000 Pa
          data.power = Number((Math.pow(speed / 3000, 3) * 10).toFixed(2)) // 0-10 kW
          break
        }
        case 'pump': {
          const speed = Math.floor(Math.random() * 1000 + 2000) // 2000-3000 RPM
          data.speed = speed
          data.flow = Number((speed / 3000 * 100).toFixed(2)) // 0-100 m³/h
          data.head = Number((Math.pow(speed / 3000, 2) * 50).toFixed(2)) // 0-50 m
          data.power = Number((Math.pow(speed / 3000, 3) * 5).toFixed(2)) // 0-5 kW
          break
        }
        case 'compressor': {
          const speed = Math.floor(Math.random() * 1000 + 2000) // 2000-3000 RPM
          data.speed = speed
          data.pressure = Number((speed / 3000 * 10).toFixed(2)) // 0-10 bar
          data.temperature = Number((speed / 3000 * 50 + 20).toFixed(2)) // 20-70 °C
          data.power = Number((Math.pow(speed / 3000, 3) * 15).toFixed(2)) // 0-15 kW
          break
        }
      }
      return data
    },

    // 初始化设备数据库
    initDeviceDatabase(deviceId, deviceType) {
      if (!this.deviceDatabases[deviceId]) {
        // 重置ID和时间戳
        this.lastId = 0
        this.lastTimestamp = Date.now() - 3600000
        
        this.deviceDatabases[deviceId] = {
          data: [],
          columns: this.getDeviceColumns(deviceType),
          columnsToFill: this.getDeviceColumns(deviceType),
          totalCount: 0
        }
        // 生成一些初始数据
        for (let i = 0; i < 3600; i++) { // 生成1小时的数据，每秒一条
          this.deviceDatabases[deviceId].data.push(this.generateRandomData(deviceType))
        }
        this.deviceDatabases[deviceId].totalCount = this.deviceDatabases[deviceId].data.length
      }
    },

    // 获取设备对应的列
    getDeviceColumns(deviceType) {
      const baseColumns = ['ID', 'timestamp']
      const deviceColumns = {
        stepper_motor: ['speed', 'current', 'voltage', 'power', 'position'],
        async_motor: ['speed', 'current', 'voltage', 'power', 'frequency', 'slip'],
        pmsm_motor: ['speed', 'current', 'voltage', 'power', 'torque', 'efficiency'],
        fan: ['speed', 'airflow', 'pressure', 'power'],
        pump: ['speed', 'flow', 'head', 'power'],
        compressor: ['speed', 'pressure', 'temperature', 'power']
      }
      return [...baseColumns, ...(deviceColumns[deviceType] || [])]
    },

    // 切换当前设备
    switchDevice(deviceId) {
      this.currentDevice = deviceId
      if (this.deviceDatabases[deviceId]) {
        this.columns = this.deviceDatabases[deviceId].columns
        this.columnsToFill = this.deviceDatabases[deviceId].columnsToFill
        this.colunmsShowSelected = this.deviceDatabases[deviceId].columns
        this.updateCurrentPageData()
      }
    },

    // 更新当前页数据
    async updateCurrentPageData() {
      if (!this.currentDevice) return
      
      // 添加加载状态
      this.loading = true
      
      try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const start = (this.currentPage - 1) * this.pageSize
        const end = start + this.pageSize
        this.dbDataObjList = this.deviceDatabases[this.currentDevice].data.slice(start, end)
        this.totalCount = this.deviceDatabases[this.currentDevice].totalCount
      } finally {
        this.loading = false
      }
    },

    // 修改原有的数据库操作方法
    async dbDataUpdate() {
      if (!this.currentDevice) return
      await this.updateCurrentPageData()
    },

    // 处理新增数据
    async handleDBAdd() {
      if (!this.currentDevice) {
        ElMessage.warning('请先选择设备')
        return
      }
      
      const deviceType = this.deviceDatabases[this.currentDevice].data[0]?.deviceType
      const newData = this.generateRandomData(deviceType)
      
      this.deviceDatabases[this.currentDevice].data.unshift(newData)
      this.deviceDatabases[this.currentDevice].totalCount++
      this.updateCurrentPageData()
      ElMessage.success('数据添加成功')
    },

    async updateMeta() {
      fetch(useGlobalStore().url + "/db/data/meta", {
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          if ([...this.columns].join() != data.columns.join()) {
            this.columns = data.columns
            this.columnsToFill = data.columns_to_fill
            this.colunmsShowSelected = data.columns
          }
          this.totalCount = data.total_count
        })
        .catch(response => {
          ElMessage.error('无法获取数据库元数据，请检查数据库是否正常运行')
        })
    },
    // 处理删除数据
    async handleDBDelete(ids) {
      if (!this.currentDevice) {
        ElMessage.warning('请先选择设备')
        return
      }
      
      if (ids.length === 0) {
        ElMessage.warning('请选择要删除的数据')
        return
      }

      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${ids.length} 条数据吗？`,
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // 删除选中的数据
        this.deviceDatabases[this.currentDevice].data = this.deviceDatabases[this.currentDevice].data.filter(
          item => !ids.includes(item.ID)
        )
        this.deviceDatabases[this.currentDevice].totalCount = this.deviceDatabases[this.currentDevice].data.length
        
        this.updateCurrentPageData()
        ElMessage.success('数据删除成功')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          ElMessage.error('数据删除失败')
        }
      }
    },
    // 处理清空数据
    async handleDBClear() {
      if (!this.currentDevice) {
        ElMessage.warning('请先选择设备')
        return
      }

      try {
        await ElMessageBox.confirm(
          '此操作将清空当前设备的所有数据，是否继续？',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // 清空数据
        this.deviceDatabases[this.currentDevice].data = []
        this.deviceDatabases[this.currentDevice].totalCount = 0
        
        this.updateCurrentPageData()
        ElMessage.success('数据清空成功')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('清空失败:', error)
          ElMessage.error('数据清空失败')
        }
      }
    },
    // 处理导出数据
    async handleDBExport() {
      if (!this.currentDevice) {
        ElMessage.warning('请先选择设备')
        return
      }

      let form = reactive({
        filename: '',
        ids_input: '',
        conditions: ''
      })

      try {
        // 弹出导出配置对话框
        await ElMessageBox({
          title: '数据导出',
          message: h(DBExportBox, { modelValue: form, 'onUpdate:modelValue': value => form = value }),
          customClass: "db-operation-box",
          showCancelButton: true,
          confirmButtonText: '确认',
          cancelButtonText: '取消',
        })

        // 显示加载提示
        const loading = ElLoading.service({
          lock: true,
          text: '正在导出数据...',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        try {
          // 模拟网络延迟
          await new Promise(resolve => setTimeout(resolve, 800))

          // 准备数据
          let exportData = this.deviceDatabases[this.currentDevice].data

          // 如果指定了ID，则按ID筛选
          if (form.ids_input.trim()) {
            const ids = form.ids_input.split(',').map(id => {
              if (id.includes('-')) {
                const [start, end] = id.split('-').map(Number)
                return Array.from({ length: end - start + 1 }, (_, i) => start + i)
              }
              return Number(id.trim())
            }).flat()
            exportData = exportData.filter(item => ids.includes(item.ID))
          }

          // 如果有筛选条件，则应用筛选
          if (form.conditions.trim()) {
            const conditions = form.conditions.split(',').map(cond => {
              const [key, value] = cond.split('=').map(s => s.trim())
              return { key, value: Number(value) || value }
            })
            exportData = exportData.filter(item => 
              conditions.every(({ key, value }) => item[key] == value)
            )
          }

          // 模拟数据处理延迟
          await new Promise(resolve => setTimeout(resolve, 500))

          const columns = this.deviceDatabases[this.currentDevice].columns
          
          // 创建CSV内容
          const csvContent = [
            columns.join(','),
            ...exportData.map(row => columns.map(col => row[col]).join(','))
          ].join('\n')

          // 创建并下载文件
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.setAttribute('href', url)
          link.setAttribute('download', `${form.filename || `device_data_${this.currentDevice}`}_${new Date().toISOString().split('T')[0]}.csv`)
          document.body.appendChild(link)
          link.click()
          
          // 清理
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          ElMessage.success(`成功导出 ${exportData.length} 条数据`)
        } finally {
          // 关闭加载提示
          loading.close()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('导出失败:', error)
          ElMessage.error('数据导出失败')
        }
      }
    },
    async handleStatementExport() {
      let form = reactive({
        filename: '',
        ids_input: '',
        draw_parameters: [],
        data_column: [],
        input_form: {
          "实验员姓名": "",
          "公司名称": ""
        }
      })
      // this.columns.forEach((item) => {
      //   form.data_column.push([item])
      // })
      ElMessageBox({
        title: '报表导出',
        message: h(StatementBox, { modelValue: form, 'onUpdate:modelValue': value => form = value, columns: this.columnsToFill }),
        customClass: "db-operation-box",
        showCancelButton: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消',
      })
        .then(() => {
          let tmp = []
          form.draw_parameters.forEach((item) => {
            tmp.push(item[0])
          })
          form.draw_parameters = tmp
          tmp = []
          form.data_column.forEach((item) => {
            tmp.push(item[0])
          })

          form.data_column = tmp
          fetch(useGlobalStore().url + "/db/statement", {
            method: 'POST',
            body: JSON.stringify(form),
            headers: {
              'Content-Type': 'application/json'
            }
          })
            .then(response => response.blob())
            .then(blob => {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', form.filename);
              document.body.appendChild(link);
              link.click();
            })
            .catch((e) => {
              ElMessage.error('报表导出失败')
            })
        })
        .catch((e) => {
          ElMessage({
            type: 'info',
            message: '报表导出取消',
          })
        })

    },
    async handleDBEdit(id) {
      let form = reactive({})
      this.columnsToFill.forEach((column) => {
        form[column] = this.dbDataObjList.find((item) => item['ID'] == id)[column]
      })
      ElMessageBox({
        title: '编辑数据',
        message: h(DBEditBox, { modelValue: form, 'onUpdate:modelValue': value => form = value }),
        showCancelButton: true,
        customClass: "db-operation-box",
        confirmButtonText: '确认',
        cancelButtonText: '取消',
      }).then(() => {
        fetch(useGlobalStore().url + "/db/data", {
          method: 'PUT',
          body: JSON.stringify({
            ids: id, update_data: form
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => response.json())
          .then(data => {
            if (data.status == 'error') {
              throw new Error(data.message)
            }
            this.dbDataUpdate()
            ElMessage.success('数据编辑成功')
          })
          .catch(response => {
            ElMessage.error('数据编辑失败')
          })
      })
        .catch(() => {
          ElMessage.info('数据编辑取消')
        })
    }
  }
})

export const useDeviceStatusStore = defineStore('deviceStatus', () => {
  const connectedDevices = ref(12)
  const normalDevices = ref(10)
  const abnormalDevices = ref(2)
  
  // 计算属性
  const deviceStatusData = computed(() => ({
    connected: connectedDevices.value,
    normal: normalDevices.value,
    abnormal: abnormalDevices.value,
    normalRate: ((normalDevices.value / connectedDevices.value) * 100).toFixed(1)
  }))

  // 更新方法
  const updateDeviceStatus = (connected, normal, abnormal) => {
    connectedDevices.value = connected
    normalDevices.value = normal
    abnormalDevices.value = abnormal
  }

  return {
    connectedDevices,
    normalDevices,
    abnormalDevices,
    deviceStatusData,
    updateDeviceStatus
  }
})

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    collectCount: 0,
    remainCount: 0,
    successCount: 0,
    failCount: 0,
    isFanConnected: false,
    isTestConnected: false,
    isFanRunning: false,
    isTestRunning: false,
    isFanBreakDown: false,
    isTestBreakDown: false,
    autoCollectStatus: 1,
    dataObjList: {},
    dataShowSelected: {},
    paraList: [],
    paraShowSelected: [],
    dataList: [],
    graphClass: {
      "转速": [],
      "电流": [],
      "电压": [],
      "功率": [],
    },
  }),
  actions: {
    isReady() {
      console.log(this.isFanConnected, this.isTestConnected, this.isTestRunning)
      return this.isFanConnected && this.isTestConnected && this.isTestRunning
    },
    async initList() {
      fetch(useGlobalStore().url + "/control/data", {
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          this.dataObjList = Object.assign({}, data)
          this.dataShowSelected = Object.assign({}, this.dataObjList)
          this.dataList = [...data['FanDriver'], ...data['TestDevice']].filter((item) => item != "故障")
          this.graphClass = {
            "转速": [],
            "电流": [],
            "电压": [],
            "功率": [],
          }
          const tmpList = [...this.dataList, ...this.paraList]
          tmpList.forEach((item) => {
            if (item.includes('功率')) {
              this.graphClass['功率'].push(item)
            } else if (item.includes('电流环')) {

            } else if (item.includes('电流')) {
              this.graphClass['电流'].push(item)
            } else if (item.includes('电压')) {
              this.graphClass['电压'].push(item)
            } else if (item.includes('转速')) {
              this.graphClass['转速'].push(item)
            }
          })
          // console.log(this.graphClass)
        })
        .catch(error => {
          ElMessage({
            message: '无法获取数据名，请检查服务器是否正常运行！',
            type: 'error'
          })
        })
      fetch(useGlobalStore().url + "/control/parameters", {
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          this.paraList = [...data['FanDriver'], ...data['TestDevice']]
          this.paraShowSelected = this.paraList.slice(0)
        })
        .catch(error => {
          ElMessage({
            message: '无法获取参数名，请检查服务器是否正常运行！',
            type: 'error'
          })
        })
    },
    async updateDeviceState() {
      fetch(useGlobalStore().url + '/control/state', {
        method: 'GET',
      })
        .then((response) => response.json())
        .then((data) => {
          this.isFanConnected = data.FanDriver['连接状态']
          this.isFanRunning = data.FanDriver['运行状态']
          this.isFanBreakDown = data.FanDriver['故障']
          this.isTestConnected = data.TestDevice['连接状态']
          this.isTestRunning = data.TestDevice['运行状态']
          this.isTestBreakDown = data.TestDevice['故障']
        })
        .catch(error => {
          ElMessage({
            message: '无法获取设备状态，请检查服务器是否正常运行！',
            type: 'error'
          })
        })
    },
  }
})
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    user: {
      name: '',
      email: '',
      sender_email: '',
      lastTime: (new Date()).toLocaleString(),
    },
    operationChoice: ['+', '-', '*', '/', '(', ')'],
    testConf: {
      ip: '',
      port: ''
    },
    fanConf: {
      cpu: '',
      port: '',
      baudrate: ''
    },
    definedColumns: {},
    protocol: {},
    protocolChoice: {},
    steadyConf: {}
  }),
  actions: {
    async updateSteady() {
      fetch(useGlobalStore().url + '/collect/steady_state_determination', {
        method: 'GET'
      })
        .then(data => data.json())
        .then(data => {
          this.steadyConf = data.value
        })
        .catch((e) => {
          ElMessage.error("无法获取 稳态判定参数 ，请检查服务器是否正常运行！")
        })
    },
    async updateProtocol() {
      // fetch(useGlobalStore().url + '/control/configsave?driver_name=FanDriver')
      //   .then(data => data.json())
      //   .then(data => {
      //     this.protocolChoice['FanDriver'] = data.value
      //   })
      //   .catch((e) => {
      //     ElMessage.error("无法获取 被测设备 协议配置 ，请检查服务器是否正常运行！")
      //   })
      // fetch(useGlobalStore().url + '/control/configsave?driver_name=TestDevice')
      //   .then(data => data.json())
      //   .then(data => {
      //     this.protocolChoice['TestDevice'] = data.value
      //   })
      //   .catch((e) => {
      //     ElMessage.error("无法获取 测试设备 协议配置 ，请检查服务器是否正常运行！")
      //   })

      fetch(useGlobalStore().url + '/control/configsavev2')
        .then(data => data.json())
        .then(data => {
          this.protocolChoice = data.value
        })
        .catch((e) => {
          ElMessage.error("无法获取配置 ，请检查服务器是否正常运行！")
        })
      fetch(useGlobalStore().url + "/control/deviceset?config_item=config&driver_name=FanDriver", {
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          this.protocol['FanDriver'] = data
        })
        .catch(error => {
          ElMessage({
            message: '无法获取 被测设备 协议配置 ，请检查服务器是否正常运行！',
            type: 'error'
          })
        })
      fetch(useGlobalStore().url + "/control/deviceset?config_item=config&driver_name=TestDevice", {
        method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          this.protocol['TestDevice'] = data
        })
        .catch(error => {
          ElMessage({
            message: '无法获取 测试设备 协议配置 ，请检查服务器是否正常运行！',
            type: 'error'
          })
        })
    },
    async changeUser() {
      let formUser = reactive({
        name: settings.user.name,
        email: settings.user.email,
      })
      ElMessageBox({
        title: '请输入您的信息',
        customClass: "user-change-form",
        message:
          h(UserChangeBox, { modelValue: formUser, 'onUpdate:modelValue': value => formUser = value }),
        confirmButtonText: '确认',
        showConfirmButton: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
        "show-close": false
      })
      router.push({
        name: 'dashboard'
      })
    },
    async updateConf() {
      fetch(useGlobalStore().url + '/control/deviceset?config_item=normal&driver_name=TestDevice')
        .then(data => data.json())
        .then(data => {
          this.testConf.ip = data.ip
          this.testConf.port = data.port
        })
        .catch((e) => {
          ElMessage.error("无法获取测试设备基本参数，请检查服务器是否正常运行！")
        })
      fetch(useGlobalStore().url + '/control/deviceset?config_item=normal&driver_name=FanDriver')
        .then(data => data.json())
        .then(data => {
          this.fanConf.cpu = data.cpu
          this.fanConf.port = data.port
          this.fanConf.baudrate = data.baudrate
        })
        .catch((e) => {
          ElMessage.error("无法获取被测设备基本参数，请检查服务器是否正常运行！")
        })
    },
    async updateDefined() {
      fetch(useGlobalStore().url + '/control/custom_column')
        .then(data => data.json())
        .then(data => {
          this.definedColumns = data
        })
        .catch((e) => {
          ElMessage({
            message: '无法获取用户自定义数据列，请检查服务器是否正常运行！',
            type: 'error'
          })
        })
    },
    async updateUser() {
      fetch(useGlobalStore().url + '/collect/emailset')
        .then(data => data.json())
        .then(data => {
          this.user.sender_email = data.sender_mail
          this.user.email = data.receiver_email
          this.user.name = data.receiver_name
        })
        .catch((e) => {
          ElMessage({
            message: '无法获取用户自定义数据列，请检查服务器是否正常运行！',
            type: 'error'
          })
        })
    },
    async updateUserInfo() {
      try {
        await ElMessageBox({
          title: '修改用户信息',
          message: h(UserChangeBox),
          showConfirmButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: true,
          customClass: 'user-change-form'
        })
      } catch (error) {
        console.error('用户取消修改或发生错误:', error)
      }
    }
  }
})