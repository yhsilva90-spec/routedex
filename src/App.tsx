import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArchiveRestore, Check, ChevronDown, ChevronRight, CircleHelp, Download, Filter, Map as MapIcon,
  Medal, Moon, PackageCheck, PanelLeftClose, PanelLeftOpen, Route, Search, Settings2, ShieldCheck, Sparkles, Sun, Sunrise, Trophy, Upload,
} from 'lucide-react';
import { acquisitions, eliteFour, gymLeaders, locations, pokemon, pokemonById, postgame, sinnohPokemon, spriteUrl, tms } from './data';
import { createProgress, filterEncounters, getLocationProgress, parseProgress, serializeProgress, toggleCaptured, toggleChecklist, toggleLeagueChecklist } from './domain/progress';
import { getEncounterChanceLabels, getEncounterLevelLabels, groupEncountersByMethod } from './domain/encounters';
import { expandedRouteLayout, getBalancedRowSizes, getLocationGridColumns } from './domain/layout';
import { getDexToggleEncounter } from './domain/dex';
import type { Encounter, EncounterTime, GameVersion, LeagueMember, Location, ProgressState } from './domain/types';
import { getAcquisitionGroupLabel } from './domain/acquisitions';
import { getCompactLocationName, getLocationVisual, type LocationVisualKind } from './domain/locationVisuals';
import { getPokemonTypeTone } from './domain/typeVisuals';
import { loadStoredProgress, requestPersistentBrowserStorage, saveStoredProgress } from './domain/storage';
import { CaveIcon, CityIcon, ChecklistIcon, CompassIcon, DungeonIcon, FishingEncounterIcon, ForestIcon, GrassEncounterIcon, IslandIcon, JournalIcon, LeagueBadgeIcon, MapAtlasIcon, ParkIcon, PokedexIcon, RadarEncounterIcon, RoutePathIcon, SurfEncounterIcon, SwarmEncounterIcon, TmScrollIcon, WaterIcon } from './ui/icons';

type Tab = 'locations' | 'sinnoh' | 'national' | 'league' | 'postgame' | 'tms';
type VersionFilter = GameVersion | 'all';
type TimeFilter = EncounterTime | 'all';

const categories = [
  { key: 'route', label: 'Rotas', icon: RoutePathIcon },
  { key: 'area', label: 'Áreas', icon: MapAtlasIcon },
  { key: 'special', label: 'Especiais', icon: CompassIcon },
] as const;

function loadProgress(): ProgressState {
  try {
    return loadStoredProgress(window.localStorage);
  } catch {
    return createProgress();
  }
}

