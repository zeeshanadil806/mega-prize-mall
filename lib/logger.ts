// Server-side logger (Winston)
interface Logger {
  info: (message: string, meta?: LogMeta) => void
  warn: (message: string, meta?: LogMeta) => void
  error: (message: string, meta?: LogMeta) => void
  debug: (message: string, meta?: LogMeta) => void
}
let serverLogger: Logger | null = null

// Client-side logger (Console)
const clientLogger = {
  info: (message: string, meta?: LogMeta) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️ ${message}`, meta || '')
    }
  },
  warn: (message: string, meta?: LogMeta) => {
    console.warn(`⚠️ ${message}`, meta || '')
  },
  error: (message: string, meta?: LogMeta) => {
    console.error(`❌ ${message}`, meta || '')
  },
  debug: (message: string, meta?: LogMeta) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`🔍 ${message}`, meta || '')
    }
  },
}

// Type for log metadata
interface LogMeta {
  [key: string]: string | number | boolean | null | undefined | object
  error?: Error
  userId?: string
  duration?: number
}

// Initialize server logger only on server
const initializeServerLogger = async () => {
  if (typeof window !== 'undefined') return clientLogger
  
  try {
    const winston = await import('winston')
    
    serverLogger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'mega-prize-mall' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    })
    
    return serverLogger
  } catch (error) {
    console.error('Failed to initialize Winston:', error)
    return clientLogger
  }
}

// Create logger instance
let loggerInstance: Logger | null = null

export const getLogger = async () => {
  if (!loggerInstance) {
    loggerInstance = await initializeServerLogger()
  }
  return loggerInstance
}

// Helper function that works everywhere
export const log = {
  info: async (message: string, meta?: LogMeta) => {
    const logger = await getLogger()
    logger.info(message, meta)
  },
  
  warn: async (message: string, meta?: LogMeta) => {
    const logger = await getLogger()
    logger.warn(message, meta)
  },
  
  error: async (message: string, meta?: LogMeta) => {
    const logger = await getLogger()
    logger.error(message, meta)
  },
  
  debug: async (message: string, meta?: LogMeta) => {
    const logger = await getLogger()
    if (process.env.NODE_ENV === 'development') {
      logger.debug(message, meta)
    }
  },
}

// Synchronous version for API routes (server-only)
export const serverLog = {
  info: (message: string, meta?: LogMeta) => {
    if (typeof window === 'undefined') {
      console.log(`[SERVER] ${message}`, meta || '')
    }
  },
  warn: (message: string, meta?: LogMeta) => {
    if (typeof window === 'undefined') {
      console.warn(`[SERVER] ${message}`, meta || '')
    }
  },
  error: (message: string, meta?: LogMeta) => {
    if (typeof window === 'undefined') {
      console.error(`[SERVER] ${message}`, meta || '')
    }
  },
}