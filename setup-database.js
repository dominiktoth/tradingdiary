const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xipnoagqwgngomreuijr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpcG5vYWdxd2duZ29tcmV1aWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MzI3NjYsImV4cCI6MjA3MTAwODc2Nn0.rs5IrZ594zu75L5i-xnESpqgFKDA1mzz8mb6yMzpE_I'

// Need service role key for DDL operations
// Get it from: Settings -> API -> service_role (secret)
console.log('⚠️  FONTOS: Szükséged van a SERVICE ROLE kulcsra!')
console.log('1. Menj ide: https://supabase.com/dashboard/project/xipnoagqwgngomreuijr/settings/api')
console.log('2. Keresd meg: "service_role" (secret) - ez alatt van')
console.log('3. Másold ide és futtasd újra a scriptet:\n')

const SERVICE_ROLE_KEY = process.argv[2]

if (!SERVICE_ROLE_KEY) {
  console.log('Használat: node setup-database.js [SERVICE_ROLE_KEY]')
  console.log('Példa: node setup-database.js eyJ...')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n')

  try {
    // Create tables
    console.log('📊 Creating tables...')
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing tables
        DROP TABLE IF EXISTS trade_images CASCADE;
        DROP TABLE IF EXISTS trades CASCADE;

        -- Create trades table
        CREATE TABLE trades (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          entry_time TIMESTAMPTZ NOT NULL,
          exit_time TIMESTAMPTZ,
          type VARCHAR(10) NOT NULL CHECK (type IN ('long', 'short')),
          risk_reward NUMERIC(10, 2) NOT NULL,
          profit_loss NUMERIC(10, 2) NOT NULL,
          profit_loss_percent NUMERIC(10, 2),
          pd_array TEXT NOT NULL,
          thoughts TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create trade_images table
        CREATE TABLE trade_images (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
          url TEXT NOT NULL,
          name TEXT NOT NULL,
          upload_date TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
        CREATE INDEX idx_trade_images_trade_id ON trade_images(trade_id);

        -- Enable RLS
        ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
        ALTER TABLE trade_images ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Enable all for anon" ON trades
          FOR ALL TO anon
          USING (true) WITH CHECK (true);

        CREATE POLICY "Enable all for anon" ON trade_images
          FOR ALL TO anon
          USING (true) WITH CHECK (true);
      `
    }).catch(err => ({ error: err }))

    if (createError) {
      console.log('❌ Table creation failed:', createError.message)
      console.log('\n📝 Trying alternative method via SQL Editor...')
      console.log('Please run the SQL manually in Supabase SQL Editor')
    } else {
      console.log('✅ Tables created successfully!')
    }

    // Create storage bucket
    console.log('\n📁 Creating storage bucket...')
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (!listError) {
      const exists = buckets?.some(b => b.name === 'trade-images')
      
      if (!exists) {
        const { error: bucketError } = await supabase.storage.createBucket('trade-images', {
          public: true,
          fileSizeLimit: 52428800,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        })
        
        if (bucketError) {
          console.log('❌ Bucket creation failed:', bucketError.message)
        } else {
          console.log('✅ Storage bucket created!')
        }
      } else {
        console.log('✅ Storage bucket already exists!')
      }
    }

    console.log('\n✨ Setup complete!')
    console.log('You can now use the app with Supabase!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupDatabase()