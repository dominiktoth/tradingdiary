"use client"

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Upload, X } from 'lucide-react'

interface SingleImageUploadProps {
  label: string
  imageUrl?: string
  imageName?: string
  onFileSelected: (file: File) => void
  onRemove: () => void
}

export default function SingleImageUpload({
  label,
  imageUrl,
  imageName,
  onFileSelected,
  onRemove,
}: SingleImageUploadProps) {
  const onDrop = useCallback(
    (files: File[]) => {
      if (files[0]) onFileSelected(files[0])
    },
    [onFileSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: false,
  })

  if (imageUrl) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">{label}</p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-video rounded-lg overflow-hidden border bg-muted group"
        >
          <Image
            src={imageUrl}
            alt={imageName || label}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Remove ${label} image`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        {label} <span className="text-destructive">*</span>
      </p>
      <div
        {...getRootProps()}
        className={`
          relative aspect-video rounded-lg border-2 border-dashed cursor-pointer
          flex flex-col items-center justify-center text-center p-4
          transition-all duration-200
          ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground">
          {isDragActive ? 'Drop image here' : 'Click or drop image'}
        </p>
      </div>
    </div>
  )
}
