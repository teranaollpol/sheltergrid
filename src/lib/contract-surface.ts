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
  "layout": "opswall",
  "kicker": "ShelterGrid / emergency operations",
  "title": "Shelter operations console",
  "description": "Control shelter readiness, supplies, staffing, activation, incidents, shifts and stand-down from the complete grid interface.",
  "readLabel": "Grid signals",
  "writeLabel": "Command actions",
  "searchPlaceholder": "Search emergency operations",
  "readAction": "Read grid signal",
  "writeAction": "Issue command action",
  "resultLabel": "Situation return",
  "emptyResult": "Grid intelligence and finalized command receipts will populate this situation panel.",
  "colors": {
    "background": "#eef2e8",
    "panel": "#f7f4e9",
    "ink": "#14221a",
    "muted": "#637066",
    "accent": "#f04a2f",
    "border": "#9fae98"
  }
} as const;

export const contractMethods = [
  {
    "name": "get_activation_plan",
    "kind": "read",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      }
    ],
    "returns": "dict"
  },
  {
    "name": "get_frontend_bootstrap",
    "kind": "read",
    "params": [],
    "returns": "dict"
  },
  {
    "name": "get_grid_config",
    "kind": "read",
    "params": [],
    "returns": "dict"
  },
  {
    "name": "get_incident_board",
    "kind": "read",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      }
    ],
    "returns": "array"
  },
  {
    "name": "get_operations_timeline",
    "kind": "read",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      }
    ],
    "returns": "array"
  },
  {
    "name": "get_readiness_inventory",
    "kind": "read",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      }
    ],
    "returns": "dict"
  },
  {
    "name": "get_readiness_vector",
    "kind": "read",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      }
    ],
    "returns": "dict"
  },
  {
    "name": "get_shelter",
    "kind": "read",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      }
    ],
    "returns": "dict"
  },
  {
    "name": "get_shelters_by_state",
    "kind": "read",
    "params": [
      {
        "name": "state",
        "type": "string"
      }
    ],
    "returns": "array"
  },
  {
    "name": "get_shift_reports",
    "kind": "read",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      }
    ],
    "returns": "array"
  },
  {
    "name": "activate_shelter",
    "kind": "write",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      },
      {
        "name": "activation_reference",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "add_capacity_zone",
    "kind": "write",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      },
      {
        "name": "zone_id",
        "type": "string"
      },
      {
        "name": "label",
        "type": "string"
      },
      {
        "name": "capacity",
        "type": "int"
      },
      {
        "name": "purpose",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "archive_shelter_cycle",
    "kind": "write",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "assess_readiness",
    "kind": "write",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "close_incident",
    "kind": "write",
    "params": [
      {
        "name": "incident_id",
        "type": "string"
      },
      {
        "name": "resolution",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "configure_grid",
    "kind": "write",
    "params": [
      {
        "name": "grid_name",
        "type": "string"
      },
      {
        "name": "readiness_policy",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "log_supply_lot",
    "kind": "write",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      },
      {
        "name": "lot_id",
        "type": "string"
      },
      {
        "name": "category",
        "type": "string"
      },
      {
        "name": "quantity",
        "type": "int"
      },
      {
        "name": "expiry_label",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "record_accessibility_check",
    "kind": "write",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      },
      {
        "name": "check_id",
        "type": "string"
      },
      {
        "name": "checkpoint",
        "type": "string"
      },
      {
        "name": "passed",
        "type": "bool"
      },
      {
        "name": "evidence_url",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "register_shelter",
    "kind": "write",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      },
      {
        "name": "name",
        "type": "string"
      },
      {
        "name": "address_label",
        "type": "string"
      },
      {
        "name": "facility_plan_url",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "report_incident",
    "kind": "write",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      },
      {
        "name": "incident_id",
        "type": "string"
      },
      {
        "name": "severity",
        "type": "string"
      },
      {
        "name": "description",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "request_readiness_review",
    "kind": "write",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "schedule_staffing_shift",
    "kind": "write",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      },
      {
        "name": "shift_id",
        "type": "string"
      },
      {
        "name": "role",
        "type": "string"
      },
      {
        "name": "headcount",
        "type": "int"
      },
      {
        "name": "window_label",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "set_coordinator",
    "kind": "write",
    "params": [
      {
        "name": "account",
        "type": "address"
      },
      {
        "name": "allowed",
        "type": "bool"
      }
    ],
    "returns": "null"
  },
  {
    "name": "stand_down",
    "kind": "write",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      },
      {
        "name": "close_note",
        "type": "string"
      }
    ],
    "returns": "null"
  },
  {
    "name": "submit_shift_report",
    "kind": "write",
    "params": [
      {
        "name": "shelter_id",
        "type": "string"
      },
      {
        "name": "report_id",
        "type": "string"
      },
      {
        "name": "occupancy",
        "type": "int"
      },
      {
        "name": "supply_note",
        "type": "string"
      },
      {
        "name": "handoff_note",
        "type": "string"
      }
    ],
    "returns": "null"
  }
] as const satisfies readonly ContractMethod[];
