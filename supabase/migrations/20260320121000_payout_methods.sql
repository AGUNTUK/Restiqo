-- Create payout_methods table
CREATE TABLE payout_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT CHECK (provider IN ('bKash', 'Nagad', 'Bank')),
  account_details TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for payout_methods
ALTER TABLE payout_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hosts can view own payout methods" ON payout_methods FOR SELECT USING (host_id = auth.uid());
CREATE POLICY "Hosts can insert own payout methods" ON payout_methods FOR INSERT WITH CHECK (host_id = auth.uid());
CREATE POLICY "Hosts can update own payout methods" ON payout_methods FOR UPDATE USING (host_id = auth.uid());
CREATE POLICY "Hosts can delete own payout methods" ON payout_methods FOR DELETE USING (host_id = auth.uid());
