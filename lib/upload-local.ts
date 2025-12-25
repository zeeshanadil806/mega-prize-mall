import fs from 'fs/promises'
import path from 'path'
import { log } from './logger'

// Local upload for development
export async function uploadLocal(
  file: Buffer,
  filename: string,
  folder: string = 'products'
): Promise<{ key: string; url: string }> {
  try {
    // Create uploads directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    await fs.mkdir(uploadDir, { recursive: true })
    
    // Clean filename
    const cleanFilename = Date.now() + '_' + filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = path.join(uploadDir, cleanFilename)
    
    // Save file locally
    await fs.writeFile(filePath, file)
    
    // Return local URL for development
    const url = `/uploads/${folder}/${cleanFilename}`
    
    log.info('File uploaded locally', { filename, url, size: file.length })
    
    return {
      key: `${folder}/${cleanFilename}`,
      url,
    }
  } catch (error) {
    if (error instanceof Error) {
      log.error('Local upload error', { error: error, filename })
      throw error
    }
    throw new Error('Upload failed')
  }
}