function App() {
  const [tab, setTab] = useState<Tab>('locations');
  const [progress, setProgress] = useState<ProgressState>(loadProgress);
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState<VersionFilter>('all');
  const [time, setTime] = useState<TimeFilter>('all');
  const [status, setStatus] = useState<'all' | 'open' | 'complete'>('all');
  const [expanded, setExpanded] = useState<string | null>(locations.find((item) => item.category === 'route')?.id ?? null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { saveStoredProgress(window.localStorage, progress); } catch { /* Exportar continua disponível se o navegador bloquear storage. */ }
  }, [progress]);
  useEffect(() => { void requestPersistentBrowserStorage(); }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [tab]);

  const capturedCount = Object.values(progress.capturedPokemon).filter(Boolean).length;
  const sinnohCaught = sinnohPokemon.filter((item) => progress.capturedPokemon[item.id]).length;
  const postgameDone = Object.values(progress.postgameCompleted).filter(Boolean).length;
  const tmDone = Object.values(progress.collectedTMs).filter(Boolean).length;
  const gymDone = Object.values(progress.gymLeadersCompleted).filter(Boolean).length;
  const eliteFourDone = Object.values(progress.eliteFourCompleted).filter(Boolean).length;

  const toggleEncounter = (encounter: Encounter) => setProgress((current) => toggleCaptured(current, encounter));
  const toggleTask = (key: 'postgameCompleted' | 'collectedTMs', id: number) => setProgress((current) => toggleChecklist(current, key, id));
  const toggleLeagueTask = (member: LeagueMember) => setProgress((current) => toggleLeagueChecklist(current, member.kind === 'gym' ? 'gymLeadersCompleted' : 'eliteFourCompleted', member.id));

  const downloadBackup = () => {
    const blob = new Blob([serializeProgress(progress)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'routedex-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { setProgress(parseProgress(String(reader.result))); } catch { window.alert('Não foi possível importar este backup.'); }
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><JournalIcon size={22} /></div>
          <div><div className="brand-name">RouteDex</div><div className="brand-subtitle">Caderneta de Sinnoh</div></div>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" onClick={downloadBackup}><Download size={16} /> Exportar</button>
          <button className="ghost-button" onClick={() => importRef.current?.click()}><Upload size={16} /> Importar</button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={importBackup} />
        </div>
      </header>

      <div className="workspace">
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
          <button data-testid="sidebar-toggle" className="sidebar-toggle" type="button" aria-expanded={!sidebarCollapsed} aria-controls="primary-navigation" title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'} onClick={() => setSidebarCollapsed((value) => !value)}>{sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}<span>{sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}</span></button>
          <div className="sidebar-label">Seu progresso</div>
          <div className="progress-hero"><div className="progress-hero-number">{capturedCount}<span>/493</span></div><div className="progress-bar"><span style={{ width: `${Math.round((capturedCount / 493) * 100)}%` }} /></div><div className="progress-hero-caption">Pokémon capturados</div></div>
          <nav className="nav-list" id="primary-navigation" aria-label="Navegação principal">
            <NavButton active={tab === 'locations'} onClick={() => setTab('locations')} icon={<RoutePathIcon size={17} />} label="Localizações" badge={`${locations.length}`} />
            <NavButton active={tab === 'sinnoh'} onClick={() => setTab('sinnoh')} icon={<PokedexIcon size={17} />} label="Sinnoh Dex" badge={`${sinnohCaught}/151`} />
            <NavButton active={tab === 'national'} onClick={() => setTab('national')} icon={<PokedexIcon size={17} />} label="National Dex" badge={`${capturedCount}/493`} />
            <NavButton active={tab === 'league'} onClick={() => setTab('league')} icon={<LeagueBadgeIcon size={17} />} label="Ginásios" badge={`${gymDone + eliteFourDone}/12`} />
            <NavButton active={tab === 'postgame'} onClick={() => setTab('postgame')} icon={<ChecklistIcon size={17} />} label="Pós-jogo" badge={`${postgameDone}/${postgame.length}`} />
            <NavButton active={tab === 'tms'} onClick={() => setTab('tms')} icon={<TmScrollIcon size={17} />} label="TM Locations" badge={`${tmDone}/${tms.length}`} />
          </nav>
          <div className="sidebar-note"><Settings2 size={15} /><span>Progresso salvo<br />neste navegador</span></div>
        </aside>

        <main className="main-content">
          <div className="page-intro">
            <div><div className="eyebrow">{tab === 'locations' ? 'GUIA DE CAMPO DE SINNOH' : 'CADERNETA DE PROGRESSO'}</div><h1>{tabTitle(tab)}</h1><p>{tabDescription(tab)}</p></div>
            <div className="summary-pills"><SummaryPill label="Sinnoh" value={`${sinnohCaught}/151`} /><SummaryPill label="Liga" value={`${gymDone + eliteFourDone}/12`} /><SummaryPill label="Pós-jogo" value={`${postgameDone}/${postgame.length}`} /><SummaryPill label="TMs" value={`${tmDone}/${tms.length}`} /></div>
          </div>
          {tab === 'locations' && <LocationsView {...{ query, setQuery, version, setVersion, time, setTime, status, setStatus, expanded, setExpanded, progress, toggleEncounter }} />}
          {tab === 'sinnoh' && <DexView items={sinnohPokemon} progress={progress} onToggle={toggleEncounter} title="Sinnoh" />}
          {tab === 'national' && <DexView items={pokemon} progress={progress} onToggle={toggleEncounter} title="National" />}
          {tab === 'league' && <LeagueView progress={progress} onToggle={toggleLeagueTask} />}
          {tab === 'postgame' && <ChecklistView items={postgame} state={progress.postgameCompleted} onToggle={(id) => toggleTask('postgameCompleted', id)} />}
          {tab === 'tms' && <TMView state={progress.collectedTMs} onToggle={(id) => toggleTask('collectedTMs', id)} />}
        </main>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge: string }) {
  return <button data-testid={`nav-${label.toLowerCase().replace(/ /g, '-')}`} className={`nav-item ${active ? 'active' : ''}`} title={label} aria-label={label} onClick={onClick}>{icon}<span>{label}</span><small>{badge}</small></button>;
}

function SummaryPill({ label, value }: { label: string; value: string }) { return <div className="summary-pill"><span>{label}</span><strong>{value}</strong></div>; }

function LocationsView(props: { query: string; setQuery: (value: string) => void; version: VersionFilter; setVersion: (value: VersionFilter) => void; time: TimeFilter; setTime: (value: TimeFilter) => void; status: 'all' | 'open' | 'complete'; setStatus: (value: 'all' | 'open' | 'complete') => void; expanded: string | null; setExpanded: (value: string | null) => void; progress: ProgressState; toggleEncounter: (encounter: Encounter) => void }) {
  const { query, setQuery, version, setVersion, time, setTime, status, setStatus, expanded, setExpanded, progress, toggleEncounter } = props;
  const [closing, setClosing] = useState<string | null>(null);
  const [locationColumns, setLocationColumns] = useState(() => getLocationGridColumns(window.innerWidth));
  useEffect(() => {
    const handleResize = () => setLocationColumns(getLocationGridColumns(window.innerWidth));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    if (!expanded || window.innerWidth > 600) return;
    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-testid="location-card-${expanded}-expanded"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [expanded]);
  const toggleLocation = (locationId: string) => {
    if (expanded === locationId) {
      setClosing(locationId);
      setExpanded(null);
      window.setTimeout(() => setClosing((current) => current === locationId ? null : current), 280);
      return;
    }
    setClosing(null);
    setExpanded(locationId);
  };
  const normalizedQuery = query.trim().toLowerCase();
  const visibleLocations = locations.filter((location) => {
    const progressInfo = getLocationProgress(location, progress);
    const locationMatches = !normalizedQuery || location.name.toLowerCase().includes(normalizedQuery) || location.encounters.some((item) => pokemonById.get(item.pokemonId)?.name.toLowerCase().includes(normalizedQuery));
    const statusMatches = status === 'all' || (status === 'complete' ? progressInfo.percent === 100 : progressInfo.percent < 100);
    return locationMatches && statusMatches;
  });
  return <>
    <div className="toolbar"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar Pokémon ou localização..." /></label><div className="toolbar-label"><Filter size={15} /> Filtros</div><FilterSelect label="Versão" value={version} onChange={(value) => setVersion(value as VersionFilter)} options={[['all', 'BD + SP'], ['BD', 'Brilliant Diamond'], ['SP', 'Shining Pearl']]} /><FilterSelect label="Horário" value={time} onChange={(value) => setTime(value as TimeFilter)} options={[['all', 'Qualquer horário'], ['morning', 'Manhã'], ['day', 'Dia'], ['night', 'Noite'], ['unknown', 'Não confirmado']]} /><FilterSelect label="Status" value={status} onChange={(value) => setStatus(value as typeof status)} options={[['all', 'Todos'], ['open', 'Em aberto'], ['complete', 'Completos']]} /></div>
    <div className="location-count">{visibleLocations.length} localidades · checks compartilhados globalmente</div><div className="time-legend"><span><Sunrise size={13} /> manhã</span><span><Sun size={13} /> dia</span><span><Moon size={13} /> noite</span><span><CircleHelp size={13} /> não confirmado</span></div>
    {categories.map(({ key, label, icon: Icon }) => {
      const group = visibleLocations.filter((location) => location.category === key);
      if (!group.length) return null;
      const rows = Array.from({ length: Math.ceil(group.length / locationColumns) }, (_, index) => group.slice(index * locationColumns, index * locationColumns + locationColumns));
      return <section className="location-section" key={key}><div className="section-heading"><div><Icon size={17} /><h2>{label}</h2></div><span>{group.length}</span></div><div className="location-grid">{rows.map((row, rowIndex) => { const expandedLocation = row.find((location) => location.id === expanded) ?? (closing ? row.find((location) => location.id === closing) : undefined); return <div className={`location-row-group ${expandedLocation ? 'has-expanded-panel' : ''}`} style={{ gap: `${expandedRouteLayout.panelGapPx}px` }} key={`${key}-${rowIndex}`}><div className={`location-row ${row.length === 1 ? 'single-location-row' : ''}`}>{row.map((location) => <LocationCard key={location.id} location={location} progress={progress} version={version} time={time} query={normalizedQuery} selected={expanded === location.id || closing === location.id} onToggleOpen={() => toggleLocation(location.id)} onToggle={toggleEncounter} />)}</div>{expandedLocation && <LocationCard key={`${expandedLocation.id}-expanded`} location={expandedLocation} progress={progress} version={version} time={time} query={normalizedQuery} selected expandedPanel closing={closing === expandedLocation.id} onToggleOpen={() => toggleLocation(expandedLocation.id)} onToggle={toggleEncounter} />}</div>; })}</div></section>;
    })}
  </>;
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) { return <label data-testid={`filter-${label.toLowerCase()}`} className="filter-select"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([option, text]) => <option value={option} key={option}>{text}</option>)}</select></label>; }

