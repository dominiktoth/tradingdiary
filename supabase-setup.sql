-- Reset (safe for fresh setup; will not affect anything on first run)
DROP TABLE IF EXISTS trade_images CASCADE;
DROP TABLE IF EXISTS trades CASCADE;

-- trades
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_time TIMESTAMP WITH TIME ZONE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('long', 'short')),
  risk_reward DECIMAL(10, 2) NOT NULL,
  profit_loss DECIMAL(10, 2) NOT NULL,
  profit_loss_percent DECIMAL(10, 2),
  htf_c2t VARCHAR(20) NOT NULL,
  entry_interval VARCHAR(20) NOT NULL,
  thoughts TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- trade_images: one image per category per trade
CREATE TABLE trade_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('htf', 'seven_hour', 'entry')),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (trade_id, category)
);

CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_trade_images_trade_id ON trade_images(trade_id);

-- Row level security with open policies (gate is the app password, not RLS)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on trades" ON trades
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on trade_images" ON trade_images
  FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket + policies (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('trade-images', 'trade-images', true, 5242880)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880;

DROP POLICY IF EXISTS "Public upload to trade-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read trade-images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete trade-images" ON storage.objects;
DROP POLICY IF EXISTS "Public update trade-images" ON storage.objects;

CREATE POLICY "Public upload to trade-images"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'trade-images');

CREATE POLICY "Public read trade-images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'trade-images');

CREATE POLICY "Public delete trade-images"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'trade-images');

CREATE POLICY "Public update trade-images"
  ON storage.objects FOR UPDATE TO public
  USING (bucket_id = 'trade-images');
