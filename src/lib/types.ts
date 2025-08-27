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

export type FlowCapture = {
  project_id?: string;
  flow_id_ext?: string;
  start_url?: string | null;
  started_at?: string | null;
  pages?: PageRecord[];
  navigations?: any[];
  // Anything else your loader returns will be available via index access
  [key: string]: any;
};


export type RunsResponse = { items: RunRow[]; count: number };
