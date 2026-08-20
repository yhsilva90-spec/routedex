import type { Encounter, EncounterDetail, Location, Pokemon } from '../types';

export type DataAuditSeverity = 'info' | 'warning' | 'error';
export type DataAuditKind =
  | 'duplicate-encounter'
  | 'invalid-location'
  | 'invalid-encounter'
  | 'invalid-method'
  | 'invalid-time'
  | 'invalid-version'
  | 'unknown-time'
  | 'missing-source'
  | 'special-case';

export type DataAuditIssue = {
  severity: DataAuditSeverity;
  kind: DataAuditKind;
  location: string;
  pokemonId?: number;
  message: string;
};

export type SourceCoverage = {
  encounters: {
    total: number;
    withSource: number;
    withoutSource: number;
    canonicalLikeWithoutSource: number;
    specialCaseWithoutSource: number;
  };
  details: {
    total: number;
    withSource: number;
    withoutSource: number;
    canonicalLikeWithoutSource: number;
    specialCaseWithoutSource: number;
  };
};

export type DataAuditSummary = {
  locations: number;
  pokemon: number;
  encounters: number;
  issues: number;
};

export type DataAuditReport = {
  summary: DataAuditSummary;
  issues: DataAuditIssue[];
  sourceCoverage: SourceCoverage;
};

const VALID_METHODS = new Set([
  'Walking',
  'Surf',
  'Old Rod',
  'Good Rod',
  'Super Rod',
  'Poké Radar',
  'PokéRadar',
  'Swarm',
  'Honey Tree',
  'Shaking Trees',
]);

const VALID_TIMES = new Set(['morning', 'day', 'night', 'unknown']);
const VALID_VERSIONS = new Set(['BD', 'SP']);
const INVALID_ROUTE_ALIASES = new Set(['Route 22', 'Route 30', 'Route 121']);
const SPECIAL_LOCATION_NAMES = new Set([
  'Grand Underground',
  'Great Marsh',
  'Honey Trees',
  'Open water',
  'Other routes',
  'Ramanas Park',
  'Starter Pokémon',
  'Trophy Garden',
  'Evolution',
]);
const SPECIAL_METHODS = new Set(['Swarm', 'Honey Tree', 'Shaking Trees']);

function isValidMethod(method: string): boolean {
  return method.split(' · ').every((part) => VALID_METHODS.has(part.trim()));
}

function isValidTime(time: string): boolean {
  return VALID_TIMES.has(time);
}

function isValidVersion(version: string): boolean {
  return VALID_VERSIONS.has(version);
}

function hasSource(encounter: Encounter, details: EncounterDetail[]): boolean {
  return Boolean(encounter.source || details.some((detail) => detail.source));
}

function formatLocation(location: Location): string {
  return location.name || location.id || '(unknown location)';
}

function isSpecialCase(location: Location, encounter: Encounter, details: EncounterDetail[]): boolean {
  if (location.category === 'special' || SPECIAL_LOCATION_NAMES.has(location.name)) return true;
  if (SPECIAL_METHODS.has(encounter.method ?? '')) return true;
  return details.some((detail) => SPECIAL_METHODS.has(detail.method));
}

function pushIssue(issues: DataAuditIssue[], issue: DataAuditIssue): void {
  issues.push(issue);
}

