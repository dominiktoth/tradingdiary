"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Eye, Trash2, Edit, Image as ImageIcon, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { Trade } from '@/types/trade'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'

interface TradeCardProps {
  trade: Trade
  onView: (trade: Trade) => void
  onEdit: (trade: Trade) => void
  onDelete: (id: string) => void
  index: number
}

export default function TradeCard({ trade, onView, onEdit, onDelete, index }: TradeCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const isProfitable = trade.profitLoss > 0
  const profitLossColor = isProfitable ? 'text-green-500' : 'text-red-500'
  const profitLossBg = isProfitable ? 'bg-green-500/10' : 'bg-red-500/10'

  const handleDelete = () => {
    onDelete(trade.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        className="bg-card rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        onClick={() => onView(trade)}
      >
      {trade.images.length > 0 && (
        <div className="relative h-48 bg-muted overflow-hidden">
          <img
            src={trade.images[0].url}
            alt="Trade screenshot"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {trade.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              {trade.images.length}
            </div>
          )}

          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
              trade.type === 'long' 
                ? 'bg-green-500/20 text-green-400 backdrop-blur-sm' 
                : 'bg-red-500/20 text-red-400 backdrop-blur-sm'
            )}>
              {trade.type === 'long' ? 
                <TrendingUp className="h-3 w-3" /> : 
                <TrendingDown className="h-3 w-3" />
              }
              {trade.type.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-3 w-3" />
              {format(trade.entryTime, 'MMM dd, yyyy HH:mm')}
            </div>
            <p className="font-medium text-sm line-clamp-1">{trade.pdArray}</p>
          </div>

          <div className={cn(
            "px-3 py-1.5 rounded-lg font-semibold",
            profitLossBg,
            profitLossColor
          )}>
            {isProfitable ? '+' : ''}{trade.profitLoss.toFixed(2)}$
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">R:R</p>
              <p className="text-sm font-medium">{trade.riskReward.toFixed(2)}</p>
            </div>
          </div>

          {trade.profitLossPercent && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">P&L %</p>
                <p className={cn("text-sm font-medium", profitLossColor)}>
                  {isProfitable ? '+' : ''}{trade.profitLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          )}
        </div>

        {trade.thoughts && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {trade.thoughts}
          </p>
        )}

        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              onView(trade)
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(trade)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="hover:bg-destructive hover:text-destructive-foreground"
            onClick={(e) => {
              e.stopPropagation()
              setShowDeleteDialog(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Trade
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trade? This action cannot be undone.
              {trade.images.length > 0 && (
                <span className="block mt-2 font-medium">
                  This will also delete {trade.images.length} associated image{trade.images.length > 1 ? 's' : ''}.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Trade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}