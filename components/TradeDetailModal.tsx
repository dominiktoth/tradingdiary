"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, DollarSign, Target, Calendar, Clock, Brain, ChevronLeft, ChevronRight, Download, ZoomIn, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'
import { Trade, IMAGE_CATEGORIES, IMAGE_CATEGORY_LABELS } from '@/types/trade'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface TradeDetailModalProps {
  trade: Trade | null
  isOpen: boolean
  onClose: () => void
}

export default function TradeDetailModal({ trade, isOpen, onClose }: TradeDetailModalProps) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null)

  React.useEffect(() => {
    setFullscreenIndex(null)
  }, [trade])

  // Stable, ordered array of images by category (htf, seven_hour, entry)
  const orderedImages = React.useMemo(() => {
    if (!trade) return []
    return IMAGE_CATEGORIES
      .map(cat => trade.images.find(i => i.category === cat))
      .filter((i): i is NonNullable<typeof i> => !!i)
  }, [trade])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenIndex === null || orderedImages.length === 0) return
      if (e.key === 'ArrowLeft') {
        setFullscreenIndex(prev => (prev === null ? null : (prev > 0 ? prev - 1 : orderedImages.length - 1)))
      } else if (e.key === 'ArrowRight') {
        setFullscreenIndex(prev => (prev === null ? null : (prev < orderedImages.length - 1 ? prev + 1 : 0)))
      } else if (e.key === 'Escape') {
        setFullscreenIndex(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreenIndex, orderedImages.length])

  if (!trade) return null

  const isProfitable = trade.profitLoss > 0
  const profitLossColor = isProfitable ? 'text-green-500' : 'text-red-500'
  const profitLossBg = isProfitable ? 'bg-green-500/10' : 'bg-red-500/10'

  const fullscreenImage = fullscreenIndex !== null ? orderedImages[fullscreenIndex] : null

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setFullscreenIndex(prev => (prev === null ? null : (prev > 0 ? prev - 1 : orderedImages.length - 1)))
  }
  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setFullscreenIndex(prev => (prev === null ? null : (prev < orderedImages.length - 1 ? prev + 1 : 0)))
  }
  const handleDownload = () => {
    if (!fullscreenImage) return
    const link = document.createElement('a')
    link.href = fullscreenImage.url
    link.download = fullscreenImage.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b p-4 flex items-center justify-between z-10">
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
                  <Button size="icon" variant="ghost" onClick={onClose}>
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
                      <p className="font-medium">{format(trade.entryTime, 'HH:mm:ss')}</p>
                    </div>

                    {trade.exitTime && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Exit Time
                        </p>
                        <p className="font-medium">{format(trade.exitTime, 'HH:mm:ss')}</p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Risk:Reward
                      </p>
                      <p className="font-medium text-lg">1:{trade.riskReward.toFixed(2)}</p>
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
                    <div className={cn("p-4 rounded-lg border", profitLossBg)}>
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

                    <div className="p-4 rounded-lg border bg-muted/50 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                          <BarChart3 className="h-3 w-3" />
                          HTF C2T
                        </p>
                        <p className="font-medium text-lg">{trade.htfC2t}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                          <Clock className="h-3 w-3" />
                          Entry Interval
                        </p>
                        <p className="font-medium text-lg">{trade.entryInterval}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Trading Thoughts &amp; Analysis
                    </p>
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <p className="whitespace-pre-wrap">{trade.thoughts}</p>
                    </div>
                  </div>

                  {orderedImages.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Charts</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {IMAGE_CATEGORIES.map((category, catIndex) => {
                          const img = trade.images.find(i => i.category === category)
                          if (!img) return null
                          const idxInOrdered = orderedImages.findIndex(o => o.id === img.id)
                          return (
                            <div key={category} className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {IMAGE_CATEGORY_LABELS[category]}
                              </p>
                              <button
                                type="button"
                                onClick={() => setFullscreenIndex(idxInOrdered >= 0 ? idxInOrdered : catIndex)}
                                className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted group cursor-zoom-in"
                              >
                                <Image
                                  src={img.url}
                                  alt={IMAGE_CATEGORY_LABELS[category]}
                                  fill
                                  className="object-cover transition-transform group-hover:scale-[1.02]"
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {fullscreenImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
              onClick={() => setFullscreenIndex(null)}
            >
              <Image
                src={fullscreenImage.url}
                alt={IMAGE_CATEGORY_LABELS[fullscreenImage.category]}
                fill
                className="object-contain"
                sizes="100vw"
              />

              {orderedImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}

              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm">
                {IMAGE_CATEGORY_LABELS[fullscreenImage.category]}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleDownload() }}
                className="absolute top-4 right-16 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setFullscreenIndex(null) }}
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
