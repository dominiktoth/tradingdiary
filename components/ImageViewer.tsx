"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, Maximize2 } from 'lucide-react'
import { Dialog, DialogContent } from './ui/dialog'
import { Button } from './ui/button'
import { format } from 'date-fns'

interface ImageData {
  id: string
  url: string
  name: string
  uploadDate: Date
  file: File
}

interface ImageViewerProps {
  image: ImageData | null
  images: ImageData[]
  isOpen: boolean
  onClose: () => void
  onNavigate: (image: ImageData) => void
}

export default function ImageViewer({ image, images, isOpen, onClose, onNavigate }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }, [image])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !image) return

      const currentIndex = images.findIndex(img => img.id === image.id)
      
      switch(e.key) {
        case 'ArrowLeft':
          if (currentIndex > 0) {
            onNavigate(images[currentIndex - 1])
          }
          break
        case 'ArrowRight':
          if (currentIndex < images.length - 1) {
            onNavigate(images[currentIndex + 1])
          }
          break
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case 'r':
          handleRotate()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, image, images, onNavigate, onClose])

  if (!image) return null

  const currentIndex = images.findIndex(img => img.id === image.id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < images.length - 1

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          <div className="relative z-10 w-full h-full flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent"
            >
              <div className="flex items-center gap-4">
                <h3 className="text-white font-semibold text-lg">{image.name}</h3>
                <span className="text-white/70 text-sm">
                  {format(image.uploadDate, 'MMM dd, yyyy HH:mm')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-white min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleRotate}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleReset}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20 ml-4"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            <div 
              className="flex-1 relative overflow-hidden flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              <motion.div
                animate={{
                  scale: zoom,
                  rotate: rotation,
                  x: position.x,
                  y: position.y
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative max-w-[90vw] max-h-[80vh]"
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  width={1920}
                  height={1080}
                  className="object-contain select-none"
                  draggable={false}
                  priority
                />
              </motion.div>

              {hasPrevious && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onNavigate(images[currentIndex - 1])
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </motion.button>
              )}

              {hasNext && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onNavigate(images[currentIndex + 1])
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </motion.button>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-t from-black/50 to-transparent text-center text-white/70 text-sm"
            >
              {currentIndex + 1} / {images.length} • Use arrow keys to navigate • Press ESC to close
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}