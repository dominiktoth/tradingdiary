"use client"

import React, { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, Target, Calendar, Brain, Clock, BarChart3 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import SingleImageUpload from './SingleImageUpload'
import {
  Trade,
  TradeImage,
  ImageCategory,
  IMAGE_CATEGORIES,
  IMAGE_CATEGORY_LABELS,
  HTF_C2T_OPTIONS,
  ENTRY_INTERVAL_OPTIONS,
} from '@/types/trade'
import { format } from 'date-fns'

interface TradeFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => void
  editTrade?: Trade | null
}

type ImageSlots = Record<ImageCategory, TradeImage | null>

const emptySlots = (): ImageSlots => ({ htf: null, seven_hour: null, entry: null })

const slotsFromTrade = (trade: Trade): ImageSlots => {
  const slots = emptySlots()
  for (const img of trade.images) slots[img.category] = img
  return slots
}

export default function TradeForm({ isOpen, onClose, onSubmit, editTrade }: TradeFormProps) {
  const [formData, setFormData] = useState({
    entryTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    exitTime: '',
    type: 'long' as 'long' | 'short',
    riskReward: '',
    profitLoss: '',
    profitLossPercent: '',
    htfC2t: '30m',
    entryInterval: '3m',
    thoughts: '',
  })
  const [images, setImages] = useState<ImageSlots>(emptySlots)
  const [error, setError] = useState('')

  React.useEffect(() => {
    if (editTrade) {
      setFormData({
        entryTime: format(editTrade.entryTime, "yyyy-MM-dd'T'HH:mm"),
        exitTime: editTrade.exitTime ? format(editTrade.exitTime, "yyyy-MM-dd'T'HH:mm") : '',
        type: editTrade.type,
        riskReward: editTrade.riskReward.toString(),
        profitLoss: editTrade.profitLoss.toString(),
        profitLossPercent: editTrade.profitLossPercent?.toString() || '',
        htfC2t: editTrade.htfC2t,
        entryInterval: editTrade.entryInterval,
        thoughts: editTrade.thoughts,
      })
      setImages(slotsFromTrade(editTrade))
    } else {
      setFormData({
        entryTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        exitTime: '',
        type: 'long',
        riskReward: '',
        profitLoss: '',
        profitLossPercent: '',
        htfC2t: '30m',
        entryInterval: '3m',
        thoughts: '',
      })
      setImages(emptySlots())
    }
    setError('')
  }, [editTrade, isOpen])

  const handleFileSelected = (category: ImageCategory) => (file: File) => {
    setImages(prev => ({
      ...prev,
      [category]: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        url: URL.createObjectURL(file),
        name: file.name,
        category,
        uploadDate: new Date(),
      },
    }))
    setError('')
  }

  const handleRemoveImage = (category: ImageCategory) => () => {
    setImages(prev => ({ ...prev, [category]: null }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const missing = IMAGE_CATEGORIES.filter(c => images[c] === null)
    if (missing.length > 0) {
      setError(`Please upload all 3 images: ${missing.map(c => IMAGE_CATEGORY_LABELS[c]).join(', ')} missing.`)
      return
    }

    const imagesArray = IMAGE_CATEGORIES.map(c => images[c]!)

    onSubmit({
      entryTime: new Date(formData.entryTime),
      exitTime: formData.exitTime ? new Date(formData.exitTime) : undefined,
      type: formData.type,
      riskReward: parseFloat(formData.riskReward) || 0,
      profitLoss: parseFloat(formData.profitLoss) || 0,
      profitLossPercent: formData.profitLossPercent ? parseFloat(formData.profitLossPercent) : undefined,
      htfC2t: formData.htfC2t,
      entryInterval: formData.entryInterval,
      thoughts: formData.thoughts,
      images: imagesArray,
    })

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            {editTrade ? 'Edit Trade' : 'Add New Trade'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryTime" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Entry Time
              </Label>
              <Input
                id="entryTime"
                type="datetime-local"
                value={formData.entryTime}
                onChange={e => setFormData(prev => ({ ...prev, entryTime: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitTime" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Exit Time (Optional)
              </Label>
              <Input
                id="exitTime"
                type="datetime-local"
                value={formData.exitTime}
                onChange={e => setFormData(prev => ({ ...prev, exitTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="flex items-center gap-2">
              {formData.type === 'long' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              Position Type
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'long' | 'short') => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Long
                  </span>
                </SelectItem>
                <SelectItem value="short">
                  <span className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    Short
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="htfC2t" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                HTF C2T
              </Label>
              <Select
                value={formData.htfC2t}
                onValueChange={value => setFormData(prev => ({ ...prev, htfC2t: value }))}
              >
                <SelectTrigger id="htfC2t">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HTF_C2T_OPTIONS.map(tf => (
                    <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryInterval" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Entry Interval
              </Label>
              <Select
                value={formData.entryInterval}
                onValueChange={value => setFormData(prev => ({ ...prev, entryInterval: value }))}
              >
                <SelectTrigger id="entryInterval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTRY_INTERVAL_OPTIONS.map(tf => (
                    <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riskReward" className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                R:R Ratio
              </Label>
              <Input
                id="riskReward"
                type="number"
                step="0.01"
                placeholder="e.g., 2.5"
                value={formData.riskReward}
                onChange={e => setFormData(prev => ({ ...prev, riskReward: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profitLoss" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                P&L ($)
              </Label>
              <Input
                id="profitLoss"
                type="number"
                step="0.01"
                placeholder="e.g., 150.50"
                value={formData.profitLoss}
                onChange={e => setFormData(prev => ({ ...prev, profitLoss: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profitLossPercent" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                P&L (%)
              </Label>
              <Input
                id="profitLossPercent"
                type="number"
                step="0.01"
                placeholder="e.g., 2.5"
                value={formData.profitLossPercent}
                onChange={e => setFormData(prev => ({ ...prev, profitLossPercent: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thoughts" className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Trading Thoughts &amp; Analysis
            </Label>
            <Textarea
              id="thoughts"
              placeholder="Describe your thought process, market analysis, and lessons learned..."
              value={formData.thoughts}
              onChange={e => setFormData(prev => ({ ...prev, thoughts: e.target.value }))}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Charts</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {IMAGE_CATEGORIES.map(category => (
                <SingleImageUpload
                  key={category}
                  label={IMAGE_CATEGORY_LABELS[category]}
                  imageUrl={images[category]?.url}
                  imageName={images[category]?.name}
                  onFileSelected={handleFileSelected(category)}
                  onRemove={handleRemoveImage(category)}
                />
              ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editTrade ? 'Update Trade' : 'Add Trade'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
