import { supabase } from './supabase'
import { Trade, TradeImage } from '@/types/trade'

export async function uploadImage(file: File, tradeId: string): Promise<string | null> {
  if (!supabase) return null
  
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${tradeId}/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('trade-images')
      .upload(fileName, file)

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('trade-images')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Error in uploadImage:', error)
    return null
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
        pd_array: trade.pdArray,
        thoughts: trade.thoughts
      })
      .select()
      .single()

    if (tradeError) {
      console.error('Error creating trade:', tradeError)
      return null
    }

    const uploadedImages: TradeImage[] = []
    
    for (const image of images) {
      if (image.url.startsWith('blob:')) {
        const response = await fetch(image.url)
        const blob = await response.blob()
        const file = new File([blob], image.name, { type: blob.type })
        
        const publicUrl = await uploadImage(file, newTrade.id)
        
        if (publicUrl) {
          const { data: imageData, error: imageError } = await supabase
            .from('trade_images')
            .insert({
              trade_id: newTrade.id,
              url: publicUrl,
              name: image.name
            })
            .select()
            .single()

          if (!imageError && imageData) {
            uploadedImages.push({
              id: imageData.id,
              url: imageData.url,
              name: imageData.name,
              uploadDate: new Date(imageData.upload_date)
            })
          }
        }
      }
    }

    return {
      id: newTrade.id,
      entryTime: new Date(newTrade.entry_time),
      exitTime: newTrade.exit_time ? new Date(newTrade.exit_time) : undefined,
      type: newTrade.type,
      riskReward: newTrade.risk_reward,
      profitLoss: newTrade.profit_loss,
      profitLossPercent: newTrade.profit_loss_percent || undefined,
      pdArray: newTrade.pd_array,
      thoughts: newTrade.thoughts,
      images: uploadedImages,
      createdAt: new Date(newTrade.created_at),
      updatedAt: new Date(newTrade.updated_at)
    }
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
      console.error('Full error details:', {
        message: tradesError.message,
        details: tradesError.details,
        hint: tradesError.hint,
        code: tradesError.code
      })
      return []
    }

    const tradesWithImages = await Promise.all(
      trades.map(async (trade) => {
        const { data: images, error: imagesError } = await supabase!
          .from('trade_images')
          .select('*')
          .eq('trade_id', trade.id)
          .order('created_at', { ascending: true })

        if (imagesError) {
          console.error('Error fetching images:', imagesError)
          return null
        }

        return {
          id: trade.id,
          entryTime: new Date(trade.entry_time),
          exitTime: trade.exit_time ? new Date(trade.exit_time) : undefined,
          type: trade.type,
          riskReward: trade.risk_reward,
          profitLoss: trade.profit_loss,
          profitLossPercent: trade.profit_loss_percent || undefined,
          pdArray: trade.pd_array,
          thoughts: trade.thoughts,
          images: images.map(img => ({
            id: img.id,
            url: img.url,
            name: img.name,
            uploadDate: new Date(img.upload_date)
          })),
          createdAt: new Date(trade.created_at),
          updatedAt: new Date(trade.updated_at)
        }
      })
    )

    return tradesWithImages.filter(trade => trade !== null) as Trade[]
  } catch (error) {
    console.error('Error in fetchTrades:', error)
    return []
  }
}

export async function updateTrade(tradeId: string, tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trade | null> {
  if (!supabase) return null
  
  try {
    const { images, ...trade } = tradeData

    // Update trade data
    const { data: updatedTrade, error: tradeError } = await supabase
      .from('trades')
      .update({
        entry_time: trade.entryTime,
        exit_time: trade.exitTime || null,
        type: trade.type,
        risk_reward: trade.riskReward,
        profit_loss: trade.profitLoss,
        profit_loss_percent: trade.profitLossPercent || null,
        pd_array: trade.pdArray,
        thoughts: trade.thoughts,
        updated_at: new Date().toISOString()
      })
      .eq('id', tradeId)
      .select()
      .single()

    if (tradeError) {
      console.error('Error updating trade:', tradeError)
      return null
    }

    // Get existing images
    const { data: existingImages } = await supabase
      .from('trade_images')
      .select('*')
      .eq('trade_id', tradeId)

    // Find new images (ones with blob URLs)
    const newImages = images.filter(img => img.url.startsWith('blob:'))
    const keptImages = images.filter(img => !img.url.startsWith('blob:'))

    // Delete removed images from storage
    const existingImageIds = keptImages.map(img => img.id)
    const imagesToDelete = existingImages?.filter(img => !existingImageIds.includes(img.id)) || []
    
    for (const imgToDelete of imagesToDelete) {
      const urlParts = imgToDelete.url.split('/storage/v1/object/public/trade-images/')
      if (urlParts.length > 1) {
        await supabase.storage
          .from('trade-images')
          .remove([urlParts[1]])
      }
      
      await supabase
        .from('trade_images')
        .delete()
        .eq('id', imgToDelete.id)
    }

    // Upload new images
    const uploadedImages: TradeImage[] = [...keptImages]
    
    for (const image of newImages) {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const file = new File([blob], image.name, { type: blob.type })
      
      const publicUrl = await uploadImage(file, tradeId)
      
      if (publicUrl) {
        const { data: imageData, error: imageError } = await supabase
          .from('trade_images')
          .insert({
            trade_id: tradeId,
            url: publicUrl,
            name: image.name
          })
          .select()
          .single()

        if (!imageError && imageData) {
          uploadedImages.push({
            id: imageData.id,
            url: imageData.url,
            name: imageData.name,
            uploadDate: new Date(imageData.upload_date)
          })
        }
      }
    }

    return {
      id: updatedTrade.id,
      entryTime: new Date(updatedTrade.entry_time),
      exitTime: updatedTrade.exit_time ? new Date(updatedTrade.exit_time) : undefined,
      type: updatedTrade.type,
      riskReward: updatedTrade.risk_reward,
      profitLoss: updatedTrade.profit_loss,
      profitLossPercent: updatedTrade.profit_loss_percent || undefined,
      pdArray: updatedTrade.pd_array,
      thoughts: updatedTrade.thoughts,
      images: uploadedImages,
      createdAt: new Date(updatedTrade.created_at),
      updatedAt: new Date(updatedTrade.updated_at)
    }
  } catch (error) {
    console.error('Error in updateTrade:', error)
    return null
  }
}

export async function deleteTrade(tradeId: string): Promise<boolean> {
  if (!supabase) return false
  
  try {
    // First get all images for this trade
    const { data: images } = await supabase
      .from('trade_images')
      .select('url')
      .eq('trade_id', tradeId)

    // Delete images from storage
    if (images && images.length > 0) {
      const filePaths = images.map(image => {
        // Extract the path from the full URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/trade-images/trade-id/filename.ext
        const urlParts = image.url.split('/storage/v1/object/public/trade-images/')
        if (urlParts.length > 1) {
          return urlParts[1] // This gives us "trade-id/filename.ext"
        }
        // Fallback to old method if URL format is different
        return image.url.split('/').slice(-2).join('/')
      })

      console.log('Deleting storage files:', filePaths)
      
      const { error: storageError } = await supabase.storage
        .from('trade-images')
        .remove(filePaths)
      
      if (storageError) {
        console.error('Error deleting images from storage:', storageError)
        // Continue even if storage deletion fails
      }
    }

    // Delete the trade (this will cascade delete trade_images records)
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeId)

    if (error) {
      console.error('Error deleting trade:', error)
      return false
    }

    console.log('Trade and images deleted successfully')
    return true
  } catch (error) {
    console.error('Error in deleteTrade:', error)
    return false
  }
}