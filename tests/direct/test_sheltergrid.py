import json
from pathlib import Path

import pytest


CONTRACT_PATH = str(Path(__file__).resolve().parents[2] / "contracts" / "ShelterGrid.py")
POLICY = (
    "Activation requires attributable capacity, supplies, accessibility, staffing "
    "and incident evidence, with no dimension silently upgraded from missing data."
)
DIMENSIONS = ("CAPACITY", "SUPPLIES", "ACCESSIBILITY", "STAFFING", "INCIDENTS")


def deploy_grid(direct_vm, direct_deploy, owner):
    direct_vm.sender = owner
    contract = direct_deploy(CONTRACT_PATH)
    contract.configure_grid("ShelterGrid emergency network", POLICY)
    return contract


def register_shelter(contract):
    contract.register_shelter(
        "shelter-north",
        "North civic shelter",
        "14 Civic Square, North District",
        "https://example.org/facilities/north-shelter",
    )


def complete_inventory(contract):
    register_shelter(contract)
    contract.add_capacity_zone(
        "shelter-north",
        "zone-main",
        "Main assembly hall",
        120,
        "Accessible overnight accommodation",
    )
    contract.log_supply_lot(
        "shelter-north", "lot-water", "drinking water", 600, "2027-12"
    )
    contract.record_accessibility_check(
        "shelter-north",
        "check-entry",
        "Step-free public entrance",
        True,
        "https://example.org/evidence/north-entry",
    )
    contract.schedule_staffing_shift(
        "shelter-north",
        "shift-night",
        "Night operations team",
        8,
        "20:00-08:00",
    )


def mock_readiness(direct_vm, overall_status):
    direct_vm.clear_mocks()
    direct_vm.mock_web(
        r".*example\.org.*",
        {"status": 200, "body": "Attributable shelter plan and accessibility evidence."},
    )
    direct_vm.mock_llm(
        r".*emergency-shelter readiness.*",
        json.dumps(
            {
                "dimensions": [
                    {
                        "name": name,
                        "status": overall_status,
                        "reason": "The declared inventory supports this readiness result.",
                    }
                    for name in DIMENSIONS
                ],
                "confidence_bps": 9000,
                "summary": "All five readiness dimensions were evaluated independently.",
            }
        ),
    )


def test_configuration_is_owner_only(direct_vm, direct_deploy, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT_PATH)
    direct_vm.sender = direct_bob
    with pytest.raises(Exception):
        contract.configure_grid("Unauthorized grid", POLICY)
    direct_vm.sender = direct_alice
    contract.configure_grid("Emergency shelter grid", POLICY)
    assert contract.get_grid_config()["configured"] is True


@pytest.mark.parametrize("unsafe_id", ["ab", "UPPER", "has space", "has/slash", "x" * 65])
def test_shelter_id_validation(unsafe_id, direct_vm, direct_deploy, direct_alice):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    with pytest.raises(Exception):
        contract.register_shelter(
            unsafe_id,
            "North shelter",
            "14 Civic Square",
            "https://example.org/facilities/north-shelter",
        )


