# 🚀 GYORS BEÁLLÍTÁS - Csak 3 lépés!

## Opció 1: SQL Editor (Legegyszerűbb - 2 perc)

### 1. Nyisd meg ezt a linket:
https://supabase.com/dashboard/project/xipnoagqwgngomreuijr/sql/new

### 2. Másold be az ÖSSZES kódot alulról

### 3. Nyomd meg a RUN gombot (jobb alsó sarok)

```sql
-- TELJES SETUP - Másold be az egészet!

-- 1. TÁBLÁK
DROP TABLE IF EXISTS trade_images CASCADE;
DROP TABLE IF EXISTS trades CASCADE;

CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_time TIMESTAMPTZ NOT NULL,
  exit_time TIMESTAMPTZ,
  type VARCHAR(10) NOT NULL,
  risk_reward NUMERIC(10, 2) NOT NULL,
  profit_loss NUMERIC(10, 2) NOT NULL,
  profit_loss_percent NUMERIC(10, 2),
  pd_array TEXT NOT NULL,
  thoughts TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trade_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEXEK
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_trade_images_trade_id ON trade_images(trade_id);

-- 3. SECURITY
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON trades
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON trade_images
  FOR ALL USING (true) WITH CHECK (true);

-- 4. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trade-images', 
  'trade-images', 
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
) ON CONFLICT (id) DO NOTHING;

-- 5. STORAGE POLICY
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;

CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'trade-images');

CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'trade-images');
```

## ✅ KÉSZ!

Ha SUCCESS-t látsz, akkor:
1. Frissítsd az appot (F5)
2. Működnie kell!

---

## Opció 2: Table Editor UI (Ha nem működik az SQL)

### Trades tábla:
1. Table Editor → Create new table
2. Name: `trades`
3. Columns:
   - id: uuid, primary key, default: gen_random_uuid()
   - entry_time: timestamptz, required
   - exit_time: timestamptz
   - type: text, required
   - risk_reward: numeric
   - profit_loss: numeric
   - profit_loss_percent: numeric
   - pd_array: text
   - thoughts: text
   - created_at: timestamptz, default: now()
   - updated_at: timestamptz, default: now()

### Trade_images tábla:
1. Table Editor → Create new table
2. Name: `trade_images`
3. Columns:
   - id: uuid, primary key, default: gen_random_uuid()
   - trade_id: uuid, foreign key → trades.id
   - url: text
   - name: text
   - upload_date: timestamptz, default: now()
   - created_at: timestamptz, default: now()

### Storage:
1. Storage → New bucket
2. Name: `trade-images`
3. Public: ✅ Yes