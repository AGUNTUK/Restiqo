-- Upgrading bookings table with financial tracking
ALTER TABLE bookings
ADD COLUMN total_amount NUMERIC,
ADD COLUMN commission_amount NUMERIC,
ADD COLUMN host_earnings NUMERIC,
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN payout_status TEXT DEFAULT 'pending';

-- Migrate existing data (assuming total_price exists)
UPDATE bookings SET
  total_amount = total_price,
  commission_amount = total_price * 0.10,
  host_earnings = total_price * 0.90
WHERE total_amount IS NULL;

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'payout', 'commission')),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (user_id = auth.uid());

-- Create payouts table
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  method TEXT CHECK (method IN ('bkash', 'nagad', 'bank')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hosts can view their own payouts" ON payouts
  FOR SELECT USING (host_id = auth.uid());
CREATE POLICY "Hosts can insert their own payouts" ON payouts
  FOR INSERT WITH CHECK (host_id = auth.uid());
