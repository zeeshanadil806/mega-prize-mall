"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { 
  Upload, 
//   Image as ImageIcon, 
  AlertCircle,
  Trash2,
  Eye
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { validateImages } from "@/lib/image-utils"
interface UploadedImage {
  id: string
  url: string
  alt?: string
  order: number
  metadata: {
    width: number
    height: number
    size: number
    format: string
  }
}

interface ImageUploadProps {
  value: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  maxImages?: number
}

export default function ImageUpload({ 
  value = [], 
  onChange, 
  maxImages = 20 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number[]>([])

  const uploadImageViaAPI = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  try {
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || data.details || `Upload failed: ${response.status}`)
    }

    return data.data
    
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Upload failed"
    throw new Error(errorMessage)
  }
}


  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // 1. Validate locally
    const validation = validateImages(acceptedFiles)
    
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error))
      return
    }

    if (value.length + acceptedFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    setUploadProgress(new Array(acceptedFiles.length).fill(0))

    const newImages: UploadedImage[] = []
    
    try {
      // 2. Loop through files and upload via API
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        
        try {

            const result = await uploadImageViaAPI(file)
          // Create FormData to send file to API
        //   const formData = new FormData()
        //   formData.append("file", file)

        //   // Call the API Route
        //   const response = await fetch("/api/admin/upload", {
        //     method: "POST",
        //     body: formData,
        //   })

        //   if (!response.ok) throw new Error("Upload failed")

        //   const result = await response.json()
          
          newImages.push({
            id: result.id,
            url: result.url,
            alt: file.name.split('.')[0],
            order: value.length + i,
            metadata: result.metadata,
          })

          // Update progress
          setUploadProgress(prev => {
            const newProgress = [...prev]
            newProgress[i] = 100
            return newProgress
          })

          toast.success(`Uploaded: ${file.name}`)
        } catch (error) {
          console.error(error)
          toast.error(`Failed to upload ${file.name}`)
        }
      }

      onChange([...value, ...newImages])
      toast.success(`Successfully uploaded ${newImages.length} image(s)`)
    } catch (error) {
      toast.error("Upload process failed")
    } finally {
      setUploading(false)
      setUploadProgress([])
    }
  }, [value, maxImages, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
  })

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index)
    // Reorder remaining images
    const reorderedImages = newImages.map((img, i) => ({
      ...img,
      order: i,
    }))
    onChange(reorderedImages)
    toast.success("Image removed")
  }

  const updateAltText = (index: number, alt: string) => {
    const newImages = [...value]
    newImages[index] = { ...newImages[index], alt }
    onChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return
    
    const newImages = [...value]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    
    // Update order
    const reorderedImages = newImages.map((img, i) => ({
      ...img,
      order: i,
    }))
    
    onChange(reorderedImages)
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Card
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
            transition-all duration-300
            ${isDragActive 
              ? 'border-[#7C2C78] bg-[#7C2C78]/5' 
              : 'border-gray-300 hover:border-[#7C2C78] hover:bg-gray-50'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-[#7C2C78]/10 to-[#A43875]/10">
              {uploading ? (
                <div className="h-12 w-12 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7C2C78] border-t-transparent"></div>
                </div>
              ) : (
                <Upload className="h-12 w-12 text-[#7C2C78]" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isDragActive ? 'Drop images here' : 'Upload product images'}
              </h3>
              <p className="text-gray-600 mt-1">
                Drag & drop or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports JPG, PNG, WebP • Max 10MB per image • Max {maxImages} images
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              className="mt-4 border-gray-300 hover:border-[#7C2C78]"
            >
              Select Images
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Uploading...</span>
            <span className="text-sm text-gray-500">
              {uploadProgress.filter(p => p === 100).length} / {uploadProgress.length}
            </span>
          </div>
          <Progress 
            value={(uploadProgress.filter(p => p === 100).length / uploadProgress.length) * 100} 
            className="h-2"
          />
        </div>
      )}

      {/* Image Gallery */}
      {value.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              Uploaded Images ({value.length}/{maxImages})
            </h4>
            <p className="text-sm text-gray-500">
              First image will be the main thumbnail
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {value.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  {/* Image Card */}
                  <Card className="overflow-hidden border-gray-200 hover:border-[#7C2C78] transition-colors">
                    {/* Image */}
                    <div className="aspect-square relative bg-gray-100">
                      <Image
                        src={image.url}
                        alt={image.alt || `Product image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      />
                      
                      {/* Order Badge */}
                      {index === 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-[#7C2C78] to-[#A43875] text-white rounded-full">
                            Main
                          </span>
                        </div>
                      )}

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="p-3">
                      <input
                        type="text"
                        value={image.alt || ''}
                        onChange={(e) => updateAltText(index, e.target.value)}
                        placeholder="Add alt text..."
                        className="w-full text-sm border-0 bg-transparent focus:outline-none focus:ring-0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {image.metadata.width}×{image.metadata.height} • {Math.round(image.metadata.size / 1024)}KB
                      </p>
                    </div>
                  </Card>

                  {/* Reorder Buttons */}
                  <div className="absolute -top-2 -right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <Button
                        size="icon"
                        className="h-6 w-6 rounded-full bg-white border shadow-sm"
                        onClick={() => moveImage(index, index - 1)}
                      >
                        <span className="text-xs">↑</span>
                      </Button>
                    )}
                    {index < value.length - 1 && (
                      <Button
                        size="icon"
                        className="h-6 w-6 rounded-full bg-white border shadow-sm"
                        onClick={() => moveImage(index, index + 1)}
                      >
                        <span className="text-xs">↓</span>
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">Image Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• First image will be used as the main product thumbnail</li>
              <li>• Use high-quality images with white or neutral background</li>
              <li>• Recommended size: 1200×1200 pixels (square aspect ratio)</li>
              <li>• Add descriptive alt text for better accessibility and SEO</li>
              <li>• Images will be automatically optimized and converted to WebP</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}