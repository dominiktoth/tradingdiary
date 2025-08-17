"use client"

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface ImageUploadProps {
  onImagesUploaded: (images: File[]) => void
}

export default function ImageUpload({ onImagesUploaded }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onImagesUploaded(acceptedFiles)
  }, [onImagesUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-xl border-2 border-dashed p-12 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={{ 
            scale: isDragActive ? 1.1 : 1,
            rotate: isDragActive ? 5 : 0 
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                y: isDragActive ? -10 : 0,
                scale: isDragActive ? 1.2 : 1
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Upload className="h-12 w-12 text-muted-foreground" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isDragActive ? 1 : 0,
                scale: isDragActive ? 1 : 0.8
              }}
              transition={{ duration: 0.2 }}
              className="absolute -right-2 -top-2"
            >
              <ImageIcon className="h-6 w-6 text-primary" />
            </motion.div>
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              {isDragActive ? 'Drop your images here' : 'Drag & drop trading screenshots'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse from your computer
            </p>
            <p className="text-xs text-muted-foreground/75">
              Supports: JPG, PNG, GIF, WebP
            </p>
          </div>
        </motion.div>

        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 pointer-events-none"
          />
        )}
      </div>
    </motion.div>
  )
}