function recordEncounterIssues(location: Location, encounter: Encounter, issues: DataAuditIssue[]): void {
  const detailList = encounter.details?.length ? encounter.details : [];
  const locationLabel = formatLocation(location);
  const hasDetailMethod = detailList.some((detail) => Boolean(detail.method));
  const specialCase = isSpecialCase(location, encounter, detailList) || (!encounter.method && !hasDetailMethod);

  if (!Number.isFinite(encounter.pokemonId) || encounter.pokemonId <= 0) {
    pushIssue(issues, {
      severity: 'error',
      kind: 'invalid-encounter',
      location: locationLabel,
      message: 'Encounter is missing a valid species id.',
    });
  }

  if (!encounter.locationId) {
    pushIssue(issues, {
      severity: 'error',
      kind: 'invalid-encounter',
      location: locationLabel,
      pokemonId: Number.isFinite(encounter.pokemonId) ? encounter.pokemonId : undefined,
      message: 'Encounter is missing a location id.',
    });
  }

  if (!encounter.method && !hasDetailMethod) {
    pushIssue(issues, {
      severity: specialCase ? 'info' : 'error',
      kind: specialCase ? 'special-case' : 'invalid-encounter',
      location: locationLabel,
      pokemonId: encounter.pokemonId,
      message: specialCase ? 'Special-case record has no encounter method.' : 'Encounter is missing a method.',
    });
  } else if (encounter.method && !isValidMethod(encounter.method)) {
    pushIssue(issues, {
      severity: 'error',
      kind: 'invalid-method',
      location: locationLabel,
      pokemonId: encounter.pokemonId,
      message: `Unsupported encounter method: ${encounter.method}.`,
    });
  }

  if (!encounter.times.length) {
    pushIssue(issues, {
      severity: 'error',
      kind: 'invalid-encounter',
      location: locationLabel,
      pokemonId: encounter.pokemonId,
      message: 'Encounter is missing times.',
    });
  }

  if (!encounter.versions.length) {
    pushIssue(issues, {
      severity: 'error',
      kind: 'invalid-encounter',
      location: locationLabel,
      pokemonId: encounter.pokemonId,
      message: 'Encounter is missing versions.',
    });
  }

  encounter.times.forEach((time) => {
    if (!isValidTime(time)) {
      pushIssue(issues, {
        severity: 'error',
        kind: 'invalid-time',
        location: locationLabel,
        pokemonId: encounter.pokemonId,
        message: `Unsupported encounter time: ${time}.`,
      });
    }
  });

  encounter.versions.forEach((version) => {
    if (!isValidVersion(version)) {
      pushIssue(issues, {
        severity: 'error',
        kind: 'invalid-version',
        location: locationLabel,
        pokemonId: encounter.pokemonId,
        message: `Unsupported game version: ${version}.`,
      });
    }
  });

  if (encounter.times.includes('unknown')) {
    pushIssue(issues, {
      severity: specialCase ? 'info' : 'warning',
      kind: 'unknown-time',
      location: locationLabel,
      pokemonId: encounter.pokemonId,
      message: specialCase
        ? 'Unknown time is expected for this special-case record.'
        : 'Encounter time is unknown and should be reviewed.',
    });
  }

  if (!hasSource(encounter, detailList)) {
    pushIssue(issues, {
      severity: specialCase ? 'warning' : 'warning',
      kind: specialCase ? 'special-case' : 'missing-source',
      location: locationLabel,
      pokemonId: encounter.pokemonId,
      message: specialCase
        ? 'Special-case record has no source and should stay reviewable.'
        : 'Canonical-looking encounter is missing a source.',
    });
  }

  detailList.forEach((detail) => {
    validateDetail(locationLabel, encounter.pokemonId, detail, specialCase, issues, encounter.times.includes('unknown'));
  });
}

function validateDetail(
  locationLabel: string,
  pokemonId: number,
  detail: EncounterDetail,
  specialCase: boolean,
  issues: DataAuditIssue[],
  unknownTimeAlreadyReported: boolean,
): void {
  if (!detail.method) {
    pushIssue(issues, {
      severity: 'error',
      kind: 'invalid-encounter',
      location: locationLabel,
      pokemonId,
      message: 'Encounter detail is missing a method.',
    });
  } else if (!isValidMethod(detail.method)) {
    pushIssue(issues, {
      severity: 'error',
      kind: 'invalid-method',
      location: locationLabel,
      pokemonId,
      message: `Unsupported encounter method: ${detail.method}.`,
    });
  }

  detail.times.forEach((time) => {
    if (!isValidTime(time)) {
      pushIssue(issues, {
        severity: 'error',
        kind: 'invalid-time',
        location: locationLabel,
        pokemonId,
        message: `Unsupported encounter time: ${time}.`,
      });
    }
  });

  detail.versions.forEach((version) => {
    if (!isValidVersion(version)) {
      pushIssue(issues, {
        severity: 'error',
        kind: 'invalid-version',
        location: locationLabel,
        pokemonId,
        message: `Unsupported game version: ${version}.`,
      });
    }
  });

  if (detail.times.includes('unknown') && !unknownTimeAlreadyReported) {
    pushIssue(issues, {
      severity: specialCase ? 'info' : 'warning',
      kind: 'unknown-time',
      location: locationLabel,
      pokemonId,
      message: specialCase
        ? 'Unknown time is expected for this special-case record.'
        : 'Encounter time is unknown and should be reviewed.',
    });
  }

  if (!detail.source && !specialCase) {
    pushIssue(issues, {
      severity: 'warning',
      kind: 'missing-source',
      location: locationLabel,
      pokemonId,
      message: 'Canonical-looking encounter detail is missing a source.',
    });
  }
}

