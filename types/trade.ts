export interface Trade {
  id: string
  entryTime: Date
  exitTime?: Date
  type: 'long' | 'short'
  riskReward: number
  profitLoss: number
  profitLossPercent?: number
  pdArray: string
  thoughts: string
  images: TradeImage[]
  createdAt: Date
  updatedAt: Date
}

export interface TradeImage {
  id: string
  url: string
  name: string
  uploadDate: Date
}