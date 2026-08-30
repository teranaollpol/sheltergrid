export type ContractParam = {
  name: string;
  type: "string" | "int" | "bool" | "address";
};

export type ContractMethod = {
  name: string;
  kind: "read" | "write";
  params: readonly ContractParam[];
  returns: string;
};

export const contractSurfaceIdentity = {
  layout: "opswall",
  kicker: "ShelterGrid / authenticated emergency operations",
  title: "Shelter operations console",
  description: "Verify authority-published evidence, freshness, readiness revisions, incidents and activation from one auditable Studionet interface.",
  readLabel: "Grid signals",
  writeLabel: "Command actions",
  searchPlaceholder: "Search emergency operations",
  readAction: "Read grid signal",
  writeAction: "Issue command action",
  resultLabel: "Situation return",
  emptyResult: "Authenticated evidence, readiness revisions and finalized receipts will populate this panel.",
  colors: { background: "#eef2e8", panel: "#f7f4e9", ink: "#14221a", muted: "#637066", accent: "#f04a2f", border: "#9fae98" },
} as const;

const p = (name: string, type: ContractParam["type"]): ContractParam => ({ name, type });
const read = (name: string, params: ContractParam[], returns: string): ContractMethod => ({ name, kind: "read", params, returns });
const write = (name: string, params: ContractParam[]): ContractMethod => ({ name, kind: "write", params, returns: "null" });

export const contractMethods = [
  read("get_activation_plan", [p("shelter_id", "string")], "dict"),
  read("get_evidence_authority", [p("authority_id", "string")], "dict"),
  read("get_frontend_bootstrap", [], "dict"),
  read("get_grid_config", [], "dict"),
  read("get_incident_board", [p("shelter_id", "string")], "array"),
  read("get_operational_evidence", [p("evidence_id", "string")], "dict"),
  read("get_operations_timeline", [p("shelter_id", "string")], "array"),
  read("get_readiness_inventory", [p("shelter_id", "string")], "dict"),
  read("get_readiness_vector", [p("shelter_id", "string")], "dict"),
  read("get_shelter", [p("shelter_id", "string")], "dict"),
  read("get_shelter_evidence", [p("shelter_id", "string")], "array"),
  read("get_shelters_by_state", [p("state", "string")], "array"),
  read("get_shift_reports", [p("shelter_id", "string")], "array"),
  write("activate_shelter", [p("shelter_id", "string"), p("activation_reference", "string")]),
  write("add_capacity_zone", [p("shelter_id", "string"), p("zone_id", "string"), p("label", "string"), p("capacity", "int"), p("purpose", "string"), p("evidence_id", "string")]),
  write("archive_shelter_cycle", [p("shelter_id", "string")]),
  write("assess_readiness", [p("shelter_id", "string")]),
  write("close_incident", [p("incident_id", "string"), p("resolution", "string"), p("resolution_evidence_id", "string")]),
  write("configure_grid", [p("grid_name", "string"), p("readiness_policy", "string")]),
  write("log_supply_lot", [p("shelter_id", "string"), p("lot_id", "string"), p("category", "string"), p("quantity", "int"), p("expiry_label", "string"), p("evidence_id", "string")]),
  write("record_accessibility_check", [p("shelter_id", "string"), p("check_id", "string"), p("checkpoint", "string"), p("passed", "bool"), p("evidence_id", "string")]),
  write("register_shelter", [p("shelter_id", "string"), p("name", "string"), p("address_label", "string"), p("facility_plan_url", "string")]),
  write("report_incident", [p("shelter_id", "string"), p("incident_id", "string"), p("severity", "string"), p("description", "string"), p("evidence_id", "string")]),
  write("request_readiness_review", [p("shelter_id", "string")]),
  write("schedule_staffing_shift", [p("shelter_id", "string"), p("shift_id", "string"), p("role", "string"), p("headcount", "int"), p("window_label", "string"), p("evidence_id", "string")]),
  write("set_coordinator", [p("account", "address"), p("allowed", "bool")]),
  write("set_evidence_authority", [p("authority_id", "string"), p("name", "string"), p("account", "address"), p("allowed", "bool")]),
  write("stand_down", [p("shelter_id", "string"), p("close_note", "string")]),
  write("submit_operational_evidence", [p("shelter_id", "string"), p("evidence_id", "string"), p("authority_id", "string"), p("category", "string"), p("source_url", "string"), p("source_sha256", "string"), p("valid_for_seconds", "int")]),
  write("submit_shift_report", [p("shelter_id", "string"), p("report_id", "string"), p("occupancy", "int"), p("supply_note", "string"), p("handoff_note", "string"), p("evidence_id", "string")]),
] as const satisfies readonly ContractMethod[];
