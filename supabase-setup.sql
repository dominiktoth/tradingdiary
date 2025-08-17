-- Create trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_time TIMESTAMP WITH TIME ZONE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('long', 'short')),
  risk_reward DECIMAL(10, 2) NOT NULL,
  profit_loss DECIMAL(10, 2) NOT NULL,
  profit_loss_percent DECIMAL(10, 2),
  pd_array TEXT NOT NULL,
  thoughts TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trade_images table
CREATE TABLE trade_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_trade_images_trade_id ON trade_images(trade_id);

-- Enable Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_images ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you can add auth later)
CREATE POLICY "Allow all operations on trades" ON trades
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on trade_images" ON trade_images
  FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for trade images
-- Run this in Supabase SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('trade-images', 'trade-images', true);