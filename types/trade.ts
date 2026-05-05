export type ImageCategory = 'htf' | 'seven_hour' | 'entry'

export const IMAGE_CATEGORIES: ImageCategory[] = ['htf', 'seven_hour', 'entry']

export const IMAGE_CATEGORY_LABELS: Record<ImageCategory, string> = {
  htf: 'HTF',
  seven_hour: '7H Profile',
  entry: 'Entry',
}

export const HTF_C2T_OPTIONS = ['15m', '30m', '1H', '4H', 'Daily'] as const
export const ENTRY_INTERVAL_OPTIONS = ['30s', '1m', '2m', '3m', '5m', '15m'] as const

export interface TradeImage {
  id: string
  url: string
  name: string
  category: ImageCategory
  uploadDate: Date
}

export interface Trade {
  id: string
  entryTime: Date
  exitTime?: Date
  type: 'long' | 'short'
  riskReward: number
  profitLoss: number
  profitLossPercent?: number
  htfC2t: string
  entryInterval: string
  thoughts: string
  images: TradeImage[]
  createdAt: Date
  updatedAt: Date
}
