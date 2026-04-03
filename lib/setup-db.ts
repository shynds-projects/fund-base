import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupDatabase() {
  const { error } = await supabase.rpc("exec_sql", {
    query: `
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
    `,
  });

  if (error) {
    console.log("RPC not available, trying direct SQL via REST API...");
    // Fallback: use the Postgres connection directly
    const pgUrl = process.env.POSTGRES_URL_NON_POOLING;
    if (!pgUrl) {
      console.error("No POSTGRES_URL_NON_POOLING found");
      process.exit(1);
    }
    console.log("Please run the SQL manually in the Supabase dashboard SQL editor.");
    console.log("SQL file written to: lib/schema.sql");
  } else {
    console.log("Database tables created successfully!");
  }
}

setupDatabase();