function buildSourceCoverage(locations: Location[]): SourceCoverage {
  const coverage: SourceCoverage = {
    encounters: {
      total: 0,
      withSource: 0,
      withoutSource: 0,
      canonicalLikeWithoutSource: 0,
      specialCaseWithoutSource: 0,
    },
    details: {
      total: 0,
      withSource: 0,
      withoutSource: 0,
      canonicalLikeWithoutSource: 0,
      specialCaseWithoutSource: 0,
    },
  };

  locations.forEach((location) => {
    location.encounters.forEach((encounter) => {
      const detailList = encounter.details?.length ? encounter.details : [];
      const specialCase = isSpecialCase(location, encounter, detailList);
      const encounterHasSource = hasSource(encounter, detailList);

      coverage.encounters.total += 1;
      if (encounterHasSource) {
        coverage.encounters.withSource += 1;
      } else {
        coverage.encounters.withoutSource += 1;
        if (specialCase) coverage.encounters.specialCaseWithoutSource += 1;
        else coverage.encounters.canonicalLikeWithoutSource += 1;
      }

      if (!detailList.length) {
        return;
      }

      detailList.forEach((detail) => {
        const detailSpecialCase = specialCase || SPECIAL_METHODS.has(detail.method);
        coverage.details.total += 1;
        if (detail.source) {
          coverage.details.withSource += 1;
        } else {
          coverage.details.withoutSource += 1;
          if (detailSpecialCase) coverage.details.specialCaseWithoutSource += 1;
          else coverage.details.canonicalLikeWithoutSource += 1;
        }
      });
    });
  });

  return coverage;
}

export function auditGameData(locations: Location[], pokemon: Pokemon[]): DataAuditReport {
  const issues: DataAuditIssue[] = [];
  const pokemonIds = new Set(pokemon.map((item) => item.id));

  locations.forEach((location) => {
    if (INVALID_ROUTE_ALIASES.has(location.name)) {
      pushIssue(issues, {
        severity: 'error',
        kind: 'invalid-location',
        location: formatLocation(location),
        message: `Legacy route alias should be normalized: ${location.name}.`,
      });
    }

    const seenSpecies = new Set<number>();
    location.encounters.forEach((encounter) => {
      if (seenSpecies.has(encounter.pokemonId)) {
        pushIssue(issues, {
          severity: 'error',
          kind: 'duplicate-encounter',
          location: formatLocation(location),
          pokemonId: encounter.pokemonId,
          message: `Duplicate species detected in ${location.name}.`,
        });
      } else {
        seenSpecies.add(encounter.pokemonId);
      }

      if (Number.isFinite(encounter.pokemonId) && encounter.pokemonId > 0 && !pokemonIds.has(encounter.pokemonId)) {
        pushIssue(issues, {
          severity: 'warning',
          kind: 'invalid-encounter',
          location: formatLocation(location),
          pokemonId: encounter.pokemonId,
          message: `Encounter references unknown species id ${encounter.pokemonId}.`,
        });
      }

      recordEncounterIssues(location, encounter, issues);
    });
  });

  return {
    summary: {
      locations: locations.length,
      pokemon: pokemon.length,
      encounters: locations.reduce((count, location) => count + location.encounters.length, 0),
      issues: issues.length,
    },
    issues,
    sourceCoverage: buildSourceCoverage(locations),
  };
}
