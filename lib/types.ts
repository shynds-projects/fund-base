export interface Company {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  industry: string | null;
  hq_location: string | null;
  offices: Office[];
  website: string | null;
  logo_url: string | null;
  estimated_arr: string | null;
  top_clients: string[];
  our_read: string | null;
  enrichment_status: "pending" | "in_progress" | "complete" | "failed";
  created_at: string;
  updated_at: string;
}

export interface Office {
  city: string;
  country: string;
  teams_hint: string;
}

export interface FundingRound {
  id: string;
  company_id: string;
  round_name: string;
  amount: string | null;
  date: string | null;
  lead_investors: string[];
  other_investors: string[];
  valuation: string | null;
  sort_order: number;
}

export interface Founder {
  id: string;
  company_id: string;
  name: string;
  title: string | null;
  bio: string | null;
  college: string | null;
  mba: string | null;
  previous_companies: string[];
  linkedin_url: string | null;
}

export interface TeamPattern {
  id: string;
  company_id: string;
  pattern_type: string;
  pattern_value: string;
}

export interface CompanyProfile extends Company {
  funding_rounds: FundingRound[];
  founders: Founder[];
  team_patterns: TeamPattern[];
}