function LocationCard({ location, progress, version, time, query, selected = false, expandedPanel = false, closing = false, onToggleOpen, onToggle }: { location: Location; progress: ProgressState; version: VersionFilter; time: TimeFilter; query: string; selected?: boolean; expandedPanel?: boolean; closing?: boolean; onToggleOpen: () => void; onToggle: (encounter: Encounter) => void }) {
  const locationProgress = getLocationProgress(location, progress);
  const locationVisual = getLocationVisual(location);
  const merged = mergeEncounters(location.encounters);
  const filtered = filterEncounters(merged, { version, time }).filter((item) => !query || pokemonById.get(item.pokemonId)?.name.toLowerCase().includes(query) || location.name.toLowerCase().includes(query));
  const methodGroups = groupEncountersByMethod(filtered);
  const locationNumber = location.name.match(/\d+/)?.[0] ?? locationVisual.label.toUpperCase();
  const displayName = getCompactLocationName(location.name);
  return <article data-testid={`location-card-${location.id}${expandedPanel ? '-expanded' : ''}`} className={`location-card ${selected ? 'selected' : ''} ${expandedPanel ? 'expanded-panel' : ''} ${closing ? 'closing' : ''}`}>{!expandedPanel && <button data-testid={`location-header-${location.id}`} className="location-header" onClick={onToggleOpen}><span className="location-watermark" aria-hidden="true">{locationNumber}</span><div className={`location-icon location-icon-${locationVisual.kind}`}>{locationIconForKind(locationVisual.kind)}</div><div className="location-title"><strong title={location.name}>{displayName}</strong><span className="location-context"><span>{locationVisual.label}</span> · {locationProgress.captured}/{locationProgress.total} capturados</span></div><div className="location-progress"><span style={{ width: `${locationProgress.percent}%` }} /></div>{selected && <span className="location-open-label">Aberta</span>}{selected ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>}{expandedPanel && <div className="encounter-list" style={{ paddingTop: `${expandedRouteLayout.panelTopPaddingPx}px` }}><div className="method-group-grid" style={{ alignItems: expandedRouteLayout.methodGroupAlign, gridAutoRows: `minmax(${expandedRouteLayout.methodGroupMinHeightPx}px, auto)` }}>{methodGroups.length ? methodGroups.map((group) => { const rowSizes = getBalancedRowSizes(group.encounters.length); let cursor = 0; const rows = rowSizes.map((size) => { const row = group.encounters.slice(cursor, cursor + size); cursor += size; return row; }); const groupCaptured = group.encounters.filter((encounter) => progress.capturedPokemon[encounter.pokemonId]).length; return <section className={`method-group method-group-${Math.min(3, group.encounters.length)} ${group.encounters.length >= 3 ? 'method-group-wide' : 'method-group-compact'}`} key={group.key}><h3><span className="method-heading-label">{methodIconForLabel(group.label)}{group.label}</span><span className="method-group-progress">{groupCaptured}/{group.encounters.length}</span></h3>{rows.map((row, rowIndex) => <div className={`encounter-packed-row row-${row.length}`} key={`${group.key}-row-${rowIndex}`}>{row.map((encounter) => <EncounterRow key={encounter.id} encounter={encounter} progress={progress} time={time} onToggle={onToggle} />)}</div>)}</section>; }) : <div className="empty-state">Nenhum encontro corresponde aos filtros.</div>}</div></div>}</article>;
}

function mergeEncounters(items: Encounter[]): Encounter[] {
  const byPokemon = new Map<number, Encounter>();
  items.forEach((item) => {
    const existing = byPokemon.get(item.pokemonId);
    if (!existing) { byPokemon.set(item.pokemonId, { ...item, times: [...item.times], versions: [...item.versions] }); return; }
    byPokemon.set(item.pokemonId, { ...existing, id: `${existing.locationId}-${existing.pokemonId}`, method: [existing.method, item.method].filter(Boolean).filter((value, index, array) => array.indexOf(value) === index).join(' · ') || undefined, condition: [existing.condition, item.condition].filter(Boolean).filter((value, index, array) => array.indexOf(value) === index).join(' · ') || undefined, times: [...new Set([...existing.times, ...item.times])], versions: [...new Set([...existing.versions, ...item.versions])], details: [...(existing.details ?? []), ...(item.details ?? [])] });
  });
  return [...byPokemon.values()];
}

function EncounterRow({ encounter, progress, time, onToggle, groupLabel }: { encounter: Encounter; progress: ProgressState; time: TimeFilter; onToggle: (encounter: Encounter) => void; groupLabel?: string }) {
  const item = pokemonById.get(encounter.pokemonId);
  if (!item) return null;
  const captured = Boolean(progress.capturedPokemon[item.id]);
  const chanceLabels = time !== 'all' ? getEncounterChanceLabels(encounter, time) : [];
  const levelLabels = getEncounterLevelLabels(encounter);
  return <div className={`encounter-row ${captured ? 'captured' : ''} ${groupLabel ? 'group-start' : ''}`} role="button" tabIndex={0} aria-pressed={captured} aria-label={`${captured ? 'Desmarcar' : 'Marcar'} ${item.name} como capturado`} onClick={() => onToggle(encounter)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onToggle(encounter); } }}><div className="encounter-group-marker">{groupLabel}</div><img src={spriteUrl(item.id)} alt="" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} /><div className="encounter-main"><div className="encounter-name"><span className="dex-number">#{String(item.id).padStart(3, '0')}</span><strong>{item.name}</strong>{item.types.map((type) => <span className={`type-chip type-${getPokemonTypeTone(type)}`} key={type}>{type}</span>)}</div><div className="encounter-meta"><div className="meta-primary">{encounter.versions.map((value) => <span className="version-chip" key={value}>{value}</span>)}<TimeIcons times={encounter.times} selected={time} />{chanceLabels.map((label) => <span className="chance-chip" key={label}>{label}</span>)}{levelLabels.map((label) => <span key={label}>{label}</span>)}</div></div></div><label className="capture-check" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={captured} onChange={() => onToggle(encounter)} /><span>{captured ? <PokeballIcon /> : <Check size={15} />}</span><em>{captured ? 'Capturado' : 'Capturar'}</em></label></div>;
}

