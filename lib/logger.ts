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

// Pre-initialize server logger if possible
export const initLogger = async () => {
  if (typeof window === 'undefined' && !serverLogger) {
    await initializeServerLogger()
  }
}

// Helper function that works everywhere - synchronous APIs
export const log = {
  info: (message: string, meta?: LogMeta) => {
    if (typeof window === 'undefined') {
      if (serverLogger) {
        serverLogger.info(message, meta)
      } else {
        console.log(`ℹ️ [server-fallback] ${message}`, meta || '')
      }
    } else {
      clientLogger.info(message, meta)
    }
  },
  
  warn: (message: string, meta?: LogMeta) => {
    if (typeof window === 'undefined') {
      if (serverLogger) {
        serverLogger.warn(message, meta)
      } else {
        console.warn(`⚠️ [server-fallback] ${message}`, meta || '')
      }
    } else {
      clientLogger.warn(message, meta)
    }
  },
  
  error: (message: string, meta?: LogMeta) => {
    if (typeof window === 'undefined') {
      if (serverLogger) {
        serverLogger.error(message, meta)
      } else {
        console.error(`❌ [server-fallback] ${message}`, meta || '')
      }
    } else {
      clientLogger.error(message, meta)
    }
  },
  
  debug: (message: string, meta?: LogMeta) => {
    if (typeof window === 'undefined') {
      if (serverLogger) {
        if (process.env.NODE_ENV === 'development') {
          serverLogger.debug(message, meta)
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.debug(`🔍 [server-fallback] ${message}`, meta || '')
        }
      }
    } else {
      clientLogger.debug(message, meta)
    }
  },
}