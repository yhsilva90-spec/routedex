"""Small, dependency-free helpers for reconciling encounter sources.

The workbook remains useful as an editorial source for special encounters, but
the location tables need to be able to add a species that the workbook missed.
These helpers keep one species per location while retaining one detail per
method/version/time combination.
"""
from __future__ import annotations

import json
from typing import Any


def _detail_key(detail: dict[str, Any]) -> str:
    """Return a stable key for a source detail, ignoring dictionary order."""

    return json.dumps(detail, ensure_ascii=False, sort_keys=True)


def _unique(values: list[Any]) -> list[Any]:
    return list(dict.fromkeys(value for value in values if value is not None))


def merge_canonical_details(
    encounter: dict[str, Any],
    canonical_details: list[dict[str, Any]],
    *,
    canonical_source_prefix: str = "https://pokemondb.net/location/",
) -> dict[str, Any]:
    """Merge canonical source details into an existing location encounter."""

    existing_details = encounter.get("details") or []
    details_by_key = {_detail_key(detail): detail for detail in existing_details}
    for detail in canonical_details:
        details_by_key[_detail_key(detail)] = detail
    details = list(details_by_key.values())

    encounter["details"] = details
    encounter["times"] = _unique(
        [time for detail in details for time in detail.get("times", [])]
        + list(encounter.get("times", []))
    )
    encounter["versions"] = _unique(
        [version for detail in details for version in detail.get("versions", [])]
        + list(encounter.get("versions", []))
    )
    methods = _unique([detail.get("method") for detail in details] + [encounter.get("method")])
    encounter["method"] = " · ".join(str(method) for method in methods) or None

    canonical_source = next(
        (detail.get("source") for detail in details if str(detail.get("source", "")).startswith(canonical_source_prefix)),
        None,
    )
    if canonical_source:
        encounter["source"] = canonical_source
    return encounter


def upsert_canonical_encounter(
    encounters: list[dict[str, Any]],
    *,
    location_id: str,
    pokemon_id: int,
    canonical_details: list[dict[str, Any]],
) -> tuple[dict[str, Any], bool]:
    """Add or merge a species at a location; return encounter and added flag."""

    existing = next((item for item in encounters if item.get("pokemonId") == pokemon_id), None)
    if existing:
        return merge_canonical_details(existing, canonical_details), False

    details = list(canonical_details)
    methods = _unique([detail.get("method") for detail in details])
    times = _unique([time for detail in details for time in detail.get("times", [])])
    versions = _unique([version for detail in details for version in detail.get("versions", [])])
    encounter = {
        "id": f"{location_id}-{pokemon_id}",
        "pokemonId": pokemon_id,
        "locationId": location_id,
        "method": " · ".join(str(method) for method in methods) or None,
        "condition": None,
        "times": times or ["unknown"],
        "versions": versions,
        "details": details,
        "source": details[0].get("source") if details else None,
    }
    encounters.append(encounter)
    return encounter, True
