export type FlowRow = {
  project_id: string;
  flow_id_ext: string;
  started_at: string;
  start_url: string | null;
};

export type RunRow = {
  id: number;
  project_id: string;
  run_uid: string;
  run_id_ext: string;
  status: "passed" | "failed" | "mixed";
  passed: number;
  failed: number;
  total: number;
  duration_ms: number;
  start_url: string | null;
  mcp_server: string | null;
  created_at: string;
};

export type ElementRecord = {
  element_key?: string;
  semantic_role?: string | null;
  html_tag?: string | null;
  aria_role?: string | null;
  text_content?: string | null;
  selectors?: any;
  selectors_json?: any;
  labels_json?: any;
  state_json?: any;
};

export type PageRecord = {
  url: string;
  title?: string | null;
  tab_id?: string | null;
  first_seen_at?: string | null;
  last_seen_at?: string | null;
  elements?: Record<string, ElementRecord>; // backend returns dict of elements
};


export type RunsResponse = { items: RunRow[]; count: number };


export interface FlowCapture {
  project: {
    id: string;
    flow_id: string;
    started_at?: string;
    start_url?: string | null;
  };
  pages: FlowPage[];
}

export interface FlowPage {
  url: string;
  title?: string | null;
  tab_id?: string | null;
  first_seen_at?: string;
  last_seen_at?: string;
  elements: Record<string, FlowElement>;
}

export interface FlowElement {
  element_id: string;                 // element_key from DB
  tab_id?: string | null;
  stable_fingerprint: string;
  page_url: string;
  semantic_role?: string | null;
  html_tag?: string | null;
  aria_role?: string | null;
  text?: string | null;
  labels?: any;
  state?: any;
  location?: any;
  dom_hierarchy?: any[];
  access?: any;
  attributes?: any;
  metadata?: any;
  selectors?: {
    preferred?: { value?: string;[k: string]: any };
    [k: string]: any;
  };
  embedding?: { input_text?: string | null; vector_id?: any };
  first_seen_at?: string;
  last_seen_at?: string;
  clicks: number;
  inputs: number;
  submits: number;
  keys: number;
  interaction_history: Array<{
    action: string;                   // click/input/submit/keydown/enter
    input_value?: string | null;
    input_redacted?: boolean;
    screenshot_path?: string | null;
    admin_note?: string | null;
    at: string;                       // ISO
  }>;
  versioning?: {
    current_version: number;
    versions: any[];
  };
}


// --- Product & Flow types ---
// Product
export type Project = {
  project_id: string;             // PK
  project_label: string;          // unique
  project_description: string;
  created_at: string;
  updated_at: string;
};

// Flow
export type Flow = {
  flow_id: string;                // PK
  flow_id_ext: string;            // external ref
  project_id: string;             // FK
  feature_name: string;
  start_url: string;
  flow_description: string;
  created_at: string;
  started_at: string;
};

// Inputs
export type CreateProjectInput = {
  project_label: string;
  project_description: string;
};

export type CreateFlowInput = {
  project_id: string;
  feature_name: string;
  start_url: string;
  flow_description: string;
};