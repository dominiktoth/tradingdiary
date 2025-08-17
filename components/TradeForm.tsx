"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Plus, X, TrendingUp, TrendingDown, DollarSign, Target, Calendar, FileText, Brain } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import ImageUpload from './ImageUpload'
import { Trade, TradeImage } from '@/types/trade'
import { format } from 'date-fns'

interface TradeFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => void
  editTrade?: Trade | null
}

export default function TradeForm({ isOpen, onClose, onSubmit, editTrade }: TradeFormProps) {
  const [formData, setFormData] = useState({
    entryTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    exitTime: '',
    type: 'long' as 'long' | 'short',
    riskReward: '',
    profitLoss: '',
    profitLossPercent: '',
    pdArray: '',
    thoughts: '',
    images: [] as TradeImage[]
  })

  // Load edit data when editTrade changes
  React.useEffect(() => {
    if (editTrade) {
      setFormData({
        entryTime: format(editTrade.entryTime, "yyyy-MM-dd'T'HH:mm"),
        exitTime: editTrade.exitTime ? format(editTrade.exitTime, "yyyy-MM-dd'T'HH:mm") : '',
        type: editTrade.type,
        riskReward: editTrade.riskReward.toString(),
        profitLoss: editTrade.profitLoss.toString(),
        profitLossPercent: editTrade.profitLossPercent?.toString() || '',
        pdArray: editTrade.pdArray,
        thoughts: editTrade.thoughts,
        images: editTrade.images || []
      })
    } else {
      // Reset form for new trade
      setFormData({
        entryTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        exitTime: '',
        type: 'long',
        riskReward: '',
        profitLoss: '',
        profitLossPercent: '',
        pdArray: '',
        thoughts: '',
        images: []
      })
    }
  }, [editTrade])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onSubmit({
      entryTime: new Date(formData.entryTime),
      exitTime: formData.exitTime ? new Date(formData.exitTime) : undefined,
      type: formData.type,
      riskReward: parseFloat(formData.riskReward) || 0,
      profitLoss: parseFloat(formData.profitLoss) || 0,
      profitLossPercent: formData.profitLossPercent ? parseFloat(formData.profitLossPercent) : undefined,
      pdArray: formData.pdArray,
      thoughts: formData.thoughts,
      images: formData.images
    })

    setFormData({
      entryTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      exitTime: '',
      type: 'long',
      riskReward: '',
      profitLoss: '',
      profitLossPercent: '',
      pdArray: '',
      thoughts: '',
      images: []
    })
    
    onClose()
  }

  const handleImagesUploaded = (files: File[]) => {
    const newImages: TradeImage[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: URL.createObjectURL(file),
      name: file.name,
      uploadDate: new Date()
    }))
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }))
  }

  const removeImage = (id: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }))
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
                onChange={(e) => setFormData(prev => ({ ...prev, entryTime: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, exitTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="flex items-center gap-2">
              {formData.type === 'long' ? 
                <TrendingUp className="h-4 w-4 text-green-500" /> : 
                <TrendingDown className="h-4 w-4 text-red-500" />
              }
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
                onChange={(e) => setFormData(prev => ({ ...prev, riskReward: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, profitLoss: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, profitLossPercent: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdArray" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              PD Array
            </Label>
            <Input
              id="pdArray"
              type="text"
              placeholder="e.g., FVG, Order Block, Liquidity Sweep"
              value={formData.pdArray}
              onChange={(e) => setFormData(prev => ({ ...prev, pdArray: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thoughts" className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Trading Thoughts & Analysis
            </Label>
            <Textarea
              id="thoughts"
              placeholder="Describe your thought process, market analysis, and lessons learned..."
              value={formData.thoughts}
              onChange={(e) => setFormData(prev => ({ ...prev, thoughts: e.target.value }))}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Trade Screenshots
            </Label>
            <ImageUpload onImagesUploaded={handleImagesUploaded} />
            
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {formData.images.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group h-24"
                  >
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
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