@pytest.mark.parametrize(
    "unsafe_url",
    [
        "http://example.org/a",
        "https://localhost/a",
        "https://127.0.0.1/a",
        "https://10.0.0.1/a",
        "https://192.168.1.1/a",
    ],
)
def test_facility_plan_url_validation(
    unsafe_url, direct_vm, direct_deploy, direct_alice
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    with pytest.raises(Exception):
        contract.register_shelter(
            "shelter-north", "North shelter", "14 Civic Square", unsafe_url
        )


def test_only_operator_builds_readiness_inventory(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    register_shelter(contract)
    direct_vm.sender = direct_bob
    with pytest.raises(Exception):
        contract.add_capacity_zone(
            "shelter-north", "zone-main", "Main hall", 120, "Overnight shelter"
        )


def test_capacity_and_stock_quantities_must_be_positive(
    direct_vm, direct_deploy, direct_alice
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    register_shelter(contract)
    with pytest.raises(Exception):
        contract.add_capacity_zone(
            "shelter-north", "zone-main", "Main hall", 0, "Overnight shelter"
        )
    contract.add_capacity_zone(
        "shelter-north", "zone-main", "Main hall", 120, "Overnight shelter"
    )
    with pytest.raises(Exception):
        contract.log_supply_lot(
            "shelter-north", "lot-water", "water", 0, "2027-12"
        )


def test_readiness_review_requires_complete_core_inventory(
    direct_vm, direct_deploy, direct_alice
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    register_shelter(contract)
    contract.add_capacity_zone(
        "shelter-north", "zone-main", "Main hall", 120, "Overnight shelter"
    )
    with pytest.raises(Exception):
        contract.request_readiness_review("shelter-north")


def test_inventory_register_exposes_distinct_domains(
    direct_vm, direct_deploy, direct_alice
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    complete_inventory(contract)
    inventory = contract.get_readiness_inventory("shelter-north")
    assert inventory["zones"][0]["capacity"] == 120
    assert inventory["supplies"][0]["quantity"] == 600
    assert inventory["checks"][0]["passed"] is True
    assert inventory["shifts"][0]["headcount"] == 8
    vector = contract.get_readiness_vector("shelter-north")
    assert vector["dimensions"]["capacity"]["total_places"] == 120
    assert vector["dimensions"]["supplies"]["total_units"] == 600
    assert vector["dimensions"]["accessibility"] == {"passed": 1, "checked": 1}
    assert vector["dimensions"]["staffing"]["scheduled_people"] == 8
    assert vector["dimensions"]["incidents"]["open"] == 0


def test_only_coordinator_assesses_readiness(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    complete_inventory(contract)
    contract.request_readiness_review("shelter-north")
    mock_readiness(direct_vm, "READY")
    direct_vm.sender = direct_bob
    with pytest.raises(Exception):
        contract.assess_readiness("shelter-north")


def test_not_ready_shelter_cannot_activate(
    direct_vm, direct_deploy, direct_alice
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    complete_inventory(contract)
    contract.request_readiness_review("shelter-north")
    mock_readiness(direct_vm, "NOT_READY")
    contract.assess_readiness("shelter-north")
    assert contract.get_activation_plan("shelter-north")["result"] == "NOT_READY"
    with pytest.raises(Exception):
        contract.activate_shelter("shelter-north", "ACT-2026-001")


def test_public_incident_is_attributed_and_coordinator_closed(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    register_shelter(contract)
    direct_vm.sender = direct_bob
    contract.report_incident(
        "shelter-north",
        "incident-power",
        "MATERIAL",
        "The backup power test requires an accountable follow-up.",
    )
    incident = contract.get_incident_board("shelter-north")[0]
    assert incident["reporter"] == contract._operations_actor()
    vector = contract.get_readiness_vector("shelter-north")
    assert vector["dimensions"]["incidents"]["open"] == 1
    assert vector["dimensions"]["incidents"]["reported"] == 1
    with pytest.raises(Exception):
        contract.close_incident(
            "incident-power", "Unauthorized closure without coordinator authority."
        )
    direct_vm.sender = direct_alice
    contract.close_incident(
        "incident-power", "Backup power passed a documented replacement test."
    )
    assert contract.get_incident_board("shelter-north")[0]["status"] == "CLOSED"
    assert contract.get_readiness_vector("shelter-north")["dimensions"][
        "incidents"
    ]["open"] == 0


def test_ready_shelter_activation_report_and_archive_cycle(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    complete_inventory(contract)
    contract.request_readiness_review("shelter-north")
    mock_readiness(direct_vm, "READY")
    contract.assess_readiness("shelter-north")
    plan = contract.get_activation_plan("shelter-north")
    assert plan["result"] == "READY"
    assert plan["confidence_bucket"] == "HIGH"
    contract.activate_shelter("shelter-north", "ACT-2026-001")
    direct_vm.sender = direct_bob
    contract.submit_shift_report(
        "shelter-north",
        "report-night",
        87,
        "Water stock remains above the overnight threshold.",
        "Medical and registration desks handed over without open issues.",
    )
    assert contract.get_shift_reports("shelter-north")[0]["occupancy"] == 87
    direct_vm.sender = direct_alice
    contract.stand_down(
        "shelter-north", "The emergency order ended and all occupants departed."
    )
    contract.archive_shelter_cycle("shelter-north")
    assert contract.get_shelter("shelter-north")["state"] == "ARCHIVED"


def test_bootstrap_exposes_emergency_domain_counts(
    direct_vm, direct_deploy, direct_alice
):
    contract = deploy_grid(direct_vm, direct_deploy, direct_alice)
    complete_inventory(contract)
    bootstrap = contract.get_frontend_bootstrap()
    assert bootstrap["counts"]["shelters"] == 1
    assert bootstrap["counts"]["zones"] == 1
    assert bootstrap["counts"]["supplies"] == 1
    assert bootstrap["recent_shelters"][0]["id"] == "shelter-north"