function PokeballIcon() { return <svg className="pokeball-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3.5 12h6M14.5 12h6" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>; }

function TimeIcons({ times, selected }: { times: EncounterTime[]; selected: TimeFilter }) { return <span className="time-icons" title={times.includes('unknown') ? 'Horário não confirmado' : undefined}>{times.map((time) => <span className={selected !== 'all' && selected !== time ? 'time-muted' : ''} key={time}>{time === 'morning' ? <Sunrise size={15} aria-label="Manhã" /> : time === 'day' ? <Sun size={15} aria-label="Dia" /> : time === 'night' ? <Moon size={15} aria-label="Noite" /> : <CircleHelp size={15} aria-label="Horário não confirmado" />}</span>)}</span>; }

function DexView({ items, progress, onToggle, title }: { items: typeof pokemon; progress: ProgressState; onToggle: (encounter: Encounter) => void; title: string }) {
  const [query, setQuery] = useState('');
  const filtered = items.filter((item) => !query || item.name.toLowerCase().includes(query.toLowerCase()) || String(item.id) === query);
  return <div className="dex-view"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar na ${title}...`} /></label><div className="dex-grid">{filtered.map((item) => { const encounter = getDexToggleEncounter(item.id, title, firstEncounter(item.id)); const captured = Boolean(progress.capturedPokemon[item.id]); const itemAcquisitions = acquisitions.filter((acquisition) => acquisition.pokemonId === item.id); const toggle = () => onToggle(encounter); return <div className={`dex-card ${captured ? 'captured' : ''}`} key={item.id} role="button" tabIndex={0} aria-pressed={captured} aria-label={`${captured ? 'Desmarcar' : 'Marcar'} ${item.name} como capturado`} onClick={toggle} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } }}><img src={spriteUrl(item.id)} alt="" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} /><div className="dex-main"><div className="dex-name"><span className="dex-number">#{String(item.sinnohNumber ?? item.id).padStart(3, '0')}</span><strong>{item.name}</strong>{item.types.map((type) => <span className={`type-chip type-${getPokemonTypeTone(type)}`} key={type}>{type}</span>)}</div>{itemAcquisitions.length > 0 && <div className="dex-acquisitions">{itemAcquisitions.map((acquisition) => <span key={acquisition.id}>{getAcquisitionGroupLabel(acquisition.group)}: {acquisition.label}</span>)}</div>}</div><label className="dex-capture-check" onClick={(event) => event.stopPropagation()}><input aria-label={`Marcar ${item.name} como capturado`} type="checkbox" checked={captured} onChange={toggle} /><span>{captured ? <PokeballIcon /> : <Check size={15} />}</span><em>{captured ? 'Capturado' : 'Capturar'}</em></label></div>; })}</div></div>;
}

function firstEncounter(pokemonId: number) { return locations.flatMap((location) => location.encounters).find((encounter) => encounter.pokemonId === pokemonId); }

function ChecklistView({ items, state, onToggle }: { items: { id: number; title: string }[]; state: Record<number, boolean>; onToggle: (id: number) => void }) { return <div className="task-list">{items.map((item) => <label className={`task-row ${state[item.id] ? 'done' : ''}`} key={item.id}><input type="checkbox" checked={Boolean(state[item.id])} onChange={() => onToggle(item.id)} /><span className="task-check"><Check size={15} /></span><span className="task-index">{String(item.id).padStart(2, '0')}</span><span>{item.title}</span></label>)}</div>; }

function TMView({ state, onToggle }: { state: Record<number, boolean>; onToggle: (id: number) => void }) { return <div className="tm-list">{tms.map((item) => <label className={`tm-row ${state[item.id] ? 'done' : ''}`} key={item.id}><input type="checkbox" checked={Boolean(state[item.id])} onChange={() => onToggle(item.id)} /><span className="task-check"><Check size={15} /></span><span className="tm-number">TM{String(item.id).padStart(2, '0')}</span><strong>{item.name}</strong><span className="tm-location">{item.location}</span></label>)}</div>; }

function LeagueView({ progress, onToggle }: { progress: ProgressState; onToggle: (member: LeagueMember) => void }) {
  const gymDone = gymLeaders.filter((member) => progress.gymLeadersCompleted[member.id]).length;
  const eliteDone = eliteFour.filter((member) => progress.eliteFourCompleted[member.id]).length;
  return <div className="league-view"><div className="league-overview"><div className="league-overview-copy"><span className="league-overview-label">PROGRESSO DA LIGA</span><strong>{gymDone + eliteDone}/12 batalhas registradas</strong><div className="league-overview-bar"><span style={{ width: `${Math.round(((gymDone + eliteDone) / 12) * 100)}%` }} /></div></div><BadgeShelf state={progress.gymLeadersCompleted} /></div><LeagueSection title="Líderes de Ginásio" icon={<LeagueBadgeIcon size={17} />} count={`${gymDone}/8`} items={gymLeaders} state={progress.gymLeadersCompleted} onToggle={onToggle} /><LeagueSection title="Elite Four" icon={<Trophy size={17} />} count={`${eliteDone}/4`} items={eliteFour} state={progress.eliteFourCompleted} onToggle={onToggle} /></div>;
}

function BadgeShelf({ state }: { state: Record<string, boolean> }) {
  return <div className="badge-shelf" aria-label="Coleção de insígnias de Sinnoh">{gymLeaders.map((member) => <div className={`badge-slot ${state[member.id] ? 'earned' : ''}`} key={member.id} title={`${member.badgeName}${state[member.id] ? ' · conquistada' : ''}`}><div className="badge-slot-art"><img src={member.badgeImage} alt="" /></div><span>{member.order}</span></div>)}</div>;
}

function methodIconForLabel(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes('radar')) return <RadarEncounterIcon size={15} />;
  if (normalized.includes('swarm')) return <SwarmEncounterIcon size={15} />;
  if (normalized.includes('surf')) return <SurfEncounterIcon size={15} />;
  if (normalized.includes('pesca') || normalized.includes('rod')) return <FishingEncounterIcon size={15} />;
  return <GrassEncounterIcon size={15} />;
}

function locationIconForKind(kind: LocationVisualKind) {
  if (kind === 'route') return <RoutePathIcon size={18} />;
  if (kind === 'cave') return <CaveIcon size={18} />;
  if (kind === 'dungeon') return <DungeonIcon size={18} />;
  if (kind === 'city') return <CityIcon size={18} />;
  if (kind === 'forest') return <ForestIcon size={18} />;
  if (kind === 'water') return <WaterIcon size={18} />;
  if (kind === 'island') return <IslandIcon size={18} />;
  if (kind === 'park') return <ParkIcon size={18} />;
  return <CompassIcon size={18} />;
}

function LeagueSection({ title, icon, count, items, state, onToggle }: { title: string; icon: React.ReactNode; count: string; items: LeagueMember[]; state: Record<string, boolean>; onToggle: (member: LeagueMember) => void }) {
  return <section className="league-section"><div className="section-heading"><div>{icon}<h2>{title}</h2></div><span>{count}</span></div><div className="league-grid">{items.map((member) => <LeagueCard key={member.id} member={member} checked={Boolean(state[member.id])} onToggle={() => onToggle(member)} />)}</div></section>;
}

function LeagueCard({ member, checked, onToggle }: { member: LeagueMember; checked: boolean; onToggle: () => void }) {
  const initials = member.name.split(' ').map((part) => part[0]).join('').slice(0, 2);
  const toggle = () => onToggle();
  return <article className={`league-card ${checked ? 'done' : ''}`} role="button" tabIndex={0} aria-pressed={checked} aria-label={`${checked ? 'Desmarcar' : 'Marcar'} batalha contra ${member.name}`} onClick={toggle} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } }}><div className="league-card-heading"><span>{member.kind === 'gym' ? `Ginásio ${member.order}` : `Elite ${member.order}`}</span><span className="league-specialty">{member.specialty}</span></div><div className="league-card-body"><div className="league-portrait"><span>{initials}</span><img src={member.leaderImage} alt={`Arte de ${member.name}`} onError={(event) => { event.currentTarget.style.display = 'none'; }} /></div><div className="league-copy"><strong>{member.name}</strong>{member.city && <span>{member.city}</span>}{member.badgeName && <small>{member.badgeName}</small>}</div>{member.badgeImage && <div className="league-badge"><img src={member.badgeImage} alt={member.badgeName ?? 'Insígnia'} onError={(event) => { event.currentTarget.style.display = 'none'; }} /><span>Insígnia</span></div>}<label className="league-check" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={checked} onChange={toggle} /><span>{checked ? <PokeballIcon /> : <Check size={15} />}</span><em>{checked ? 'Batalhado' : 'Marcar'}</em></label></div></article>;
}

function tabTitle(tab: Tab) { return ({ locations: 'Localizações', sinnoh: 'Sinnoh Dex', national: 'National Dex', league: 'Ginásios e Elite Four', postgame: 'Checklist pós-jogo', tms: 'Localizações de TMs' })[tab]; }
function tabDescription(tab: Tab) { return ({ locations: 'Capture por rota, área e método. O check de cada Pokémon é compartilhado em todo o mapa.', sinnoh: 'Acompanhe os 151 Pokémon necessários para completar a Pokédex de Sinnoh.', national: 'Sua coleção completa, com sprites e estado global de captura.', league: 'Registre cada batalha contra os líderes de ginásio e a Elite Four de Sinnoh.', postgame: 'Tarefas importantes para continuar depois da Liga Pokémon.', tms: 'Registre as Technical Machines coletadas e onde encontrá-las.' })[tab]; }

export default App;
