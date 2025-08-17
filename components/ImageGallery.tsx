"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Trash2, ZoomIn, Download } from 'lucide-react'
import { format } from 'date-fns'
import Image from 'next/image'
import { Button } from './ui/button'

interface ImageData {
  id: string
  url: string
  name: string
  uploadDate: Date
  file: File
}

interface ImageGalleryProps {
  images: ImageData[]
  onImageClick: (image: ImageData) => void
  onDeleteImage: (id: string) => void
}

export default function ImageGallery({ images, onImageClick, onDeleteImage }: ImageGalleryProps) {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 }
  }

  const handleDownload = (image: ImageData, e: React.MouseEvent) => {
    e.stopPropagation()
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <p className="text-muted-foreground text-lg">No images uploaded yet</p>
        <p className="text-muted-foreground/75 text-sm mt-2">
          Start by uploading your trading screenshots
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <AnimatePresence>
        {images.map((image) => (
          <motion.div
            key={image.id}
            variants={item}
            layout
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ y: -8 }}
            onHoverStart={() => setHoveredImage(image.id)}
            onHoverEnd={() => setHoveredImage(null)}
            className="relative group cursor-pointer"
            onClick={() => onImageClick(image)}
          >
            <div className="relative overflow-hidden rounded-lg bg-card shadow-lg transition-all duration-300 hover:shadow-2xl">
              <div className="aspect-video relative">
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredImage === image.id ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: hoveredImage === image.id ? 1 : 0,
                    y: hoveredImage === image.id ? 0 : 20
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        onImageClick(image)
                      }}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full shadow-lg"
                      onClick={(e) => handleDownload(image, e)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="rounded-full shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteImage(image.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              </div>

              <div className="p-4 space-y-2">
                <p className="font-medium text-sm truncate">{image.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(image.uploadDate, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}