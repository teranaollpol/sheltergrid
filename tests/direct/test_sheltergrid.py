import hashlib
import json
from pathlib import Path

import pytest


CONTRACT_PATH = str(Path(__file__).resolve().parents[2] / "contracts" / "ShelterGrid.py")
POLICY = (
    "Full activation requires fresh authority-authenticated facility, capacity, "
    "supply, accessibility, staffing and incident evidence. Every material "
    "change invalidates the prior assessment until a new consensus review."
)
DIMENSIONS = ("CAPACITY", "SUPPLIES", "ACCESSIBILITY", "STAFFING", "INCIDENTS")
EVIDENCE_BODY = (
    "Shelter North authority record: facility approved; capacity 120; water 600; "
    "accessible entrance passed; eight staff scheduled; no open incidents."
)
EVIDENCE_SHA256 = hashlib.sha256(EVIDENCE_BODY.encode()).hexdigest()
EVIDENCE_URL = "https://example.org/sheltergrid/authority-record"


def mock_authority_source(direct_vm, body=EVIDENCE_BODY):
    direct_vm.mock_web(
        r".*example\.org/sheltergrid/.*",
        {"status": 200, "body": body},
    )


def mock_readiness(direct_vm, status="READY"):
    mock_authority_source(direct_vm)
    direct_vm.mock_llm(
        r".*emergency-shelter readiness.*",
        json.dumps(
            {
                "dimensions": [
                    {
                        "name": name,
                        "status": status,
                        "reason": "The authenticated authority record supports this result.",
                    }
                    for name in DIMENSIONS
                ],
                "confidence_bps": 9100,
                "summary": "All consequential readiness dimensions were compared.",
            }
        ),
    )


def deploy_grid(direct_vm, direct_deploy, owner):
    direct_vm.sender = owner
    contract = direct_deploy(CONTRACT_PATH)
    contract.configure_grid("ShelterGrid emergency network", POLICY)
    contract.set_evidence_authority(
        "city-eoc",
        "City Emergency Operations Centre",
        owner,
        True,
    )
    return contract


def register_shelter(contract):
    contract.register_shelter(
        "shelter-north",
        "North civic shelter",
        "14 Civic Square, North District",
        "https://example.org/sheltergrid/facility-plan",
    )


def submit_evidence(contract, category, evidence_id):
    contract.submit_operational_evidence(
        "shelter-north",
        evidence_id,
        "city-eoc",
        category,
        EVIDENCE_URL,
        EVIDENCE_SHA256,
        86400,
    )


def authenticate_all_dimensions(contract, direct_vm):
    mock_authority_source(direct_vm)
    for category, evidence_id in (
        ("FACILITY", "ev-facility"),
        ("CAPACITY", "ev-capacity"),
        ("SUPPLIES", "ev-supplies"),
        ("ACCESSIBILITY", "ev-access"),
        ("STAFFING", "ev-staffing"),
        ("INCIDENTS", "ev-incidents"),
    ):
        submit_evidence(contract, category, evidence_id)


def complete_inventory(contract, direct_vm):
    register_shelter(contract)
    authenticate_all_dimensions(contract, direct_vm)
    contract.add_capacity_zone(
        "shelter-north",
        "zone-main",
        "Main assembly hall",
        120,
        "Accessible overnight accommodation",
        "ev-capacity",
    )
    contract.log_supply_lot(
        "shelter-north",
        "lot-water",
        "drinking water",
        600,
        "2027-12",
        "ev-supplies",
    )
    contract.record_accessibility_check(
        "shelter-north",
        "check-entry",
        "Step-free public entrance",
        True,
        "ev-access",
    )
    contract.schedule_staffing_shift(
        "shelter-north",
        "shift-night",
        "Night operations team",
        8,
        "20:00-08:00",
        "ev-staffing",
    )


def assess_ready(contract, direct_vm):
    contract.request_readiness_review("shelter-north")
    mock_readiness(direct_vm)
    contract.assess_readiness("shelter-north")


def test_owner_and_authority_roles_are_enforced(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT_PATH)
    direct_vm.sender = direct_bob
    with pytest.raises(Exception):
        contract.configure_grid("Unauthorized grid", POLICY)
    direct_vm.sender = direct_alice
    contract.configure_grid("ShelterGrid emergency network", POLICY)
    contract.set_evidence_authority("city-eoc", "City EOC", direct_bob, True)
    register_shelter(contract)
    mock_authority_source(direct_vm)
    with pytest.raises(Exception):
        submit_evidence(contract, "FACILITY", "ev-forged")
    direct_vm.sender = direct_bob
    submit_evidence(contract, "FACILITY", "ev-facility")
    assert contract.get_evidence_authority("city-eoc")["wallet"] == contract._operations_actor()
    assert contract.get_operational_evidence("ev-facility")["authority_id"] == "city-eoc"


