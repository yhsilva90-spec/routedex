type IconProps = { size?: number; className?: string };

function Icon({ size = 18, className, children }: IconProps & { children: React.ReactNode }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

export function JournalIcon(props: IconProps) { return <Icon {...props}><path d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7.5A2.5 2.5 0 0 1 5 17V4.5Z" /><path d="M5 7.5h2.5A1.5 1.5 0 0 1 9 9v10.5M9 6h6M12 9h4M12 12h4" /><path d="M19 10.5h-2" /></Icon>; }

export function RoutePathIcon(props: IconProps) { return <Icon {...props}><path d="M4.5 5.5h4.2a2.3 2.3 0 0 1 2.3 2.3v1.4a2.3 2.3 0 0 0 2.3 2.3h2a2.3 2.3 0 0 1 2.3 2.3v.4a2.3 2.3 0 0 0 2.3 2.3h.8" /><circle cx="4.5" cy="5.5" r="1.8" /><circle cx="19.5" cy="16.5" r="1.8" /><path d="M11 9.2 9.2 11 11 12.8" /></Icon>; }

export function MapAtlasIcon(props: IconProps) { return <Icon {...props}><path d="m4 5 5-2 6 2 5-2v16l-5 2-6-2-5 2V5Z" /><path d="M9 3v16M15 5v16" /></Icon>; }

export function CompassIcon(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="8.5" /><path d="m15.7 8.3-2 5.4-5.4 2 2-5.4 5.4-2Z" /><circle cx="12" cy="12" r=".8" fill="currentColor" stroke="none" /></Icon>; }

export function PokedexIcon(props: IconProps) { return <Icon {...props}><rect x="5" y="3.5" width="14" height="17" rx="2.2" /><path d="M8.5 7h7M8.5 10.5h7M8.5 14h3.5" /><circle cx="15.5" cy="16.5" r="1.5" /><path d="M3 7.5h2M3 12h2M3 16.5h2" /></Icon>; }

export function LeagueBadgeIcon(props: IconProps) { return <Icon {...props}><path d="m12 3 2.2 4.2 4.7.7-3.4 3.3.8 4.7-4.3-2.2-4.3 2.2.8-4.7-3.4-3.3 4.7-.7L12 3Z" /><path d="M8.5 16.5 7 21l5-2 5 2-1.5-4.5" /></Icon>; }

export function ChecklistIcon(props: IconProps) { return <Icon {...props}><rect x="5" y="4" width="14" height="16" rx="2" /><path d="m8 8 1.2 1.2L11.5 7M13.5 8H16M8 13l1.2 1.2 2.3-2.2M13.5 13H16M8 17h8" /></Icon>; }

export function TmScrollIcon(props: IconProps) { return <Icon {...props}><path d="M7 4h10a2 2 0 0 1 0 4H8a3 3 0 0 0 0 6h8a2 2 0 0 1 0 4H6" /><path d="M8 4v4M16 16v2M6 20v-2" /><circle cx="7" cy="16" r="2" /></Icon>; }

export function GrassEncounterIcon(props: IconProps) { return <Icon {...props}><path d="M5 20c1.8-4.6 4.2-7.3 7-8.2M12 20V7M12 13c-1.8-2.6-3.7-3.7-5.7-3.5.2 2.3 1.7 4 5.7 4M12 10c1.5-3 3.2-4.2 5.8-4.3-.1 2.8-1.8 4.7-5.8 5.2M4 20h16" /></Icon>; }

export function SurfEncounterIcon(props: IconProps) { return <Icon {...props}><path d="M3 15c2.2 0 2.2-2 4.5-2s2.3 2 4.5 2 2.3-2 4.5-2 2.3 2 4.5 2" /><path d="M3 19c2.2 0 2.2-2 4.5-2s2.3 2 4.5 2 2.3-2 4.5-2 2.3 2 4.5 2" /><path d="M12 4v6M9 7l3-3 3 3" /></Icon>; }

export function FishingEncounterIcon(props: IconProps) { return <Icon {...props}><path d="M5 4v12a4 4 0 0 0 8 0" /><path d="M5 8h6M13 16h5" /><circle cx="19" cy="16" r="1.8" /><path d="M5 4h3" /></Icon>; }

export function RadarEncounterIcon(props: IconProps) { return <Icon {...props}><circle cx="12" cy="12" r="7.5" /><path d="M12 12 17.5 8.5M12 4.5v1.5M4.5 12H6M12 18v1.5" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /></Icon>; }

export function SwarmEncounterIcon(props: IconProps) { return <Icon {...props}><circle cx="8" cy="9" r="2" /><circle cx="15.5" cy="8" r="2" /><circle cx="12" cy="15" r="2" /><path d="M4.5 18c.5-2.5 2-4 3.5-4s3 1.5 3.5 4M12 18c.5-2.5 2-4 3.5-4s3 1.5 3.5 4" /></Icon>; }

export function CaveIcon(props: IconProps) { return <Icon {...props}><path d="M3.5 19.5h17M5 19.5V14l3-3 2 1.5L13 7l2.5 3 1.5-1 2 3.5v7" /><path d="M10 19.5v-4h4v4" /><path d="M3.5 14 6 8l3-3 3 2M15 7l3-2 2.5 4" /></Icon>; }

export function DungeonIcon(props: IconProps) { return <Icon {...props}><path d="M4 20h16M6 20V7l6-4 6 4v13" /><path d="M9 20v-5a3 3 0 0 1 6 0v5M9 9h.01M15 9h.01M12 7v2" /></Icon>; }

export function CityIcon(props: IconProps) { return <Icon {...props}><path d="M4 20V9l5-3v14M9 20V4l6 3v13M15 20v-8l5-2v10" /><path d="M6.5 12h.01M6.5 15h.01M11 8h.01M11 11h.01M11 14h.01M17.5 14h.01M17.5 17h.01" /></Icon>; }

export function ForestIcon(props: IconProps) { return <Icon {...props}><path d="M12 20V8M8 20h8M12 4 8.5 10h2L7 15h3l-2 3h8l-2-3h3l-3.5-5h2L12 4Z" /><path d="m5 14-2-3M19 14l2-3" /></Icon>; }

export function WaterIcon(props: IconProps) { return <Icon {...props}><path d="M3 9c2.2 0 2.2-2 4.5-2S9.8 9 12 9s2.3-2 4.5-2S18.8 9 21 9M3 14c2.2 0 2.2-2 4.5-2S9.8 14 12 14s2.3-2 4.5-2 2.3 2 4.5 2M3 19c2.2 0 2.2-2 4.5-2S9.8 19 12 19s2.3-2 4.5-2 2.3 2 4.5 2" /></Icon>; }

export function IslandIcon(props: IconProps) { return <Icon {...props}><path d="M4 18c3-2 5-2 8 0s5 2 8 0" /><path d="M12 17V7M12 9 8.5 6.5M12 10l3.5-3M8 19c2-2 6-2 8 0" /></Icon>; }

export function ParkIcon(props: IconProps) { return <Icon {...props}><path d="M12 20V9M9 20h6M12 5c-2.2 0-4 1.5-4 3.5S9.8 12 12 12s4-1.5 4-3.5S14.2 5 12 5Z" /><path d="M7.5 15.5C5 15.5 4 14 4 12.5c0-1.3 1-2.5 2.5-2.5M16.5 15.5c2.5 0 3.5-1.5 3.5-3 0-1.3-1-2.5-2.5-2.5" /></Icon>; }
