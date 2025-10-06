// HR Logger Utility
class HrLogger {
  constructor(module = 'hr') {
    this.module = module
    this.logs = []
    this.maxLogs = 1000
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    }
    this.currentLevel = this.levels.INFO
  }

  setLevel(level) {
    if (typeof level === 'string') {
      this.currentLevel = this.levels[level.toUpperCase()] || this.levels.INFO
    } else {
      this.currentLevel = level
    }
  }

  log(level, message, data = null) {
    const levelValue = typeof level === 'string' ? this.levels[level.toUpperCase()] : level
    
    if (levelValue > this.currentLevel) {
      return
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: typeof level === 'string' ? level.toUpperCase() : 'LOG',
      module: this.module,
      message: message,
      data: data
    }

    this.logs.push(logEntry)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Console output with appropriate method
    const consoleMethod = this.getConsoleMethod(level)
    const prefix = `[${this.module.toUpperCase()}]`
    
    if (data) {
      console[consoleMethod](prefix, message, data)
    } else {
      console[consoleMethod](prefix, message)
    }
  }

  getConsoleMethod(level) {
    const levelValue = typeof level === 'string' ? this.levels[level.toUpperCase()] : level
    
    switch (levelValue) {
      case this.levels.ERROR:
        return 'error'
      case this.levels.WARN:
        return 'warn'
      case this.levels.INFO:
        return 'info'
      case this.levels.DEBUG:
        return 'log'
      default:
        return 'log'
    }
  }

  error(message, data = null) {
    this.log(this.levels.ERROR, message, data)
  }

  warn(message, data = null) {
    this.log(this.levels.WARN, message, data)
  }

  info(message, data = null) {
    this.log(this.levels.INFO, message, data)
  }

  debug(message, data = null) {
    this.log(this.levels.DEBUG, message, data)
  }

  getLogs(level = null) {
    if (level) {
      const levelValue = typeof level === 'string' ? this.levels[level.toUpperCase()] : level
      return this.logs.filter(log => log.level === levelValue)
    }
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }

  exportLogs() {
    return {
      module: this.module,
      exportedAt: new Date().toISOString(),
      logs: this.logs
    }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.HrLogger = HrLogger
}

