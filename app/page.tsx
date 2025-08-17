"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Plus, BarChart3, DollarSign, Target, Loader2 } from 'lucide-react'
import { Trade } from '@/types/trade'
import TradeForm from '@/components/TradeForm'
import TradeCard from '@/components/TradeCard'
import TradeDetailModal from '@/components/TradeDetailModal'
import QuotesCarousel from '@/components/QuotesCarousel'
import PasswordModal from '@/components/PasswordModal'
import { Button } from '@/components/ui/button'
import { createTrade, fetchTrades, deleteTrade, updateTrade } from '@/lib/supabase-helpers'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function Home() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [useSupabase, setUseSupabase] = useState(false)
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; action: string; callback: () => void }>({
    isOpen: false,
    action: '',
    callback: () => {}
  })

  useEffect(() => {
    if (isSupabaseConfigured()) {
      setUseSupabase(true)
      loadTradesFromSupabase()
    } else {
      loadTradesFromLocalStorage()
    }
  }, [])

  const loadTradesFromSupabase = async () => {
    setIsLoading(true)
    const supabaseTrades = await fetchTrades()
    setTrades(supabaseTrades)
    setIsLoading(false)
  }

  const loadTradesFromLocalStorage = () => {
    const savedTrades = localStorage.getItem('tradingDiaryTrades')
    if (savedTrades) {
      const parsed = JSON.parse(savedTrades)
      setTrades(parsed.map((trade: Trade) => ({
        ...trade,
        entryTime: new Date(trade.entryTime),
        exitTime: trade.exitTime ? new Date(trade.exitTime) : undefined,
        createdAt: new Date(trade.createdAt),
        updatedAt: new Date(trade.updatedAt),
        images: trade.images.map(img => ({
          ...img,
          uploadDate: new Date(img.uploadDate)
        }))
      })))
    }
    setIsLoading(false)
  }

  const handleAddOrUpdateTrade = async (tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSaving(true)
    
    if (editingTrade) {
      // Update existing trade
      if (useSupabase) {
        const updatedTrade = await updateTrade(editingTrade.id, tradeData)
        if (updatedTrade) {
          setTrades(trades.map(t => t.id === editingTrade.id ? updatedTrade : t))
        }
      } else {
        const updatedTrade: Trade = {
          ...tradeData,
          id: editingTrade.id,
          createdAt: editingTrade.createdAt,
          updatedAt: new Date()
        }
        const updatedTrades = trades.map(t => t.id === editingTrade.id ? updatedTrade : t)
        setTrades(updatedTrades)
        localStorage.setItem('tradingDiaryTrades', JSON.stringify(updatedTrades))
      }
      setEditingTrade(null)
    } else {
      // Add new trade
      if (useSupabase) {
        const newTrade = await createTrade(tradeData)
        if (newTrade) {
          setTrades([newTrade, ...trades])
        }
      } else {
        const newTrade: Trade = {
          ...tradeData,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const updatedTrades = [newTrade, ...trades]
        setTrades(updatedTrades)
        localStorage.setItem('tradingDiaryTrades', JSON.stringify(updatedTrades))
      }
    }
    
    setIsSaving(false)
    setIsFormOpen(false)
  }

  const handleDeleteTrade = async (id: string) => {
    const performDelete = async () => {
      if (useSupabase) {
        const success = await deleteTrade(id)
        if (success) {
          setTrades(trades.filter(trade => trade.id !== id))
        }
      } else {
        const updatedTrades = trades.filter(trade => trade.id !== id)
        setTrades(updatedTrades)
        localStorage.setItem('tradingDiaryTrades', JSON.stringify(updatedTrades))
      }
    }

    setPasswordModal({
      isOpen: true,
      action: 'delete trade',
      callback: performDelete
    })
  }

  const handleViewTrade = (trade: Trade) => {
    setSelectedTrade(trade)
    setIsDetailOpen(true)
  }

  const handleEditTrade = (trade: Trade) => {
    setPasswordModal({
      isOpen: true,
      action: 'edit trade',
      callback: () => {
        setEditingTrade(trade)
        setIsFormOpen(true)
      }
    })
  }

  const totalProfitLoss = trades.reduce((sum, trade) => sum + trade.profitLoss, 0)
  const winRate = trades.length > 0 
    ? (trades.filter(t => t.profitLoss > 0).length / trades.length * 100).toFixed(1)
    : '0'
  const avgRR = trades.length > 0
    ? (trades.reduce((sum, t) => sum + t.riskReward, 0) / trades.length).toFixed(2)
    : '0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="p-3 bg-primary/10 rounded-xl"
              >
                <TrendingUp className="h-8 w-8 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Trading Diary
                </h1>
                <p className="text-muted-foreground">
                  Track and analyze your trading journey
                  {useSupabase && (
                    <span className="ml-2 text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                      Supabase Connected
                    </span>
                  )}
                  {!useSupabase && (
                    <span className="ml-2 text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full">
                      Local Storage
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => {
                setPasswordModal({
                  isOpen: true,
                  action: 'add trade',
                  callback: () => {
                    setEditingTrade(null)
                    setIsFormOpen(true)
                  }
                })
              }}
              size="lg"
              className="shadow-lg"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Trade
                </>
              )}
            </Button>
          </div>

          <QuotesCarousel />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-xl border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                  <p className="text-2xl font-bold">{trades.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-xl border p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${totalProfitLoss >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <DollarSign className={`h-5 w-5 ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total P&L</p>
                  <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toFixed(2)}$
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-xl border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold">{winRate}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-xl border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg R:R</p>
                  <p className="text-2xl font-bold">1:{avgRR}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.header>

        <main>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : trades.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="inline-flex p-4 bg-muted rounded-full"
                >
                  <BarChart3 className="h-12 w-12 text-muted-foreground" />
                </motion.div>
              </div>
              <p className="text-xl text-muted-foreground mb-2">No trades yet</p>
              <p className="text-sm text-muted-foreground/75 mb-6">
                Start documenting your trades to track your progress
              </p>
              <Button onClick={() => {
                setPasswordModal({
                  isOpen: true,
                  action: 'add your first trade',
                  callback: () => {
                    setEditingTrade(null)
                    setIsFormOpen(true)
                  }
                })
              }} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Trade
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trades.map((trade, index) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  onView={handleViewTrade}
                  onEdit={handleEditTrade}
                  onDelete={handleDeleteTrade}
                  index={index}
                />
              ))}
            </div>
          )}
        </main>

        <TradeForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setEditingTrade(null)
          }}
          onSubmit={handleAddOrUpdateTrade}
          editTrade={editingTrade}
        />

        <TradeDetailModal
          trade={selectedTrade}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedTrade(null)
          }}
        />

        <PasswordModal
          isOpen={passwordModal.isOpen}
          onClose={() => setPasswordModal({ ...passwordModal, isOpen: false })}
          onSuccess={passwordModal.callback}
          action={passwordModal.action}
        />

        {!useSupabase && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 p-4 rounded-lg max-w-sm"
          >
            <p className="text-sm font-medium mb-1">Using Local Storage</p>
            <p className="text-xs">
              To save data permanently, set up Supabase. Check SUPABASE_SETUP.md for instructions.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}