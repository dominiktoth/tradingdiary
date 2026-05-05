import { supabase } from './supabase'
import { Trade, TradeImage, ImageCategory } from '@/types/trade'

async function uploadImage(file: File, tradeId: string, category: ImageCategory): Promise<string | null> {
  if (!supabase) return null
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${tradeId}/${category}-${Date.now()}.${fileExt}`

    const { error } = await supabase.storage.from('trade-images').upload(fileName, file)
    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage.from('trade-images').getPublicUrl(fileName)
    return publicUrl
  } catch (error) {
    console.error('Error in uploadImage:', error)
    return null
  }
}

async function deleteStorageObjectFromUrl(url: string): Promise<void> {
  if (!supabase) return
  const parts = url.split('/storage/v1/object/public/trade-images/')
  if (parts.length > 1) {
    await supabase.storage.from('trade-images').remove([parts[1]])
  }
}

function mapTradeRow(row: Record<string, unknown>, images: TradeImage[]): Trade {
  return {
    id: row.id as string,
    entryTime: new Date(row.entry_time as string),
    exitTime: row.exit_time ? new Date(row.exit_time as string) : undefined,
    type: row.type as 'long' | 'short',
    riskReward: Number(row.risk_reward),
    profitLoss: Number(row.profit_loss),
    profitLossPercent: row.profit_loss_percent != null ? Number(row.profit_loss_percent) : undefined,
    htfC2t: row.htf_c2t as string,
    entryInterval: row.entry_interval as string,
    thoughts: row.thoughts as string,
    images,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  }
}

function mapImageRow(row: Record<string, unknown>): TradeImage {
  return {
    id: row.id as string,
    url: row.url as string,
    name: row.name as string,
    category: row.category as ImageCategory,
    uploadDate: new Date(row.upload_date as string),
  }
}

export async function createTrade(tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trade | null> {
  if (!supabase) return null

  try {
    const { images, ...trade } = tradeData

    const { data: newTrade, error: tradeError } = await supabase
      .from('trades')
      .insert({
        entry_time: trade.entryTime,
        exit_time: trade.exitTime || null,
        type: trade.type,
        risk_reward: trade.riskReward,
        profit_loss: trade.profitLoss,
        profit_loss_percent: trade.profitLossPercent || null,
        htf_c2t: trade.htfC2t,
        entry_interval: trade.entryInterval,
        thoughts: trade.thoughts,
      })
      .select()
      .single()

    if (tradeError || !newTrade) {
      console.error('Error creating trade:', tradeError)
      return null
    }

    const uploadedImages: TradeImage[] = []

    for (const image of images) {
      if (!image.url.startsWith('blob:')) continue

      const response = await fetch(image.url)
      const blob = await response.blob()
      const file = new File([blob], image.name, { type: blob.type })

      const publicUrl = await uploadImage(file, newTrade.id, image.category)
      if (!publicUrl) continue

      const { data: imageData, error: imageError } = await supabase
        .from('trade_images')
        .insert({
          trade_id: newTrade.id,
          url: publicUrl,
          name: image.name,
          category: image.category,
        })
        .select()
        .single()

      if (!imageError && imageData) {
        uploadedImages.push(mapImageRow(imageData as Record<string, unknown>))
      }
    }

    return mapTradeRow(newTrade as Record<string, unknown>, uploadedImages)
  } catch (error) {
    console.error('Error in createTrade:', error)
    return null
  }
}

export async function fetchTrades(): Promise<Trade[]> {
  if (!supabase) return []

  try {
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false })

    if (tradesError) {
      console.error('Error fetching trades:', tradesError)
      return []
    }

    const result = await Promise.all(
      trades.map(async trade => {
        const { data: images, error: imagesError } = await supabase!
          .from('trade_images')
          .select('*')
          .eq('trade_id', trade.id)
          .order('created_at', { ascending: true })

        if (imagesError) {
          console.error('Error fetching images:', imagesError)
          return null
        }

        return mapTradeRow(
          trade as Record<string, unknown>,
          (images || []).map(i => mapImageRow(i as Record<string, unknown>))
        )
      })
    )

    return result.filter((t): t is Trade => t !== null)
  } catch (error) {
    console.error('Error in fetchTrades:', error)
    return []
  }
}

export async function updateTrade(
  tradeId: string,
  tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Trade | null> {
  if (!supabase) return null

  try {
    const { images, ...trade } = tradeData

    const { data: updatedTrade, error: tradeError } = await supabase
      .from('trades')
      .update({
        entry_time: trade.entryTime,
        exit_time: trade.exitTime || null,
        type: trade.type,
        risk_reward: trade.riskReward,
        profit_loss: trade.profitLoss,
        profit_loss_percent: trade.profitLossPercent || null,
        htf_c2t: trade.htfC2t,
        entry_interval: trade.entryInterval,
        thoughts: trade.thoughts,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tradeId)
      .select()
      .single()

    if (tradeError || !updatedTrade) {
      console.error('Error updating trade:', tradeError)
      return null
    }

    const { data: existingImages } = await supabase
      .from('trade_images')
      .select('*')
      .eq('trade_id', tradeId)

    const existingByCategory = new Map<ImageCategory, Record<string, unknown>>()
    for (const row of existingImages || []) {
      existingByCategory.set((row as Record<string, unknown>).category as ImageCategory, row as Record<string, unknown>)
    }

    const finalImages: TradeImage[] = []

    for (const image of images) {
      const existing = existingByCategory.get(image.category)
      const isNewBlob = image.url.startsWith('blob:')

      if (!isNewBlob && existing && existing.url === image.url) {
        finalImages.push(mapImageRow(existing))
        continue
      }

      // Replacing or adding image for this category — delete old storage object + row first
      if (existing) {
        await deleteStorageObjectFromUrl(existing.url as string)
        await supabase.from('trade_images').delete().eq('id', existing.id as string)
      }

      if (!isNewBlob) {
        // Shouldn't normally happen — non-blob URL but no matching existing row
        continue
      }

      const response = await fetch(image.url)
      const blob = await response.blob()
      const file = new File([blob], image.name, { type: blob.type })

      const publicUrl = await uploadImage(file, tradeId, image.category)
      if (!publicUrl) continue

      const { data: imageData, error: imageError } = await supabase
        .from('trade_images')
        .insert({
          trade_id: tradeId,
          url: publicUrl,
          name: image.name,
          category: image.category,
        })
        .select()
        .single()

      if (!imageError && imageData) {
        finalImages.push(mapImageRow(imageData as Record<string, unknown>))
      }
    }

    // Remove any leftover existing images whose category is not in the new set
    const newCategories = new Set(images.map(i => i.category))
    for (const [cat, row] of existingByCategory) {
      if (!newCategories.has(cat)) {
        await deleteStorageObjectFromUrl(row.url as string)
        await supabase.from('trade_images').delete().eq('id', row.id as string)
      }
    }

    return mapTradeRow(updatedTrade as Record<string, unknown>, finalImages)
  } catch (error) {
    console.error('Error in updateTrade:', error)
    return null
  }
}

export async function deleteTrade(tradeId: string): Promise<boolean> {
  if (!supabase) return false

  try {
    const { data: images } = await supabase
      .from('trade_images')
      .select('url')
      .eq('trade_id', tradeId)

    if (images && images.length > 0) {
      const filePaths = images
        .map(image => {
          const parts = (image.url as string).split('/storage/v1/object/public/trade-images/')
          return parts.length > 1 ? parts[1] : null
        })
        .filter((p): p is string => !!p)

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage.from('trade-images').remove(filePaths)
        if (storageError) console.error('Error deleting images from storage:', storageError)
      }
    }

    const { error } = await supabase.from('trades').delete().eq('id', tradeId)
    if (error) {
      console.error('Error deleting trade:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteTrade:', error)
    return false
  }
}
