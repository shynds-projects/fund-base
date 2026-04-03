-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  industry text,
  hq_location text,
  offices jsonb DEFAULT '[]'::jsonb,
  website text,
  logo_url text,
  estimated_arr text,
  top_clients text[] DEFAULT '{}',
  our_read text,
  enrichment_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Funding rounds table
CREATE TABLE IF NOT EXISTS funding_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  round_name text,
  amount text,
  date text,
  lead_investors text[] DEFAULT '{}',
  other_investors text[] DEFAULT '{}',
  valuation text,
  sort_order int DEFAULT 0
);

-- Founders table
CREATE TABLE IF NOT EXISTS founders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  title text,
  bio text,
  college text,
  mba text,
  previous_companies text[] DEFAULT '{}',
  linkedin_url text
);

-- Team patterns table
CREATE TABLE IF NOT EXISTS team_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  pattern_type text,
  pattern_value text
);
