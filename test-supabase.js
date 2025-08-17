// Test script to check Supabase connection and tables
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xipnoagqwgngomreuijr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpcG5vYWdxd2duZ29tcmV1aWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MzI3NjYsImV4cCI6MjA3MTAwODc2Nn0.rs5IrZ594zu75L5i-xnESpqgFKDA1mzz8mb6yMzpE_I'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...\n')
  
  // Test 1: Check if trades table exists
  console.log('1. Checking trades table...')
  const { data: trades, error: tradesError } = await supabase
    .from('trades')
    .select('*')
    .limit(1)
  
  if (tradesError) {
    console.error('❌ Trades table error:', tradesError.message)
    console.log('   Hint:', tradesError.hint || 'No hint')
  } else {
    console.log('✅ Trades table exists')
  }
  
  // Test 2: Check if trade_images table exists
  console.log('\n2. Checking trade_images table...')
  const { data: images, error: imagesError } = await supabase
    .from('trade_images')
    .select('*')
    .limit(1)
  
  if (imagesError) {
    console.error('❌ Trade_images table error:', imagesError.message)
    console.log('   Hint:', imagesError.hint || 'No hint')
  } else {
    console.log('✅ Trade_images table exists')
  }
  
  // Test 3: Check storage bucket
  console.log('\n3. Checking storage bucket...')
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets()
  
  if (bucketsError) {
    console.error('❌ Storage error:', bucketsError.message)
  } else {
    const tradeBucket = buckets.find(b => b.name === 'trade-images')
    if (tradeBucket) {
      console.log('✅ Storage bucket "trade-images" exists')
    } else {
      console.log('❌ Storage bucket "trade-images" NOT found')
      console.log('   Available buckets:', buckets.map(b => b.name).join(', '))
    }
  }
  
  console.log('\n---')
  console.log('If tables are missing, run the SQL setup script in Supabase SQL Editor')
}

testConnection()