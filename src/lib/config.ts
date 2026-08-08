export const appConfig = {
  "projectId": "10-sheltergrid",
  "name": "ShelterGrid",
  "theme": "vodafone",
  "layout": "operations",
  "resource": "three",
  "primary": "Shelter cycle",
  "primaryPlural": "Shelters",
  "action": "Monitor readiness lanes",
  "summary": "Coordinate capacity, supplies, accessibility, incidents, and activation readiness.",
  "neutral": "limited_activation",
  "routes": [
    [
      "/network",
      "Wall"
    ],
    [
      "/network",
      "Shelters"
    ],
    [
      "/network",
      "Checks"
    ],
    [
      "/network",
      "Incidents"
    ],
    [
      "/network",
      "Activation"
    ]
  ],
  "children": [
    [
      "add_capacity_zone",
      "Capacity zone"
    ],
    [
      "add_supply_check",
      "Supply check"
    ],
    [
      "add_accessibility_check",
      "Accessibility check"
    ],
    [
      "add_incident",
      "Incident"
    ],
    [
      "add_activation_review",
      "Activation review"
    ]
  ],
  "copy": {
    "network": "Readiness grid 61999",
    "loading": "Polling shelter stations",
    "readError": "Command grid unavailable",
    "metrics": ["Shelters", "Zones", "Supplies", "Incidents", "Activations"],
    "emptyTitle": "No shelters on the wall",
    "emptyBody": "The command wall has no active stations. Connect the coordinator wallet to register a shelter cycle.",
    "childUnit": "readiness checks",
    "transaction": "Command receipt",
    "createSubtitle": "Bring a shelter station onto the readiness grid",
    "idLabel": "Station code",
    "titleLabel": "Shelter name",
    "sourceLabel": "Facility plan URL",
    "summaryLabel": "Readiness brief",
    "createButton": "Register station",
    "evidenceTitle": "Log field check",
    "evidenceSubtitle": "Report capacity, supplies, accessibility, or incidents",
    "selectLabel": "Shelter cycle",
    "selectPlaceholder": "Choose station",
    "evidenceTypeLabel": "Field check",
    "evidenceIdLabel": "Check code",
    "evidenceNameLabel": "Station label",
    "evidenceNoteLabel": "Field note",
    "evidenceButton": "Log check",
    "commands": ["Seal readiness checks", "Run activation review", "Authorize activation", "Return to standby"],
    "filingIdLabel": "Incident code",
    "rationaleLabel": "Field condition",
    "fileButton": "Raise incident",
    "waiveButton": "Close incident window",
    "routeKickers": ["Command wall", "Shelter stations", "Readiness checks", "Incident board", "Activation authority"],
    "visibleUnit": "stations reporting",
    "safetyTitle": "Limited-activation rule",
    "safetyBody": "A critical supply, accessibility, or incident gap limits activation until command reassessment."
  },
  "methods": {
    "create": "register_shelter_cycle",
    "seal": "seal_readiness_checks",
    "review": "run_activation_review",
    "finalize": "finalize_activation",
    "archive": "return_to_standby",
    "openDispute": "raise_field_incident",
    "resolveDispute": "resolve_field_incident",
    "waiveDispute": "waive_incident_window",
    "openCorrection": "request_command_reassessment",
    "resolveCorrection": "resolve_command_reassessment",
    "waiveCorrection": "waive_reassessment_window"
  },
  "lifecycle": {
    "dispute": "Field incident",
    "correction": "Command reassessment"
  }
} as const;