def test_digest_and_freshness_are_mandatory(
    direct_vm, direct_deploy, direct_alice
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    register_shelter(contract)
    mock_authority_source(direct_vm)
    with pytest.raises(Exception):
        contract.submit_operational_evidence(
            "shelter-north",
            "ev-wrong",
            "city-eoc",
            "FACILITY",
            EVIDENCE_URL,
            "0" * 64,
            86400,
        )
    with pytest.raises(Exception):
        contract.submit_operational_evidence(
            "shelter-north",
            "ev-short",
            "city-eoc",
            "FACILITY",
            EVIDENCE_URL,
            EVIDENCE_SHA256,
            299,
        )


def test_review_requires_authenticated_evidence_for_every_dimension(
    direct_vm, direct_deploy, direct_alice
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    register_shelter(contract)
    mock_authority_source(direct_vm)
    for category, evidence_id in (
        ("CAPACITY", "ev-capacity"),
        ("SUPPLIES", "ev-supplies"),
        ("ACCESSIBILITY", "ev-access"),
        ("STAFFING", "ev-staffing"),
    ):
        submit_evidence(contract, category, evidence_id)
    contract.add_capacity_zone(
        "shelter-north", "zone-main", "Main hall", 120, "Overnight", "ev-capacity"
    )
    contract.log_supply_lot(
        "shelter-north", "lot-water", "water", 600, "2027-12", "ev-supplies"
    )
    contract.record_accessibility_check(
        "shelter-north", "check-entry", "Step-free entrance", True, "ev-access"
    )
    contract.schedule_staffing_shift(
        "shelter-north", "shift-night", "Night team", 8, "20:00-08:00", "ev-staffing"
    )
    with pytest.raises(Exception):
        contract.request_readiness_review("shelter-north")


def test_critical_incident_invalidates_old_verdict_and_forces_reassessment(
    direct_vm, direct_deploy, direct_alice
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    complete_inventory(contract, direct_vm)
    assess_ready(contract, direct_vm)
    before = contract.get_shelter("shelter-north")
    assert before["state"] == "READY"
    assert before["assessment_current"] is True

    mock_authority_source(direct_vm)
    submit_evidence(contract, "INCIDENTS", "ev-critical")
    contract.report_incident(
        "shelter-north",
        "incident-power",
        "CRITICAL",
        "Backup power failed the authenticated authority inspection.",
        "ev-critical",
    )
    invalidated = contract.get_shelter("shelter-north")
    assert invalidated["state"] == "REASSESSMENT_REQUIRED"
    assert invalidated["assessment_current"] is False
    assert contract.get_readiness_vector("shelter-north")["dimensions"]["incidents"]["critical_open"] == 1
    with pytest.raises(Exception):
        contract.activate_shelter("shelter-north", "ACT-STALE-001")

    submit_evidence(contract, "INCIDENTS", "ev-resolution")
    contract.close_incident(
        "incident-power",
        "Backup power passed a witnessed replacement test.",
        "ev-resolution",
    )
    contract.request_readiness_review("shelter-north")
    mock_readiness(direct_vm)
    contract.assess_readiness("shelter-north")
    after = contract.get_shelter("shelter-north")
    assert after["state"] == "READY"
    assert after["assessed_revision"] == after["operational_revision"]


def test_complete_surface_and_operational_lifecycle(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    contract.set_coordinator(direct_bob, True)
    complete_inventory(contract, direct_vm)

    assert contract.get_grid_config()["configured"] is True
    assert len(contract.get_shelter_evidence("shelter-north")) == 6
    inventory = contract.get_readiness_inventory("shelter-north")
    assert inventory["zones"][0]["evidence_id"] == "ev-capacity"
    assert inventory["supplies"][0]["quantity"] == 600
    assert inventory["checks"][0]["passed"] is True
    assert inventory["shifts"][0]["headcount"] == 8

    contract.request_readiness_review("shelter-north")
    mock_readiness(direct_vm)
    direct_vm.sender = direct_bob
    contract.assess_readiness("shelter-north")
    plan = contract.get_activation_plan("shelter-north")
    assert plan["result"] == "READY"
    assert len(plan["evidence_snapshot"]) == 6
    contract.activate_shelter("shelter-north", "ACT-2026-001")
    contract.submit_shift_report(
        "shelter-north",
        "report-night",
        87,
        "Water stock remains above the threshold.",
        "Medical and registration desks handed over.",
        "ev-staffing",
    )
    assert contract.get_shift_reports("shelter-north")[0]["occupancy"] == 87
    contract.stand_down(
        "shelter-north", "The emergency order ended and all occupants departed."
    )
    direct_vm.sender = direct_alice
    contract.archive_shelter_cycle("shelter-north")

    assert contract.get_shelter("shelter-north")["state"] == "ARCHIVED"
    assert contract.get_shelters_by_state("ARCHIVED") == ["shelter-north"]
    assert len(contract.get_operations_timeline("shelter-north")) >= 10
    assert contract.get_incident_board("shelter-north") == []
    bootstrap = contract.get_frontend_bootstrap()
    assert bootstrap["counts"]["evidence"] == 6
    assert bootstrap["recent_shelters"][0]["id"] == "shelter-north"
