"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, DollarSign, Target, Calendar, Clock, FileText, Brain, ChevronLeft, ChevronRight, Download, ZoomIn } from 'lucide-react'
import { format } from 'date-fns'
import { Trade } from '@/types/trade'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface TradeDetailModalProps {
  trade: Trade | null
  isOpen: boolean
  onClose: () => void
}

export default function TradeDetailModal({ trade, isOpen, onClose }: TradeDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageFullscreen, setIsImageFullscreen] = useState(false)

  // Reset selected image when trade changes
  React.useEffect(() => {
    setSelectedImageIndex(0)
    setIsImageFullscreen(false)
  }, [trade])

  // Keyboard navigation for images - must be before conditional return
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !trade || !trade.images || trade.images.length === 0) return
      
      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => 
          prev > 0 ? prev - 1 : trade.images.length - 1
        )
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => 
          prev < trade.images.length - 1 ? prev + 1 : 0
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, trade])

  if (!trade) return null

  const isProfitable = trade.profitLoss > 0
  const profitLossColor = isProfitable ? 'text-green-500' : 'text-red-500'
  const profitLossBg = isProfitable ? 'bg-green-500/10' : 'bg-red-500/10'

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedImageIndex((prev) => 
      prev > 0 ? prev - 1 : trade.images.length - 1
    )
  }

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedImageIndex((prev) => 
      prev < trade.images.length - 1 ? prev + 1 : 0
    )
  }

  const handleDownloadImage = () => {
    if (trade.images[selectedImageIndex]) {
      const link = document.createElement('a')
      link.href = trade.images[selectedImageIndex].url
      link.download = trade.images[selectedImageIndex].name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 bg-background rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex h-full">
              <div className="flex-1 overflow-y-auto">
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      trade.type === 'long' ? 'bg-green-500/10' : 'bg-red-500/10'
                    )}>
                      {trade.type === 'long' ? 
                        <TrendingUp className="h-5 w-5 text-green-500" /> : 
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      }
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Trade Details</h2>
                      <p className="text-sm text-muted-foreground">
                        {format(trade.entryTime, 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Entry Time
                      </p>
                      <p className="font-medium">
                        {format(trade.entryTime, 'HH:mm:ss')}
                      </p>
                    </div>

                    {trade.exitTime && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Exit Time
                        </p>
                        <p className="font-medium">
                          {format(trade.exitTime, 'HH:mm:ss')}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Risk:Reward
                      </p>
                      <p className="font-medium text-lg">
                        1:{trade.riskReward.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Position</p>
                      <p className={cn(
                        "font-medium text-lg uppercase",
                        trade.type === 'long' ? 'text-green-500' : 'text-red-500'
                      )}>
                        {trade.type}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={cn(
                      "p-4 rounded-lg border",
                      profitLossBg
                    )}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Profit/Loss
                          </p>
                          <p className={cn("text-2xl font-bold", profitLossColor)}>
                            {isProfitable ? '+' : ''}{trade.profitLoss.toFixed(2)}$
                          </p>
                        </div>
                        {trade.profitLossPercent && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Percentage</p>
                            <p className={cn("text-lg font-semibold", profitLossColor)}>
                              {isProfitable ? '+' : ''}{trade.profitLossPercent.toFixed(2)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border bg-muted/50">
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                        <FileText className="h-3 w-3" />
                        PD Array
                      </p>
                      <p className="font-medium">{trade.pdArray}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Trading Thoughts & Analysis
                    </p>
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <p className="whitespace-pre-wrap">{trade.thoughts}</p>
                    </div>
                  </div>

                  {trade.images.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Trade Screenshots ({selectedImageIndex + 1} / {trade.images.length})
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDownloadImage}
                            disabled={!trade.images[selectedImageIndex]}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsImageFullscreen(true)}
                            disabled={!trade.images[selectedImageIndex]}
                          >
                            <ZoomIn className="h-4 w-4 mr-1" />
                            Fullscreen
                          </Button>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                          {trade.images[selectedImageIndex] && (
                            <Image
                              src={trade.images[selectedImageIndex].url}
                              alt={trade.images[selectedImageIndex].name}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          )}
                        </div>

                        {trade.images.length > 1 && (
                          <>
                            <button
                              onClick={handlePrevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleNextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>

                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                              {trade.images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setSelectedImageIndex(index)}
                                  className={cn(
                                    "w-2 h-2 rounded-full transition-colors",
                                    index === selectedImageIndex
                                      ? "bg-white"
                                      : "bg-white/50 hover:bg-white/75"
                                  )}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {trade.images.length > 1 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Click on thumbnails or use arrow keys to navigate
                          </p>
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                            {trade.images.map((image, index) => (
                              <motion.button
                                key={image.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedImageIndex(index)}
                                className={cn(
                                  "relative aspect-video rounded overflow-hidden border-2 transition-all",
                                  index === selectedImageIndex
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-transparent hover:border-muted-foreground/50"
                                )}
                              >
                                <Image
                                  src={image.url}
                                  alt={image.name}
                                  fill
                                  className="object-cover"
                                  sizes="100px"
                                />
                                {index === selectedImageIndex && (
                                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                      {index + 1}
                                    </div>
                                  </div>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {isImageFullscreen && trade.images[selectedImageIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
              onClick={() => setIsImageFullscreen(false)}
            >
              <Image
                src={trade.images[selectedImageIndex].url}
                alt={trade.images[selectedImageIndex].name}
                fill
                className="object-contain"
                sizes="100vw"
              />
              
              {/* Navigation buttons in fullscreen */}
              {trade.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrevImage(e)
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextImage(e)
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                {selectedImageIndex + 1} / {trade.images.length}
              </div>

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsImageFullscreen(false)
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}