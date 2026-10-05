import { useMemo, useState, type FormEvent } from "react";
import {
  AlarmClock,
  AlertTriangle,
  ArrowRightToLine,
  BarChart3,
  Camera,
  BellRing,
  Check,
  ChevronDown,
  ClipboardList,
  Clock3,
  CircleX,
  FileText,
  MapPin,
  Mic,
  Mountain,
  Navigation2,
  PackageOpen,
  Plus,
  Search,
  ShieldAlert,
  Moon,
  Sun,
  Sparkles,
  Users,
  Wrench,
  Waves,
  ZoomIn,
  ZoomOut,
  Hammer,
  Truck,
  Zap,
  X,
} from "lucide-react";

type AlertItem = {
  id: string;
  title: string;
  location: string;
  time: string;
  severity: "critical" | "elevated" | "moderate";
};

const navItems = [
  { label: "Map", Icon: MapPin, nodeId: "2:13", routeNodeId: "2:551" },
  { label: "Report", Icon: ClipboardList, nodeId: "2:17", routeNodeId: "2:555" },
  { label: "Alerts", Icon: BellRing, nodeId: "2:21", routeNodeId: "2:559" },
  { label: "Routes", Icon: ArrowRightToLine, nodeId: "2:25", routeNodeId: "2:563" },
  { label: "Areas", Icon: BarChart3, nodeId: "2:29", routeNodeId: "2:567" },
  { label: "People", Icon: Users, nodeId: "2:33", routeNodeId: "2:571" },
  { label: "Incidents", Icon: ShieldAlert, nodeId: "2:37", routeNodeId: "2:575" },
  { label: "Dashboard", Icon: BarChart3, nodeId: "2:41", routeNodeId: "2:579" },
];

const layers = [
  { label: "Falling Objects", nodeId: "2:74" },
  { label: "Near Misses", nodeId: "2:77" },
  { label: "Open Actions", nodeId: "2:79" },
  { label: "Inspections", nodeId: "2:81" },
  { label: "Active Work Fronts", nodeId: "2:83" },
];

const alerts: AlertItem[] = [
  {
    id: "2:139",
    title: "Debris hazard on Shiploader 2 boom",
    location: "Shiploader 2",
    time: "4 min ago",
    severity: "critical",
  },
  {
    id: "2:149",
    title: "Damaged toe-board observed",
    location: "Conveyor CV104",
    time: "12 min ago",
    severity: "elevated",
  },
  {
    id: "2:159",
    title: "Loose bracket identified during inspection",
    location: "Transfer Tower 3",
    time: "1 hr ago",
    severity: "moderate",
  },
  {
    id: "38:28",
    title: "Wear detected on conveyor belt rollers",
    location: "Conveyor CV203",
    time: "2 hrs ago",
    severity: "critical",
  },
  {
    id: "38:39",
    title: "Hydraulic leak found near crane base",
    location: "Crane 5",
    time: "3 hrs ago",
    severity: "elevated",
  },
];

const metrics = [
  { value: "12", label: "Active Hazards", color: "#f97316", nodeId: "2:122" },
  { value: "34", label: "Open Actions", color: "#eab308", nodeId: "2:125" },
  { value: "3", label: "High-Risk Zones", color: "#ef4444", nodeId: "2:128" },
  { value: "247", label: "Workforce On-Site", color: "#22c55e", nodeId: "2:131" },
];

const destinations = [
  "Control Room",
  "Operations Centre",
  "Mechanical Workshop",
  "Electrical Workshop",
  "Heavy Vehicle Workshop",
  "Shiploader 1",
  "Shiploader 2",
  "Shiploader 3",
  "Stockyard",
  "Rail Loop",
  "Train Unloading Station",
  "Fuel Farm",
  "Medical Centre",
  "Main Gate",
] as const;

type Destination = (typeof destinations)[number];

const destinationInfo: Record<Destination, { distance: string; minutes: number; point: [number, number]; riskIndices: number[] }> = {
  "Control Room": { distance: "0.4 km", minutes: 3, point: [57, 23], riskIndices: [0, 2] },
  "Operations Centre": { distance: "0.6 km", minutes: 4, point: [68, 28], riskIndices: [0, 3] },
  "Mechanical Workshop": { distance: "0.8 km", minutes: 5, point: [41, 55], riskIndices: [0, 2, 6] },
  "Electrical Workshop": { distance: "0.9 km", minutes: 6, point: [33, 66], riskIndices: [2, 4] },
  "Heavy Vehicle Workshop": { distance: "1.4 km", minutes: 8, point: [22, 76], riskIndices: [3, 6] },
  "Shiploader 1": { distance: "1.5 km", minutes: 7, point: [79, 78], riskIndices: [0, 2, 3] },
  "Shiploader 2": { distance: "1.2 km", minutes: 6, point: [85, 60], riskIndices: [1, 4, 6] },
  "Shiploader 3": { distance: "1.8 km", minutes: 8, point: [82, 88], riskIndices: [1, 3, 5] },
  Stockyard: { distance: "1.1 km", minutes: 7, point: [68, 46], riskIndices: [1, 2, 6] },
  "Rail Loop": { distance: "2.3 km", minutes: 12, point: [18, 48], riskIndices: [3, 5] },
  "Train Unloading Station": { distance: "2.7 km", minutes: 14, point: [25, 36], riskIndices: [1, 3, 5] },
  "Fuel Farm": { distance: "1.6 km", minutes: 9, point: [74, 32], riskIndices: [0, 4] },
  "Medical Centre": { distance: "0.7 km", minutes: 5, point: [36, 20], riskIndices: [0, 2] },
  "Main Gate": { distance: "3.1 km", minutes: 16, point: [8, 86], riskIndices: [3, 5, 6] },
};

const routeOptions = [
  { id: "safest", label: "Safest", description: "Fewer hazards", color: "#22c55e", risk: "LOWEST RISK", distanceFactor: 1.08, timeFactor: 1.15 },
  { id: "balanced", label: "Balanced", description: "Recommended", color: "#f97316", risk: "RECOMMENDED", distanceFactor: 1, timeFactor: 1, recommended: true },
  { id: "fastest", label: "Fastest", description: "Higher risk", color: "#ef4444", risk: "HIGHER RISK", distanceFactor: 0.88, timeFactor: 0.78 },
] as const;

type RouteId = (typeof routeOptions)[number]["id"];

const routeRisks = [
  { name: "Unsecured equipment", detail: "Equipment is not properly secured in this work area.", severity: "High", Icon: Wrench, left: "23%", top: "31%" },
  { name: "Material spillage from conveyors", detail: "Loose material has spilled beside the conveyor route.", severity: "Moderate", Icon: PackageOpen, left: "73%", top: "48%" },
  { name: "Dropped tools from elevated work areas", detail: "Tools may fall from the elevated maintenance platform.", severity: "High", Icon: Hammer, left: "42%", top: "23%" },
  { name: "Haul truck collisions", detail: "Vehicle crossing with active haul truck traffic.", severity: "High", Icon: Truck, left: "61%", top: "69%" },
  { name: "High-voltage exposure", detail: "High-voltage infrastructure is active near this route.", severity: "Critical", Icon: Zap, left: "82%", top: "28%" },
  { name: "Flooding", detail: "Water accumulation may make this section unsafe to cross.", severity: "Moderate", Icon: Waves, left: "28%", top: "76%" },
  { name: "Ground subsidence", detail: "Ground settlement has been reported near this work zone.", severity: "High", Icon: Mountain, left: "49%", top: "54%" },
];

const awarenessWorkers = [
  { id: "john", name: "John Davis", role: "Rigger", team: "Maint", color: "#3b82f6", initials: "JD", avatar: "/safezone-worker-john.png", nodeId: "2:1184" },
  { id: "sarah", name: "Sarah Chen", role: "Area Inspector", team: "Port Ops", color: "#14b8a6", initials: "SC", avatar: "/safezone-worker-sarah.png", nodeId: "2:1195" },
  { id: "mark", name: "Mark Thorne", role: "Mechanical Fitter", team: "Maint", color: "#3b82f6", initials: "MT", avatar: "/safezone-worker-mark.png", nodeId: "2:1206" },
  { id: "alex", name: "Alex Rivera", role: "Signaller", team: "Rail", color: "#f97316", initials: "AR", avatar: "/safezone-worker-alex.png", nodeId: "2:1217" },
  { id: "james", name: "James Cole", role: "Welder", team: "Contractor", color: "#64748b", initials: "JC", avatar: "/safezone-worker-james.png", nodeId: "2:1228" },
];

const areaWorkerAssignments: Record<Destination, string[]> = {
  "Control Room": ["john", "sarah"],
  "Operations Centre": ["sarah", "mark", "james"],
  "Mechanical Workshop": ["mark", "john", "james"],
  "Electrical Workshop": ["john", "sarah"],
  "Heavy Vehicle Workshop": ["alex", "mark", "james"],
  "Shiploader 1": ["sarah", "john", "alex"],
  "Shiploader 2": ["john", "sarah", "mark"],
  "Shiploader 3": ["mark", "sarah", "james"],
  Stockyard: ["alex", "sarah", "john"],
  "Rail Loop": ["alex", "john", "james"],
  "Train Unloading Station": ["alex", "mark", "sarah"],
  "Fuel Farm": ["james", "john"],
  "Medical Centre": ["sarah", "mark"],
  "Main Gate": ["alex", "james", "john"],
};

type FeedStatus = "New" | "Investigating" | "In Progress" | "Controls Applied" | "Closed";
type FeedFilter = "All" | "New" | "Investigating" | "In Progress" | "Closed";
type FeedAlert = {
  id: string;
  title: string;
  location: string;
  minutesAgo: number;
  severity: "CRITICAL" | "ELEVATED" | "MODERATE";
  status: FeedStatus;
  person: string;
  role: string;
  avatar: string;
  description?: string;
  photo?: boolean;
};

const initialFeedAlerts: FeedAlert[] = [
  { id: "2:403", title: "Loose handrail component reported at Shiploader 2", location: "Shiploader 2 Main Deck", minutesAgo: 12, severity: "CRITICAL", status: "New", person: "Mark Thorne", role: "Mechanical Fitter", avatar: "/safezone-worker-mark.png", description: "Safety nets damaged below work area. Risk of drop to ground rail line. Exclusion barriers currently missing.", photo: true },
  { id: "2:434", title: "Corroded kickplate on high conveyor gallery", location: "Conveyor CV104 Transfer", minutesAgo: 34, severity: "ELEVATED", status: "Investigating", person: "Sarah Chen", role: "Area Inspector", avatar: "/safezone-worker-sarah.png" },
  { id: "2:456", title: "Unsecured hand tool left near structural platform", location: "Stacker ST102 Tier 3", minutesAgo: 60, severity: "MODERATE", status: "Controls Applied", person: "John Davis", role: "Rigger", avatar: "/safezone-worker-john.png" },
  { id: "2:478", title: "Damaged safety netting identified above rail loop", location: "Car Dumper 1 structure", minutesAgo: 120, severity: "ELEVATED", status: "New", person: "Sarah Chen", role: "Area Inspector", avatar: "/safezone-worker-sarah.png" },
  { id: "2:500", title: "Structural bolt loose on secondary boom tensioner", location: "Shiploader 1", minutesAgo: 240, severity: "CRITICAL", status: "Closed", person: "Mark Thorne", role: "Mechanical Fitter", avatar: "/safezone-worker-mark.png" },
  { id: "2:522", title: "Loose grid-mesh walkway panels identified", location: "Transfer Station 4", minutesAgo: 300, severity: "MODERATE", status: "Closed", person: "John Davis", role: "Rigger", avatar: "/safezone-worker-john.png" },
];

function AlertFeed() {
  const [filter, setFilter] = useState<FeedFilter>("All");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"Newest" | "Oldest">("Newest");
  const [feedAlerts, setFeedAlerts] = useState(initialFeedAlerts);
  const [notice, setNotice] = useState("");
  const filteredAlerts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return feedAlerts
      .filter((alert) => (filter === "All" || alert.status === filter) && `${alert.title} ${alert.location} ${alert.person} ${alert.role}`.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => sortOrder === "Newest" ? a.minutesAgo - b.minutesAgo : b.minutesAgo - a.minutesAgo);
  }, [feedAlerts, filter, query, sortOrder]);
  const setAlertStatus = (id: string, status: FeedStatus, message: string) => {
    setFeedAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, status } : alert));
    setNotice(message);
  };
  const formatAge = (minutesAgo: number) => minutesAgo < 60 ? `${minutesAgo} min ago` : `${Math.floor(minutesAgo / 60)} ${minutesAgo < 120 ? "hr" : "hrs"} ago`;

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-5 pt-5 max-[760px]:px-4" data-node-id="2:379">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3" data-node-id="2:381">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter alerts" data-node-id="2:382">
          {(["All", "New", "Investigating", "In Progress", "Closed"] as FeedFilter[]).map((tab, index) => <button key={tab} type="button" role="tab" aria-selected={filter === tab} onClick={() => setFilter(tab)} className={`h-[34px] rounded-full border border-[#2e2e4a] px-4 text-[13px] font-bold transition-colors ${filter === tab ? "bg-[#d71920] text-white" : "bg-[#161625] hover:bg-[#24243a]"}`} data-node-id={["2:383", "2:385", "2:387", "2:389", "2:391"][index]}>{tab}</button>)}
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <label className="flex h-8 w-[200px] min-w-[130px] items-center gap-2 rounded-lg border border-[#2e2e4a] bg-[#161625] px-3 text-slate-400 max-[600px]:flex-1" data-node-id="2:394"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter stream..." className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-400" aria-label="Filter alert stream" /></label>
          <label className="relative flex h-8 w-[119px] items-center rounded-lg border border-[#2e2e4a] bg-[#161625] px-3 text-xs font-bold" data-node-id="2:398"><span className="sr-only">Sort alerts</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as "Newest" | "Oldest")} className="h-full w-full appearance-none bg-transparent pr-4 text-xs font-bold text-white outline-none"><option value="Newest">Sort: Newest</option><option value="Oldest">Sort: Oldest</option></select><ChevronDown size={12} className="pointer-events-none absolute right-2" /></label>
        </div>
      </div>
      {notice && <div role="status" className="mb-3 flex shrink-0 items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-400">{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={14} /></button></div>}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto" data-node-id="2:402">
        {filteredAlerts.map((alert) => {
          const severityColor = alert.severity === "CRITICAL" ? "#ef4444" : alert.severity === "ELEVATED" ? "#f97316" : "#eab308";
          return <article key={alert.id} className="relative overflow-hidden rounded-xl border border-[#2e2e4a] bg-[#161625]" data-node-id={alert.id}>
            <span className="absolute inset-y-0 left-0 w-[5px]" style={{ backgroundColor: severityColor }} />
            <div className="pl-5 pr-4 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-[15px] font-bold leading-5">{alert.title}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400"><span className="flex items-center gap-1"><MapPin size={12} />{alert.location}</span><span className="text-slate-500">{formatAge(alert.minutesAgo)}</span></div>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2"><span className="rounded px-2 py-1 text-[10px] font-bold" style={{ color: severityColor, backgroundColor: `${severityColor}26` }}>{alert.severity}</span><span className="rounded border px-2 py-1 text-[10px] font-bold" style={{ color: alert.status === "New" ? "#ef4444" : alert.status === "Investigating" ? "#f97316" : alert.status === "Closed" ? "#22c55e" : alert.status === "Controls Applied" ? "#3b82f6" : "#eab308", borderColor: alert.status === "New" ? "#ef4444" : alert.status === "Investigating" ? "#f97316" : alert.status === "Closed" ? "#22c55e" : alert.status === "Controls Applied" ? "#3b82f6" : "#eab308", backgroundColor: `${alert.status === "New" ? "#ef4444" : alert.status === "Investigating" ? "#f97316" : alert.status === "Closed" ? "#22c55e" : alert.status === "Controls Applied" ? "#3b82f6" : "#eab308"}26` }}>{alert.status.toUpperCase()}</span></div>
              </div>
              <div className={`mt-3 flex items-center gap-2 text-xs font-bold text-slate-400 ${alert.photo ? "border-b border-[#2e2e4a] pb-3" : "pb-4"}`}><img src={alert.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />{alert.person} ({alert.role})</div>
            </div>
            {alert.photo && <div className="mx-4 mb-3 grid gap-4 border-t border-[#2e2e4a] pt-3 sm:grid-cols-[180px_minmax(0,1fr)]" data-node-id="2:425">
              <img src="/safezone-map.png" alt="Site image attached to the Shiploader 2 hazard report" className="h-[110px] w-full rounded-lg object-cover" data-node-id="2:426" />
              <div className="flex flex-col items-start justify-between gap-3"><p className="text-[13px] leading-[18px] text-slate-400">{alert.description}</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setAlertStatus(alert.id, "In Progress", "Response team dispatched to Shiploader 2.")} className="h-8 rounded-md bg-[#d71920] px-4 text-xs font-bold text-white hover:bg-red-700" data-node-id="2:430">Dispatch Response</button><button type="button" onClick={() => setAlertStatus(alert.id, "Investigating", "Alert marked as investigating.")} className="h-8 rounded-md border border-[#2e2e4a] bg-[#1e1e32] px-4 text-xs font-bold hover:bg-[#24243a]" data-node-id="2:432">Mark Investigating</button></div></div>
            </div>}
          </article>;
        })}
        {filteredAlerts.length === 0 && <div className="rounded-xl border border-[#2e2e4a] bg-[#161625] px-4 py-8 text-center text-sm text-slate-400">No alerts match this filter.</div>}
      </div>
    </main>
  );
}

const areaMetrics = [
  { label: "CURRENT RISK SCORE", value: "7.2", detail: "Critical Risk", risk: true },
  { label: "ACTIVE HAZARDS", value: "8", detail: "Unmitigated elements" },
  { label: "OPEN ACTIONS", value: "14", detail: "4 past due" },
  { label: "WORKFORCE COUNT", value: "32", detail: "On-site active" },
  { label: "LAST INSPECTION", value: "2 hrs ago", detail: "Sarah Chen (Inspector)" },
];

const inspectionRows = [
  { date: "24 Dec", inspector: "S. Chen", result: "PASS", findings: "0 findings" },
  { date: "20 Dec", inspector: "M. Thorne", result: "FAIL", findings: "3 findings" },
  { date: "15 Dec", inspector: "J. Davis", result: "PASS", findings: "1 findings" },
  { date: "10 Dec", inspector: "A. Inspector", result: "PASS", findings: "0 findings" },
];

function AreaIntelligence({ onNavigate, lightMode, onToggleTheme }: { onNavigate: (label: string) => void; lightMode: boolean; onToggleTheme: () => void }) {
  const trendPoints = [[20, 20], [110, 62], [228, 72], [334, 44], [438, 104], [462, 100]];
  const nearMissCounts = [4, 5, 3, 7, 2, 1];
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className={`safezone flex h-screen min-h-[620px] w-full flex-col overflow-hidden bg-[#0d0d15] font-sans text-white ${lightMode ? "safezone-light" : ""}`} data-node-id="2:870">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#2e2e4a] bg-[#161625] px-6 max-[900px]:gap-4 max-[760px]:flex-wrap max-[760px]:py-3" data-node-id="2:871">
        <div className="flex min-w-0 items-center gap-4" data-node-id="2:872">
          <div className="flex shrink-0 items-center gap-3" data-node-id="2:873"><span className="text-xl font-bold tracking-wide text-[#d71920]">RIO TINTO</span><span className="h-5 w-[3px] bg-[#2e2e4a]" /><span className="text-[15px] text-slate-400">SafeZone / Area Intelligence</span></div>
          <label className="flex h-[34px] w-[280px] items-center gap-2 rounded-lg bg-[#1e1e32] px-3 text-slate-400 max-[1050px]:hidden" data-node-id="2:877"><Search size={16} /><input placeholder="Search assets, zones, routes..." className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-slate-500" aria-label="Search assets, zones, and routes" /></label>
        </div>
        <div className="flex shrink-0 items-center gap-5" data-node-id="2:882"><div className="flex h-[23px] items-center gap-2 rounded-full bg-green-500/10 px-3 text-[11px] font-bold tracking-wide text-green-500"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />SITE ONLINE</div><button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e32]" aria-label="Notifications: 3 unread"><AlarmClock size={20} /><span className="absolute -right-0.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d71920] text-[9px] font-bold">3</span></button><button type="button" className="flex items-center gap-2.5 text-left" aria-label="User profile"><span className="h-[38px] w-[38px] rounded-full border-2 border-[#d71920] p-[2px]"><img src="/safezone-avatar.png" alt="" className="h-full w-full rounded-full object-cover" /></span><span className="hidden min-w-[96px] sm:block"><span className="block text-[13px] font-bold">D. Fletcher</span><span className="block text-[10px] text-slate-400">Port Superintendent</span></span></button></div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[90px] shrink-0 flex-col items-center border-r border-[#2e2e4a] bg-[#161625] max-[760px]:w-[68px]" data-node-id="2:899">
          <div className="mt-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#d71920] text-lg font-bold">RT</div><div className="mt-4 h-px w-12 bg-[#2e2e4a]" />
          <nav className="mt-4 flex w-full flex-col items-center gap-3 overflow-y-auto" data-node-id="2:903">
            {navItems.map(({ label, Icon, nodeId }) => <button key={label} type="button" onClick={() => onNavigate(label)} className={`flex h-[60px] w-[76px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg transition-colors max-[760px]:w-[58px] ${label === "Areas" ? "bg-[#d71920]" : "hover:bg-[#24243a]"}`} aria-label={label} aria-current={label === "Areas" ? "page" : undefined} data-node-id={label === "Areas" ? "2:924" : nodeId}><Icon size={21} strokeWidth={2.2} /><span className="text-[10px] font-medium leading-none">{label}</span></button>)}
            <button type="button" onClick={onToggleTheme} className="mt-2 flex h-[52px] w-[76px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg transition-colors hover:bg-[#24243a] max-[760px]:w-[58px]" aria-label={`Switch to ${lightMode ? "dark" : "light"} mode`} aria-pressed={lightMode}>{lightMode ? <Moon size={19} /> : <Sun size={19} />}<span className="text-[9px] font-medium">{lightMode ? "Dark mode" : "Light mode"}</span></button>
          </nav>
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto px-6 pb-6 pt-6 max-[760px]:px-4" data-node-id="2:944">
          <div className="mb-4" data-node-id="2:945"><button type="button" onClick={() => onNavigate("Map")} className="text-xs font-bold text-slate-400 hover:text-white" data-node-id="2:946">MAP &gt; CAPE LAMBERT &gt; SHIPLOADER 2</button><h1 className="mt-1 text-[22px] font-bold leading-[30px]" data-node-id="2:947">Shiploader 2 — Area Detail</h1></div>
          <section className="grid grid-cols-5 gap-3 max-[1000px]:grid-cols-3 max-[620px]:grid-cols-2" data-node-id="2:948">
            {areaMetrics.map((metric, index) => <article key={metric.label} className="min-h-[95px] rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-4" data-node-id={["2:949", "2:956", "2:962", "2:968", "2:974"][index]}><h2 className="text-[11px] font-bold text-slate-400">{metric.label}</h2><div className="mt-3 flex items-center gap-3">{metric.risk ? <><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-[#d71920] bg-red-500/10 text-xs font-bold text-[#d71920]">{metric.value}</span><span className="text-[13px] font-medium">{metric.detail}</span></> : <div><div className={`font-bold ${index === 4 ? "text-[20px]" : "text-[24px]"}`}>{metric.value}</div><p className="text-[11px] text-slate-400">{metric.detail}</p></div>}</div></article>)}
          </section>
          <div className="mt-5 grid grid-cols-[minmax(0,1.42fr)_minmax(300px,1fr)] gap-4 max-[1000px]:grid-cols-1" data-node-id="2:980">
            <div className="space-y-4" data-node-id="2:981">
              <section className="rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-5" data-node-id="2:982"><h2 className="text-sm font-bold text-slate-400" data-node-id="2:983">Potential Fatal Incidents (PFI) — 6 Month Trend</h2><div className="mt-4"><svg viewBox="0 0 470 130" className="h-[130px] w-full" role="img" aria-label="Potential fatal incidents trend from July through December"><g stroke="#2e2e4a" strokeWidth="1"><line x1="0" y1="20" x2="470" y2="20" strokeDasharray="3 4" /><line x1="0" y1="55" x2="470" y2="55" strokeDasharray="3 4" /><line x1="0" y1="90" x2="470" y2="90" strokeDasharray="3 4" /><line x1="0" y1="125" x2="470" y2="125" /></g><polyline points={trendPoints.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#d71920" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />{trendPoints.map(([x, y], index) => <circle key={months[index]} cx={x} cy={y} r="3" fill="#d71920" />)}<g fill="#64748b" fontSize="11">{months.map((month, index) => <text key={month} x={[0, 88, 180, 270, 360, 450][index]} y="128">{month}</text>)}</g></svg></div></section>
              <section className="rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-5" data-node-id="2:1002"><h2 className="text-sm font-bold text-slate-400" data-node-id="2:1003">Near Misses by Month</h2><div className="mt-4 flex h-[112px] items-end justify-between gap-4" data-node-id="2:1004">{nearMissCounts.map((count, index) => <div key={months[index]} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><div className="w-8 rounded-t bg-orange-500" style={{ height: `${Math.max(12, count * 10)}px` }} title={`${count} near misses in ${months[index]}`} /><span className="text-[11px] text-slate-500">{months[index]}</span></div>)}</div></section>
            </div>
            <div className="space-y-4" data-node-id="2:1023">
              <section className="rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-5" data-node-id="2:1024"><h2 className="text-sm font-bold text-slate-400" data-node-id="2:1025">Control Effectiveness</h2><div className="mt-4 flex items-center gap-5" data-node-id="2:1026"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full" style={{ background: "conic-gradient(#22c55e 0% 78%, #f97316 78% 94%, #ef4444 94% 100%)" }}><div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#1e1e32] text-base font-bold">78%</div></div><div className="space-y-2 text-xs">{[{ color: "#22c55e", label: "Active controls (12)" }, { color: "#f97316", label: "Required reinforcement (3)" }, { color: "#ef4444", label: "Missing / Ineffective (1)" }].map((item) => <div key={item.label} className="flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</div>)}</div></div></section>
              <section className="rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-5" data-node-id="2:1039"><h2 className="mb-3 text-sm font-bold text-slate-400" data-node-id="2:1040">Recent Inspections</h2><div data-node-id="2:1041">{inspectionRows.map((inspection, index) => <div key={inspection.date} className="flex min-h-[42px] items-center justify-between gap-2 border-b border-[#2e2e4a] px-2 text-xs" data-node-id={["2:1042", "2:1050", "2:1058", "2:1066"][index]}><span className="flex min-w-0 items-center gap-2"><strong className="shrink-0">{inspection.date}</strong><span className="truncate text-slate-400">{inspection.inspector}</span></span><span className="flex shrink-0 items-center gap-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${inspection.result === "PASS" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-400"}`}>{inspection.result}</span><span className="text-slate-400">{inspection.findings}</span></span></div>)}</div></section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const investigationSteps = [
  { label: "Incident Occurred", time: "14:23", complete: true },
  { label: "Hazard Reported", time: "14:31", complete: true },
  { label: "Area Secured", time: "14:45", complete: true },
  { label: "Investigation", time: "15:00", complete: true },
  { label: "Root Cause", time: "Pending", complete: false },
  { label: "Controls Applied", time: "Pending", complete: false },
];

const correctiveActions = [
  { label: "Isolate Shiploader Understructure", priority: "Critical", done: true },
  { label: "Replace Defective Tens. Bolts", priority: "High", done: false },
  { label: "Revise Inspection Schedule", priority: "Medium", done: false },
  { label: "Install Structural Mesh Guards", priority: "High", done: false },
];

function IncidentInvestigation({ onNavigate, lightMode, onToggleTheme }: { onNavigate: (label: string) => void; lightMode: boolean; onToggleTheme: () => void }) {
  const [actions, setActions] = useState(correctiveActions);
  const [selectedEvidence, setSelectedEvidence] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [draftUpdate, setDraftUpdate] = useState("");
  const [savedUpdate, setSavedUpdate] = useState("");
  const [currentStep, setCurrentStep] = useState(3);
  const [updated, setUpdated] = useState(false);
  const evidencePhotos = [
    "/safezone-incident-evidence-1.png",
    "/safezone-incident-evidence-2.png",
    "/safezone-incident-evidence-3.png",
  ];
  const toggleAction = (label: string) => setActions((current) => current.map((action) => action.label === label ? { ...action, done: !action.done } : action));
  const saveInvestigationUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const update = draftUpdate.trim();
    if (!update) return;
    setSavedUpdate(update);
    setUpdated(true);
    setUpdateDialogOpen(false);
  };

  return (
    <div className={`safezone flex h-screen min-h-[620px] w-full flex-col overflow-hidden bg-[#0d0d15] font-sans text-white ${lightMode ? "safezone-light" : ""}`} data-node-id="2:1246">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#2e2e4a] bg-[#161625] px-6 max-[900px]:gap-4 max-[760px]:flex-wrap max-[760px]:py-3" data-node-id="2:1247">
        <div className="flex min-w-0 items-center gap-4" data-node-id="2:1248"><div className="flex shrink-0 items-center gap-3" data-node-id="2:1249"><span className="text-xl font-bold tracking-wide text-[#d71920]">RIO TINTO</span><span className="h-5 w-[3px] bg-[#2e2e4a]" /><span className="text-[15px] text-slate-400">SafeZone / Incidents</span></div><label className="flex h-[34px] w-[280px] items-center gap-2 rounded-lg bg-[#1e1e32] px-3 text-slate-400 max-[1050px]:hidden" data-node-id="2:1253"><Search size={16} /><input placeholder="Search assets, zones, routes..." className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-slate-500" aria-label="Search assets, zones, and routes" /></label></div>
        <div className="flex shrink-0 items-center gap-5" data-node-id="2:1258"><div className="flex h-[23px] items-center gap-2 rounded-full bg-green-500/10 px-3 text-[11px] font-bold tracking-wide text-green-500"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />SITE ONLINE</div><button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e32]" aria-label="Notifications: 3 unread"><AlarmClock size={20} /><span className="absolute -right-0.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d71920] text-[9px] font-bold">3</span></button><button type="button" className="flex items-center gap-2.5 text-left" aria-label="User profile"><span className="h-[38px] w-[38px] rounded-full border-2 border-[#d71920] p-[2px]"><img src="/safezone-avatar.png" alt="" className="h-full w-full rounded-full object-cover" /></span><span className="hidden min-w-[96px] sm:block"><span className="block text-[13px] font-bold">D. Fletcher</span><span className="block text-[10px] text-slate-400">Port Superintendent</span></span></button></div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[90px] shrink-0 flex-col items-center border-r border-[#2e2e4a] bg-[#161625] max-[760px]:w-[68px]" data-node-id="2:1275"><div className="mt-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#d71920] text-lg font-bold">RT</div><div className="mt-4 h-px w-12 bg-[#2e2e4a]" /><nav className="mt-4 flex w-full flex-col items-center gap-3 overflow-y-auto" data-node-id="2:1279">{navItems.map(({ label, Icon, nodeId }) => <button key={label} type="button" onClick={() => onNavigate(label)} className={`flex h-[60px] w-[76px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg transition-colors max-[760px]:w-[58px] ${label === "Incidents" ? "bg-[#d71920]" : "hover:bg-[#24243a]"}`} aria-label={label} aria-current={label === "Incidents" ? "page" : undefined} data-node-id={label === "Incidents" ? "2:1310" : nodeId}><Icon size={21} strokeWidth={2.2} /><span className="text-[10px] font-medium leading-none">{label}</span></button>)}<button type="button" onClick={onToggleTheme} className="mt-2 flex h-[52px] w-[76px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg transition-colors hover:bg-[#24243a] max-[760px]:w-[58px]" aria-label={`Switch to ${lightMode ? "dark" : "light"} mode`} aria-pressed={lightMode}>{lightMode ? <Moon size={19} /> : <Sun size={19} />}<span className="text-[9px] font-medium">{lightMode ? "Dark mode" : "Light mode"}</span></button></nav></aside>
        <main className="min-w-0 flex-1 overflow-y-auto px-6 pb-6 pt-6 max-[760px]:px-4" data-node-id="2:1320">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4" data-node-id="2:1321"><div><h1 className="text-[22px] font-bold leading-[30px]" data-node-id="2:1323">Investigation — INV-2024-0847: Fallen Bracket</h1><p className="mt-1 text-[13px] text-slate-400" data-node-id="2:1324">Interactive root-cause timeline and evidence log</p></div><span className="rounded-md border border-yellow-500 bg-yellow-500/10 px-3 py-1.5 text-xs font-bold text-yellow-500" data-node-id="2:1325">{updated ? "UPDATED" : "INVESTIGATING"}</span></div>
          <section className="rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-5" data-node-id="2:1327"><h2 className="mb-5 text-xs font-bold text-slate-400" data-node-id="2:1328">Investigation Progress</h2><div className="flex overflow-x-auto" data-node-id="2:1329">{investigationSteps.map((step, index) => <button key={step.label} type="button" onClick={() => setCurrentStep(index)} className="group min-w-[124px] flex-1 text-center" aria-pressed={currentStep === index} data-node-id={["2:1330", "2:1336", "2:1343", "2:1350", "2:1357", "2:1364"][index]}><span className="relative flex h-6 items-center"><span className={`absolute left-1/2 right-[-50%] top-1/2 h-0.5 -translate-y-1/2 ${index < currentStep ? "bg-[#d71920]" : "bg-[#2e2e4a]"}`} />{index > 0 && <span className={`absolute left-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2 ${index <= currentStep ? "bg-[#d71920]" : "bg-[#2e2e4a]"}`} />}<span className={`relative z-10 ml-[calc(50%-12px)] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[3px] border-[#0d0d15] transition-transform ${step.complete ? "bg-[#d71920]" : "bg-[#2e2e4a]"} ${currentStep === index ? "ring-2 ring-white/20" : ""}`} /></span><span className="mt-2 block whitespace-nowrap text-[11px] font-bold">{step.label}</span><span className="mt-1 block text-[10px] text-slate-500">{step.time}</span></button>)}</div></section>
          <div className="mt-5 grid grid-cols-[minmax(0,1.175fr)_minmax(340px,1fr)] gap-4 max-[900px]:grid-cols-1" data-node-id="2:1370">
            <section className="rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-5" data-node-id="2:1372"><h2 className="text-sm font-bold text-slate-400" data-node-id="2:1373">Evidence &amp; Findings</h2><div className="mt-3 flex flex-wrap gap-2.5" data-node-id="2:1374">{evidencePhotos.map((photo, index) => <button key={photo} type="button" onClick={() => { setSelectedEvidence(index); setZoom(1); }} aria-pressed={selectedEvidence === index} aria-label={`View evidence photo ${index + 1} enlarged`} className={`overflow-hidden rounded-lg border-2 transition-colors ${selectedEvidence === index ? "border-[#d71920]" : "border-transparent"}`} data-node-id={["2:1375", "2:1376", "2:1377"][index]}><img src={photo} alt={`Incident evidence ${index + 1}`} className="h-20 w-[120px] object-cover" /></button>)}</div><ul className="mt-3 space-y-2 text-[13px] leading-[18px]"><li data-node-id="2:1379">• Structural bolt fail on Shiploader 2 conveyor tension assembly.</li><li data-node-id="2:1380">• Wear patterns indicate accelerated corrosion from coastal climate.</li><li data-node-id="2:1381">• Incident bypasses local catch net due to deflection angle.</li></ul></section>
            <section className="rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-5" data-node-id="2:1383"><h2 className="mb-4 text-sm font-bold text-slate-400" data-node-id="2:1384">Corrective Actions</h2><div className="space-y-2.5" data-node-id="2:1385">{actions.map((action, index) => <label key={action.label} className="flex min-h-[42px] cursor-pointer items-center justify-between gap-3 rounded-lg bg-[#0d0d15] px-3 py-2" data-node-id={["2:1386", "2:1393", "2:1399", "2:1405"][index]}><span className="flex min-w-0 items-center gap-2.5"><input type="checkbox" checked={action.done} onChange={() => toggleAction(action.label)} className="h-[18px] w-[18px] shrink-0 accent-green-500" data-node-id={["2:1388", "2:1395", "2:1401", "2:1407"][index]} /><span className="truncate text-xs font-bold">{action.label}</span></span><span className={`shrink-0 rounded px-2 py-1 text-[9px] font-bold ${action.priority === "Critical" ? "bg-red-500/10 text-red-400" : action.priority === "High" ? "bg-orange-500/10 text-orange-500" : "bg-yellow-500/10 text-yellow-500"}`}>{action.priority}</span></label>)}</div></section>
          </div>
          {savedUpdate && <p role="status" className="mt-3 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-slate-300"><span className="font-bold text-green-400">Latest update:</span> {savedUpdate}</p>}
          {updated && !savedUpdate && <p role="status" className="mt-3 text-xs text-green-400">Investigation updates saved.</p>}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pb-1" data-node-id="2:1411"><button type="button" onClick={() => window.print()} className="h-[38px] rounded-lg border border-[#2e2e4a] bg-[#1e1e32] px-5 text-[13px] font-bold hover:bg-[#24243a]" data-node-id="2:1412">Export PDF Report</button><button type="button" onClick={() => { setDraftUpdate(savedUpdate); setUpdateDialogOpen(true); }} className="h-[38px] rounded-lg bg-[#d71920] px-6 text-[13px] font-bold text-white hover:bg-red-700" data-node-id="2:1414">Update Investigation</button></div>
          {updateDialogOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setUpdateDialogOpen(false); }}><section className="w-full max-w-lg rounded-xl border border-[#2e2e4a] bg-[#161625] p-5 text-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="investigation-update-title"><div className="mb-4 flex items-start justify-between gap-4"><div><h2 id="investigation-update-title" className="text-lg font-bold">Update Investigation</h2><p className="mt-1 text-xs text-slate-400">Add a note to investigation INV-2024-0847.</p></div><button type="button" onClick={() => setUpdateDialogOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-[#24243a] hover:text-white" aria-label="Close update dialog"><X size={18} /></button></div><form onSubmit={saveInvestigationUpdate} className="space-y-4"><label className="block text-xs font-semibold text-slate-300" htmlFor="investigation-update">Investigation update<textarea id="investigation-update" required autoFocus value={draftUpdate} onChange={(event) => setDraftUpdate(event.target.value)} rows={5} placeholder="Describe findings, actions taken, or next steps..." className="mt-2 block w-full resize-y rounded-lg border border-[#2e2e4a] bg-[#0d0d15] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d71920]" /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setUpdateDialogOpen(false)} className="rounded-lg border border-[#2e2e4a] px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-[#24243a]">Cancel</button><button type="submit" className="rounded-lg bg-[#d71920] px-4 py-2 text-sm font-bold text-white hover:bg-red-700">Save Update</button></div></form></section></div>}
          {selectedEvidence !== null && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedEvidence(null); }}><section className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-[#2e2e4a] bg-[#161625] shadow-2xl" role="dialog" aria-modal="true" aria-label={`Evidence photo ${selectedEvidence + 1} enlarged`}><div className="flex shrink-0 items-center justify-between border-b border-[#2e2e4a] px-4 py-3"><h2 className="text-sm font-bold">Evidence Photo {selectedEvidence + 1}</h2><div className="flex items-center gap-2"><button type="button" onClick={() => setZoom((current) => Math.max(1, current - 0.25))} disabled={zoom <= 1} className="rounded-md p-2 hover:bg-[#24243a] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Zoom out"><ZoomOut size={18} /></button><span className="min-w-12 text-center text-xs text-slate-400">{Math.round(zoom * 100)}%</span><button type="button" onClick={() => setZoom((current) => Math.min(3, current + 0.25))} disabled={zoom >= 3} className="rounded-md p-2 hover:bg-[#24243a] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Zoom in"><ZoomIn size={18} /></button><button type="button" onClick={() => setSelectedEvidence(null)} className="ml-2 rounded-md p-2 text-slate-400 hover:bg-[#24243a] hover:text-white" aria-label="Close photo viewer"><X size={18} /></button></div></div><div className="min-h-0 flex-1 overflow-auto p-4"><div className="flex min-h-full min-w-full items-center justify-center"><img src={evidencePhotos[selectedEvidence]} alt={`Enlarged incident evidence photo ${selectedEvidence + 1}`} className="h-auto max-h-[calc(92vh-90px)] w-full max-w-[900px] rounded-lg object-contain transition-transform duration-150" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }} /></div></div></section></div>}
        </main>
      </div>
    </div>
  );
}

const executiveMetrics = [
  { label: "ACTIVE HAZARDS", value: "12", trend: "▲ +2", color: "#ef4444", nodeId: "2:1497" },
  { label: "REPORTED TODAY", value: "7", trend: "▲ +4", color: "#22c55e", nodeId: "2:1504" },
  { label: "OPEN ACTIONS", value: "34", trend: "▲ Stable", color: "#eab308", nodeId: "2:1511" },
  { label: "HIGH-RISK ZONES", value: "3", trend: "▼ 0", color: "#94a3b8", nodeId: "2:1518" },
  { label: "WORKFORCE EXPOSED", value: "89", trend: "▼ -12", color: "#22c55e", nodeId: "2:1525" },
  { label: "RISK REDUCTION", value: "-23%", trend: "▼ Goal Achieved", color: "#22c55e", nodeId: "2:1532" },
];

const reportingLeaders = [
  { name: "John Davis", reports: 18, badge: "Safety Champion", color: "#22c55e", avatar: "/safezone-worker-john.png" },
  { name: "Sarah Chen", reports: 15, badge: "Hazard Hunter", color: "#f97316", avatar: "/safezone-worker-sarah.png" },
  { name: "Mark Thorne", reports: 12, badge: "Spotter Pro", color: "#eab308", avatar: "/safezone-worker-mark.png" },
];

const forecastHotspots = [
  { title: "Conveyor CV104 Tensioner", probability: "88% Risk Probability", detail: "Vibration patterns & loose mount alert stream", color: "#ef4444" },
  { title: "Shiploader 2 Boom Structure", probability: "74% Risk Probability", detail: "Increased winds forecast & pending weld inspections", color: "#f97316" },
  { title: "Transfer Tower 3 Deflector", probability: "62% Risk Probability", detail: "Asset wear timeline & material throughput volume", color: "#eab308" },
];

function ExecutiveDashboard({ onNavigate, lightMode, onToggleTheme }: { onNavigate: (label: string) => void; lightMode: boolean; onToggleTheme: () => void }) {
  const trendValues = [20, 37, 54, 62, 67, 73, 70, 62, 58, 57, 73, 87];
  const trendPoints = trendValues.map((value, index) => `${10 + index * 39},${100 - value}`).join(" ");
  const chartArea = `10,100 ${trendPoints} 439,100`;
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className={`safezone flex h-screen min-h-[620px] w-full flex-col overflow-hidden bg-[#0d0d15] font-sans text-white ${lightMode ? "safezone-light" : ""}`} data-node-id="2:1417">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#2e2e4a] bg-[#161625] px-6 max-[900px]:gap-4 max-[760px]:flex-wrap max-[760px]:py-3" data-node-id="2:1418"><div className="flex min-w-0 items-center gap-4" data-node-id="2:1419"><div className="flex shrink-0 items-center gap-3" data-node-id="2:1420"><span className="text-xl font-bold tracking-wide text-[#d71920]">RIO TINTO</span><span className="h-5 w-[3px] bg-[#2e2e4a]" /><span className="text-[15px] text-slate-400">SafeZone / Executive Dashboard</span></div><label className="flex h-[34px] w-[280px] items-center gap-2 rounded-lg bg-[#1e1e32] px-3 text-slate-400 max-[1050px]:hidden" data-node-id="2:1424"><Search size={16} /><input placeholder="Search assets, zones, routes..." className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-slate-500" aria-label="Search assets, zones, and routes" /></label></div><div className="flex shrink-0 items-center gap-5" data-node-id="2:1429"><div className="flex h-[23px] items-center gap-2 rounded-full bg-green-500/10 px-3 text-[11px] font-bold tracking-wide text-green-500"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />SITE ONLINE</div><button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e32]" aria-label="Notifications: 3 unread"><AlarmClock size={20} /><span className="absolute -right-0.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d71920] text-[9px] font-bold">3</span></button><button type="button" className="flex items-center gap-2.5 text-left" aria-label="User profile"><span className="h-[38px] w-[38px] rounded-full border-2 border-[#d71920] p-[2px]"><img src="/safezone-avatar.png" alt="" className="h-full w-full rounded-full object-cover" /></span><span className="hidden min-w-[96px] sm:block"><span className="block text-[13px] font-bold">D. Fletcher</span><span className="block text-[10px] text-slate-400">Port Superintendent</span></span></button></div></header>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[90px] shrink-0 flex-col items-center border-r border-[#2e2e4a] bg-[#161625] max-[760px]:w-[68px]" data-node-id="2:1446"><div className="mt-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#d71920] text-lg font-bold">RT</div><div className="mt-4 h-px w-12 bg-[#2e2e4a]" /><nav className="mt-4 flex w-full flex-col items-center gap-3 overflow-y-auto" data-node-id="2:1450">{navItems.map(({ label, Icon, nodeId }) => <button key={label} type="button" onClick={() => onNavigate(label)} className={`flex h-[60px] w-[76px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg transition-colors max-[760px]:w-[58px] ${label === "Dashboard" ? "bg-[#d71920]" : "hover:bg-[#24243a]"}`} aria-label={label} aria-current={label === "Dashboard" ? "page" : undefined} data-node-id={label === "Dashboard" ? "2:1486" : nodeId}><Icon size={21} strokeWidth={2.2} /><span className="text-[10px] font-medium leading-none">{label}</span></button>)}<button type="button" onClick={onToggleTheme} className="mt-2 flex h-[52px] w-[76px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg transition-colors hover:bg-[#24243a] max-[760px]:w-[58px]" aria-label={`Switch to ${lightMode ? "dark" : "light"} mode`} aria-pressed={lightMode}>{lightMode ? <Moon size={19} /> : <Sun size={19} />}<span className="text-[9px] font-medium">{lightMode ? "Dark mode" : "Light mode"}</span></button></nav></aside>
        <main className="min-w-0 flex-1 overflow-y-auto px-6 pb-6 pt-6 max-[760px]:px-4" data-node-id="2:1491">
          <div className="mb-4" data-node-id="2:1492"><h1 className="text-[22px] font-bold leading-[30px]" data-node-id="2:1494">SafeZone Operations Intelligence</h1><p className="mt-1 text-[13px] text-slate-400" data-node-id="2:1495">Live site indicators, safety leaderboard, and predictive hotspot analysis</p></div>
          <section className="grid grid-cols-6 gap-3 max-[1050px]:grid-cols-3 max-[580px]:grid-cols-2" data-node-id="2:1496">{executiveMetrics.map((metric, index) => <article key={metric.label} className="min-h-[88px] rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-4" data-node-id={metric.nodeId}><h2 className="whitespace-nowrap text-[11px] font-bold text-slate-400">{metric.label}</h2><div className="mt-2 flex items-center justify-between gap-2"><span className="text-[24px] font-bold leading-[33px]">{metric.value}</span><span className="whitespace-nowrap rounded px-2 py-1 text-[10px] font-bold" style={{ color: metric.color, backgroundColor: `${metric.color}1f` }} data-node-id={["2:1502", "2:1509", "2:1516", "2:1523", "2:1530", "2:1537"][index]}>{metric.trend}</span></div></article>)}</section>
          <div className="mt-5 grid grid-cols-[minmax(0,1.29fr)_minmax(340px,1fr)] gap-4 max-[900px]:grid-cols-1" data-node-id="2:1539">
            <section className="rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-5" data-node-id="2:1540"><h2 className="text-sm font-bold text-slate-400" data-node-id="2:1541">Falling Object Incidents — 12 Month Trend</h2><svg viewBox="0 0 450 160" className="mt-4 h-[160px] w-full" role="img" aria-label="Falling object incidents trend over twelve months"><defs><linearGradient id="incident-trend-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity=".22" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0" /></linearGradient></defs><g stroke="#2e2e4a" strokeWidth="1"><line x1="0" y1="15" x2="450" y2="15" /><line x1="0" y1="55" x2="450" y2="55" /><line x1="0" y1="95" x2="450" y2="95" /></g><polygon points={chartArea} fill="url(#incident-trend-fill)" /><polyline points={trendPoints} fill="none" stroke="#22c55e" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />{trendValues.map((_, index) => <circle key={monthLabels[index]} cx={10 + index * 39} cy={100 - trendValues[index]} r="2.5" fill="#22c55e" />)}</svg><div className="-mt-1 flex justify-between text-[10px] text-slate-500">{monthLabels.map((month) => <span key={month}>{month}</span>)}</div></section>
            <section className="rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-5" data-node-id="2:1551"><h2 className="mb-4 text-sm font-bold text-slate-400" data-node-id="2:1552">Reporting Leaders (Gamified)</h2><div className="space-y-2.5" data-node-id="2:1553">{reportingLeaders.map((leader, index) => <div key={leader.name} className="flex min-h-[40px] items-center justify-between gap-2 rounded-lg bg-[#0d0d15] px-2" data-node-id={["2:1554", "2:1564", "2:1574"][index]}><div className="flex min-w-0 items-center gap-2"><span className="w-3 text-sm font-bold text-[#d71920]">{index + 1}</span><img src={leader.avatar} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" /><span className="truncate text-xs font-bold">{leader.name}</span></div><div className="flex shrink-0 items-center gap-2"><span className="whitespace-nowrap text-xs font-bold">{leader.reports} Reports</span><span className="hidden rounded px-1.5 py-1 text-[9px] font-bold sm:inline" style={{ color: leader.color, backgroundColor: `${leader.color}1a` }}>{leader.badge}</span></div></div>)}</div></section>
          </div>
          <section className="mt-5" data-node-id="2:1584"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-400" data-node-id="2:1589"><Sparkles size={16} className="text-[#d71920]" />Predictive AI Hotspots — 7-Day Safety Forecast</h2><div className="mt-3 grid grid-cols-3 gap-3 max-[760px]:grid-cols-1" data-node-id="2:1590">{forecastHotspots.map((hotspot, index) => <button key={hotspot.title} type="button" onClick={() => onNavigate("Areas")} className="min-h-[97px] rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-4 text-left transition-colors hover:border-[#4b4b6b]" data-node-id={["2:1591", "2:1597", "2:1603"][index]}><span className="flex items-center justify-between gap-2"><span className="truncate text-[13px] font-bold">{hotspot.title}</span><i className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: hotspot.color }} /></span><span className="mt-2 block text-xs font-bold" style={{ color: hotspot.color }}>{hotspot.probability}</span><span className="mt-2 block text-[11px] text-slate-400">{hotspot.detail}</span></button>)}</div></section>
        </main>
      </div>
    </div>
  );
}

function WorkerAwareness({ onNavigate, lightMode, onToggleTheme }: { onNavigate: (label: string) => void; lightMode: boolean; onToggleTheme: () => void }) {
  const [area, setArea] = useState<Destination>("Shiploader 2");
  const [query, setQuery] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [hotspotOpen, setHotspotOpen] = useState(false);
  const areaWorkers = areaWorkerAssignments[area].map((id) => awarenessWorkers.find((worker) => worker.id === id)!);
  const filteredWorkers = areaWorkers.filter((worker) => `${worker.name} ${worker.role} ${worker.team}`.toLowerCase().includes(query.toLowerCase()));
  const [focusX, focusY] = destinationInfo[area].point;
  const mapPosition = `${focusX}% ${focusY}%`;
  const workerPins = areaWorkers.slice(0, 3).map((worker, index) => ({
    ...worker,
    left: `${50 + [-10, 0, 10][index]}%`,
    top: `${50 + [-5, 8, -2][index]}%`,
    nodeId: ["2:1165", "2:1167", "2:1169"][index],
  }));

  return (
    <div className={`safezone flex h-screen min-h-[620px] w-full flex-col overflow-hidden bg-[#0d0d15] text-white ${lightMode ? "safezone-light" : ""}`} data-node-id="2:1075">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#2e2e4a] bg-[#161625] px-6 max-[900px]:gap-4 max-[760px]:flex-wrap max-[760px]:py-3" data-node-id="2:1076">
        <div className="flex min-w-0 items-center gap-4" data-node-id="2:1077">
          <div className="flex shrink-0 items-center gap-3" data-node-id="2:1078"><span className="text-xl font-bold tracking-wide text-[#d71920]">RIO TINTO</span><span className="h-5 w-[3px] bg-[#2e2e4a]" /><span className="text-[15px] text-slate-400">SafeZone / Worker Awareness</span></div>
          <label className="flex h-[34px] w-[280px] items-center gap-2 rounded-lg bg-[#1e1e32] px-3 text-slate-400 max-[1050px]:hidden" data-node-id="2:1082"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, roles, teams..." className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-slate-500" aria-label="Search workers" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear worker search"><X size={14} /></button>}</label>
        </div>
        <div className="flex shrink-0 items-center gap-5" data-node-id="2:1087"><div className="flex h-[23px] items-center gap-2 rounded-full bg-green-500/10 px-3 text-[11px] font-bold tracking-wide text-green-500"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />SITE ONLINE</div><button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e32]" aria-label="Notifications: 3 unread"><AlarmClock size={20} /><span className="absolute -right-0.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d71920] text-[9px] font-bold">3</span></button><button className="flex items-center gap-2.5 text-left" type="button" aria-label="User profile"><span className="h-[38px] w-[38px] rounded-full border-2 border-[#d71920] p-[2px]"><img src="/safezone-avatar.png" alt="" className="h-full w-full rounded-full object-cover" /></span><span className="hidden min-w-[96px] sm:block"><span className="block text-[13px] font-bold">D. Fletcher</span><span className="block text-[10px] text-slate-400">Port Superintendent</span></span></button></div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[90px] shrink-0 flex-col items-center border-r border-[#2e2e4a] bg-[#161625] max-[760px]:w-[68px]" data-node-id="2:1104">
          <div className="mt-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#d71920] text-lg font-bold" data-node-id="2:1105">RT</div><div className="mt-4 h-px w-12 bg-[#2e2e4a]" data-node-id="2:1107" />
          <nav className="mt-4 flex w-full flex-col items-center gap-3" data-node-id="2:1108">
            {navItems.map(({ label, Icon, nodeId }) => <button key={label} type="button" onClick={() => onNavigate(label)} className={`flex h-[60px] w-[76px] flex-col items-center justify-center gap-1.5 rounded-lg transition-colors max-[760px]:w-[58px] ${label === "People" ? "bg-[#d71920]" : "hover:bg-[#24243a]"}`} aria-label={label} aria-current={label === "People" ? "page" : undefined} data-node-id={label === "People" ? "2:1134" : nodeId}><Icon size={21} strokeWidth={2.2} /><span className="text-[10px] font-medium leading-none">{label}</span></button>)}
            <button type="button" onClick={onToggleTheme} className="mt-2 flex h-[52px] w-[76px] flex-col items-center justify-center gap-1 rounded-lg transition-colors hover:bg-[#24243a] max-[760px]:w-[58px]" aria-label={`Switch to ${lightMode ? "dark" : "light"} mode`} aria-pressed={lightMode}><span className="flex h-6 w-6 items-center justify-center">{lightMode ? <Moon size={19} /> : <Sun size={19} />}</span><span className="text-[9px] font-medium">{lightMode ? "Dark mode" : "Light mode"}</span></button>
          </nav>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto px-6 pb-6 max-[760px]:px-4" data-node-id="2:1149">
          <div className="mt-6 flex shrink-0 items-center justify-between gap-4 max-[760px]:flex-wrap" data-node-id="2:1150">
            <div><h1 className="text-[22px] font-bold leading-[30px]">Worker Density &amp; Risk Exposure</h1><p className="mt-1 text-[13px] text-slate-400">Real-time workforce localization over hazard hotspot overlays</p></div>
            <label className="relative flex h-[38px] w-[220px] shrink-0 items-center rounded-lg border border-[#2e2e4a] bg-[#1e1e32] px-3 max-[500px]:w-full"><select value={area} onChange={(event) => { setArea(event.target.value as Destination); setSelectedWorker(null); }} className="h-full w-full appearance-none bg-transparent pr-6 text-sm font-bold text-white outline-none" aria-label="Select operating area">{destinations.map((destination) => <option key={destination} value={destination} className="bg-[#1e1e32]">{destination}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3" /></label>
          </div>
          <div className="mt-5 grid min-h-0 flex-1 grid-cols-[minmax(0,1.18fr)_minmax(340px,.92fr)] gap-4 max-[1050px]:grid-cols-[minmax(0,1fr)_minmax(320px,.95fr)] max-[850px]:grid-cols-1" data-node-id="2:1157">
            <section className="flex min-h-[440px] min-w-0 flex-col overflow-hidden rounded-xl border border-[#2e2e4a] bg-[#1e1e32]" data-node-id="2:1158">
              <div className="flex h-[51px] shrink-0 items-center justify-between border-b border-[#2e2e4a] px-4" data-node-id="2:1159"><h2 className="text-sm font-bold text-slate-400" data-node-id="2:1160">Exposure Map (Risk × Density)</h2><span className="truncate text-xs font-semibold text-slate-300">{area}</span></div>
              <div className="relative min-h-0 flex-1 overflow-hidden bg-[#0d111b]" data-node-id="2:1161">
                <img src="/safezone-map.png" alt={`${area} risk and worker density map`} className="absolute inset-0 h-full w-full object-cover transition-[object-position] duration-500" style={{ objectPosition: mapPosition, transform: "scale(1.35)" }} />
                <div className="absolute bottom-3 left-3 rounded-md border border-[#2e2e4a] bg-[#161625]/90 px-2.5 py-1.5 text-[10px] font-bold text-slate-200">{area} · Live workforce</div>
                <div className="absolute left-[49%] top-[27%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/25 blur-sm" data-node-id="2:1162"><span className="absolute left-3 top-5 h-10 w-10 rounded-full bg-red-500/50" data-node-id="2:1163" /><span className="absolute right-2 top-8 h-4 w-4 rounded-full bg-red-500" data-node-id="2:1164" /></div>
                {workerPins.map((pin) => <button key={pin.id} type="button" onClick={() => setSelectedWorker(pin.id)} aria-label={`Select ${pin.name}`} aria-pressed={selectedWorker === pin.id} className={`absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-[#0d0d15] text-[9px] font-bold text-white shadow-lg ${selectedWorker === pin.id ? "ring-4 ring-white/25" : ""}`} style={{ left: pin.left, top: pin.top, borderColor: pin.color }} data-node-id={pin.nodeId}>{pin.initials}</button>)}
                {selectedWorker && <div className="absolute left-3 top-3 z-20 rounded-md border border-[#2e2e4a] bg-[#161625]/95 px-3 py-2 text-xs font-semibold">{areaWorkers.find((worker) => worker.id === selectedWorker)?.name}<button type="button" className="ml-3 text-slate-400" onClick={() => setSelectedWorker(null)} aria-label="Clear selected worker"><X size={13} /></button></div>}
              </div>
            </section>
            <div className="flex min-h-0 flex-col gap-4">
              <section className="shrink-0 rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-4" data-node-id="2:1172">
                <div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-bold">{areaWorkers.length} Workers in Area</h2><span className="text-xs text-slate-400">Live Count</span></div>
                <div className="flex h-2.5 gap-1 overflow-hidden rounded-full" data-node-id="2:1176"><span className="w-[40%] bg-teal-500" data-node-id="2:1177" /><span className="w-[26%] bg-blue-500" data-node-id="2:1178" /><span className="w-[17%] bg-orange-500" data-node-id="2:1179" /><span className="w-[9%] bg-slate-500" data-node-id="2:1180" /></div>
              </section>
              <section className="flex min-h-[300px] flex-1 flex-col rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-4" data-node-id="2:1181">
                <h2 className="mb-3 shrink-0 text-xs font-bold uppercase tracking-wide text-slate-400" data-node-id="2:1182">Who Is Here</h2>
                <div className="min-h-0 space-y-2 overflow-y-auto" data-node-id="2:1183">
                  {filteredWorkers.map((worker) => <button key={worker.id} type="button" onClick={() => setSelectedWorker(worker.id)} className={`flex min-h-[50px] w-full items-center justify-between gap-2 rounded-lg border px-2 ${selectedWorker === worker.id ? "border-[#4b5d82] bg-[#25263a]" : "border-[#2e2e4a] bg-[#1e1e32] hover:bg-[#25263a]"}`} data-node-id={worker.nodeId}>
                    <span className="flex min-w-0 items-center gap-2.5 text-left"><span className="h-7 w-7 shrink-0 rounded-full p-[2px]" style={{ border: `2px solid ${worker.color}` }}><img src={worker.avatar} alt="" className="h-full w-full rounded-full object-cover" /></span><span className="min-w-0"><span className="block truncate text-[13px] font-bold">{worker.name}</span><span className="block truncate text-[10px] text-slate-500">{worker.role}</span></span></span>
                    <span className="flex shrink-0 items-center"><span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ color: worker.color, backgroundColor: `${worker.color}1a` }}>{worker.team}</span></span>
                  </button>)}
                  {filteredWorkers.length === 0 && <p className="py-5 text-center text-xs text-slate-400">No workers match your search.</p>}
                </div>
              </section>
              <button type="button" onClick={() => setHotspotOpen((open) => !open)} className="flex min-h-[61px] shrink-0 items-center gap-3 rounded-lg border border-red-500 bg-red-500/15 px-3 text-left hover:bg-red-500/20" data-node-id="2:1239"><span className="h-2 w-2 shrink-0 rounded-full bg-red-500" data-node-id="2:1241" /><span className="min-w-0"><span className="block text-[13px] font-bold">Shiploader 2 Main Deck</span><span className="mt-0.5 block truncate text-[11px] text-slate-400">8 Workers exposed to active falling object zone</span>{hotspotOpen && <span className="mt-1 block text-[10px] text-red-300">Restricted area · supervisor review required</span>}</span></button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function RoutePlanner() {
  const [destination, setDestination] = useState<Destination>("Shiploader 2");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteId | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const destinationData = destinationInfo[destination];
  const route = routeOptions.find((option) => option.id === selectedRoute);
  const routeMinutes = route ? Math.max(2, Math.round(destinationData.minutes * route.timeFactor)) : null;
  const distanceKm = route ? Number((Number.parseFloat(destinationData.distance) * route.distanceFactor).toFixed(1)) : null;
  const distance = distanceKm === null ? null : `${distanceKm.toFixed(1)} km`;
  const eta = routeMinutes === null ? null : `${routeMinutes} min`;
  const arrivalTime = routeMinutes === null ? null : new Date(Date.now() + routeMinutes * 60_000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const riskIndices = route ? selectedRoute === "safest" ? destinationData.riskIndices.filter((index) => routeRisks[index].severity !== "Critical").slice(0, 2) : selectedRoute === "fastest" ? [...new Set([...destinationData.riskIndices, 4])].slice(0, 3) : destinationData.riskIndices.slice(0, 3) : [];
  const activeRisks = riskIndices.map((index) => routeRisks[index]);
  const activeRisk = activeRisks.find((risk) => risk.name === selectedRisk);
  const matchingDestinations = destinations.filter((item) => item.toLowerCase().includes(destinationQuery.toLowerCase()));
  const [endX, endY] = [destinationData.point[0] * 10, destinationData.point[1] * 7.6];
  const routePath = selectedRoute ? {
    safest: `M 180 100 C 250 170 320 145 360 260 S 460 390 560 430 S ${endX - 80} ${endY - 30} ${endX} ${endY}`,
    balanced: `M 180 100 C 285 150 365 190 390 290 S 520 380 610 420 S ${endX - 45} ${endY - 70} ${endX} ${endY}`,
    fastest: `M 180 100 C 220 240 460 160 490 320 S 630 360 690 470 S ${endX - 20} ${endY - 15} ${endX} ${endY}`,
  }[selectedRoute] : null;

  return (
    <main className="flex min-h-0 flex-1 max-[900px]:overflow-y-auto max-[760px]:flex-col" data-node-id="2:609">
      <section className="flex w-[340px] shrink-0 flex-col border-r border-[#2e2e4a] bg-[#161625] p-5 max-[900px]:w-[320px] max-[760px]:min-h-[620px] max-[760px]:w-full" data-node-id="2:610">
        <div data-node-id="2:611">
          <h1 className="text-base font-bold">Smart Route Planner</h1>
          <p className="mt-1 text-xs text-slate-400">Cape Lambert Operations</p>
        </div>
        <div className="mt-5 flex h-[42px] shrink-0 items-center gap-2 rounded-lg bg-[#1e1e32] px-3 text-[13px]" data-node-id="2:615">
          <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />Workshop 3 <span className="text-slate-500">· Current location</span>
        </div>
        <section className="relative mt-5" aria-labelledby="destination-title" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDestinationOpen(false); }}>
          <h2 id="destination-title" className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-400">Destination</h2>
          <div className="flex h-11 items-center gap-2 rounded-lg border border-[#3a3a57] bg-[#1e1e32] px-3 focus-within:border-[#d71920]">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input value={destinationOpen ? destinationQuery : destination} onFocus={() => { setDestinationOpen(true); setDestinationQuery(""); }} onChange={(event) => { setDestinationQuery(event.target.value); setDestinationOpen(true); }} onKeyDown={(event) => { if (event.key === "Escape") setDestinationOpen(false); if (event.key === "Enter" && matchingDestinations[0]) { setDestination(matchingDestinations[0]); setSelectedRoute(null); setNavigationStarted(false); setSelectedRisk(null); setDestinationOpen(false); setDestinationQuery(""); } }} placeholder="Search 14 locations" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" aria-label="Search and choose destination" aria-expanded={destinationOpen} aria-controls="destination-options" role="combobox" aria-autocomplete="list" />
            <button type="button" className="text-slate-400" aria-label={destinationOpen ? "Close destinations" : "Show destinations"} onClick={() => { setDestinationOpen((open) => !open); setDestinationQuery(""); }}><MapPin size={16} /></button>
          </div>
          {destinationOpen && (
            <div id="destination-options" role="listbox" className="absolute left-0 right-0 top-[68px] z-30 max-h-64 overflow-y-auto rounded-lg border border-[#3a3a57] bg-[#1e1e32] p-1 shadow-2xl">
              {matchingDestinations.map((item) => <button key={item} type="button" role="option" aria-selected={destination === item} onClick={() => { setDestination(item); setSelectedRoute(null); setNavigationStarted(false); setSelectedRisk(null); setDestinationQuery(""); setDestinationOpen(false); }} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-[#2a2a43] ${destination === item ? "text-white" : "text-slate-300"}`}>{item}{destination === item && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}</button>)}
              {matchingDestinations.length === 0 && <p className="px-3 py-3 text-xs text-slate-400">No locations match your search.</p>}
            </div>
          )}
        </section>

        {!route ? (
          <section className="mt-5" aria-labelledby="route-options-title">
            <h2 id="route-options-title" className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-400">Choose your route</h2>
            <div className="space-y-2.5">
              {routeOptions.map((option) => (
                <button key={option.id} type="button" onClick={() => { setSelectedRoute(option.id); setSelectedRisk(null); setNavigationStarted(false); }} className="w-full rounded-lg border border-[#2e2e4a] bg-[#1e1e32] p-3 text-left transition-colors hover:bg-[#24243a]" aria-label={`${option.label}, ${option.risk}`}>
                  <span className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-sm font-bold"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: option.color }} />{option.label}</span>{"recommended" in option && option.recommended && <span className="rounded-full px-2 py-1 text-[9px] font-bold" style={{ color: option.color, backgroundColor: `${option.color}20` }}>RECOMMENDED</span>}</span>
                  <span className="mt-1.5 block pl-[18px] text-[11px] text-slate-400">{option.description}</span>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-5 rounded-xl border border-[#2e2e4a] bg-[#1e1e32] p-4" aria-label="Selected route details">
            <div className="mb-3 flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-300"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: route.color }} />{route.label} route</h2><button type="button" onClick={() => { setSelectedRoute(null); setNavigationStarted(false); setSelectedRisk(null); }} className="text-[10px] font-semibold text-slate-400 hover:text-white">Change</button></div>
            <div className="grid grid-cols-3 gap-2 border-b border-[#34344e] pb-3">
              <div><div className="text-lg font-bold">{distance}</div><div className="text-[10px] text-slate-400">Distance</div></div>
              <div><div className="text-lg font-bold">{eta}</div><div className="text-[10px] text-slate-400">Travel time</div></div>
              <div><div className="text-lg font-bold">{arrivalTime}</div><div className="text-[10px] text-slate-400">Arrival</div></div>
            </div>
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-semibold">Active along route</h3><span className="text-[10px] text-slate-400">{activeRisks.length} hazards</span></div>
              <div className="space-y-1.5">
                {activeRisks.map(({ name, severity, Icon }) => <button key={name} type="button" onClick={() => setSelectedRisk(selectedRisk === name ? null : name)} className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-white/5" aria-pressed={selectedRisk === name}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${severity === "Critical" ? "bg-red-500/15 text-red-400" : severity === "High" ? "bg-orange-500/15 text-orange-400" : "bg-yellow-500/15 text-yellow-400"}`}><Icon size={13} /></span><span className="min-w-0 flex-1 truncate text-[11px] text-slate-200">{name}</span><span className="text-[9px] uppercase text-slate-500">{severity}</span></button>)}
              </div>
            </div>
          </section>
        )}

        <button type="button" disabled={!route} onClick={() => setNavigationStarted((started) => !started)} className={`mt-auto flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:bg-[#292940] disabled:text-slate-500 ${navigationStarted ? "bg-[#292940] text-white hover:bg-[#353550]" : "bg-[#d71920] text-white hover:bg-red-700"}`} data-node-id="2:650">
          <Navigation2 size={17} />{navigationStarted ? "End Navigation" : "Start Navigation"}
        </button>
      </section>
      <section className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#17232c] max-[760px]:min-h-[540px]" data-node-id="2:652">
        <img src="/safezone-map.png" alt="Satellite view of an iron ore export port with shiploaders, stockyards, and service roads" className="absolute inset-0 h-full w-full object-cover brightness-[0.78] saturate-[0.72]" />
        {routePath && <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 760" preserveAspectRatio="none" aria-label={`${route.label} route from Workshop 3 to ${destination}`}>
          <path d={routePath} fill="none" stroke={route.color} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" />
          <path d={routePath} fill="none" stroke={route.color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="safezone-route-line" />
          <circle cx="180" cy="100" r="10" fill="#22c55e" stroke="white" strokeWidth="4" />
          <circle cx={endX} cy={endY} r="12" fill="#d71920" stroke="white" strokeWidth="4" />
        </svg>}
        {route && activeRisks.map(({ name, severity, Icon, left, top }) => <button key={name} type="button" onClick={() => setSelectedRisk(selectedRisk === name ? null : name)} aria-label={`${name}, ${severity} risk`} aria-pressed={selectedRisk === name} title={name} className={`absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg transition-transform hover:scale-110 ${severity === "Critical" ? "border-red-200 bg-red-600 text-white" : severity === "High" ? "border-orange-200 bg-orange-500 text-white" : "border-yellow-200 bg-yellow-500 text-[#161625]"} ${selectedRisk === name ? "ring-4 ring-white/30" : ""}`} style={{ left, top }}><Icon size={15} strokeWidth={2.5} /></button>)}
        {activeRisk && <div className="absolute left-4 top-4 z-20 w-[min(270px,calc(100%-2rem))] rounded-lg border border-[#2e2e4a] bg-[#161625]/95 p-3 shadow-2xl" role="status" aria-live="polite"><div className="flex items-start gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-300"><activeRisk.Icon size={16} /></span><div className="min-w-0 flex-1"><div className="text-xs font-bold">{activeRisk.name}</div><div className="mt-1 text-[11px] text-slate-400">{activeRisk.detail}</div></div><button type="button" className="text-slate-400 hover:text-white" onClick={() => setSelectedRisk(null)} aria-label="Close hazard details"><X size={15} /></button></div></div>}
        {route && <div className="absolute left-4 top-4 rounded-lg border border-white/20 bg-[#111820]/80 px-3 py-2 text-xs font-semibold text-white shadow-lg">Workshop 3 <span className="mx-1 text-slate-300">→</span>{destination}</div>}
        {route && <aside className="absolute bottom-4 right-4 z-10 w-[210px] rounded-xl border border-white/20 bg-[#111820]/95 p-4 text-white shadow-2xl" aria-live="polite"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-400"><Navigation2 size={22} fill="currentColor" /></div><div><div className="text-2xl font-bold leading-none">{eta}</div><div className="mt-1 whitespace-nowrap text-[11px] text-slate-300">Arrive {arrivalTime}</div></div></div><div className="my-3 h-px bg-white/15" /><div className="flex items-end justify-between"><div><div className="text-lg font-bold">{distance}</div><div className="text-[11px] text-slate-300">to {destination}</div></div>{navigationStarted && <span className="rounded-full bg-green-500/15 px-2 py-1 text-[9px] font-bold text-green-300">NAVIGATING</span>}</div></aside>}
        {!route && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-[#111820]/80 px-4 py-2 text-xs text-white shadow-lg">Choose a route to preview directions</div>}
      </section>
    </main>
  );
}

const hazardCategories = [
  { label: "Damaged Barrier", Icon: ShieldAlert },
  { label: "Unsafe Condition", Icon: AlertTriangle },
  { label: "Falling Object Found", Icon: AlertTriangle },
  { label: "Loose Material", Icon: CircleX },
  { label: "Near Miss", Icon: AlertTriangle },
  { label: "Others", Icon: AlertTriangle },
];

function ReportHazard({ onCancel }: { onCancel: () => void }) {
  const [category, setCategory] = useState("Falling Object Found");
  const [evidenceName, setEvidenceName] = useState("");
  const [voiceNoteAdded, setVoiceNoteAdded] = useState(false);
  const [quickTextOpen, setQuickTextOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const suggestions = category === "Falling Object Found"
    ? ["Isolate Underneath", "Secure Kickplates", "Establish Exclusion Zone", "Install Mesh Guarding"]
    : category === "Damaged Barrier"
      ? ["Install Temporary Barrier", "Restrict Access", "Raise Maintenance Work Order"]
      : category === "Loose Material"
        ? ["Clear Spillage", "Mark Exclusion Area", "Inspect Conveyor Transfer"]
        : ["Assess Immediate Risk", "Notify Area Supervisor", "Establish Exclusion Zone"];

  return (
    <main className="safezone-report min-h-0 flex-1 overflow-y-auto bg-[#0d0d15] px-6 pb-6 max-[760px]:px-4" data-node-id="2:234">
      <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="mx-auto max-w-[892px]">
        <div className="mt-6 flex items-center justify-between gap-4" data-node-id="2:236">
          <div>
            <h1 className="text-[18px] font-bold leading-[25px]" data-node-id="2:238">Report Hazard</h1>
            <p className="mt-1 text-xs text-slate-400" data-node-id="2:239">Submit field intel to system intelligence</p>
          </div>
        </div>

        {submitted ? (
          <section className="mt-10 rounded-xl border border-green-500/30 bg-green-500/10 p-6" role="status" aria-live="polite">
            <div className="flex items-center gap-3 text-green-400"><Check size={20} /><h2 className="text-lg font-bold">Hazard report submitted</h2></div>
            <p className="mt-2 text-sm text-slate-300">Your {category.toLowerCase()} report has been recorded for supervisor review.</p>
            <button type="button" onClick={onCancel} className="mt-5 rounded-lg bg-[#d71920] px-5 py-3 text-sm font-bold hover:bg-red-700">Return to Map</button>
          </section>
        ) : <>
          <section className="mt-5" aria-labelledby="hazard-category-title" data-node-id="2:246">
            <h2 id="hazard-category-title" className="mb-2.5 text-sm font-bold text-slate-400" data-node-id="2:247">1. What did you find?</h2>
            <div className="grid grid-cols-2 gap-2.5 max-[600px]:grid-cols-1" data-node-id="2:248">
              {hazardCategories.map(({ label, Icon }, index) => <button key={label} type="button" onClick={() => setCategory(label)} aria-pressed={category === label} className={`report-category flex h-[100px] flex-col items-center justify-center gap-3 rounded-xl border-2 transition-colors ${category === label ? "border-[#d71920] bg-[#d71920]/10 text-[#ef272e]" : "border-[#2e2e4a] bg-[#161625] text-white hover:border-[#4b4b6b]"}`} data-node-id={["2:257", "2:265", "2:249", "2:253", "2:261", "44:13"][index]}><Icon size={26} strokeWidth={1.8} /><span className="text-center text-[13px] font-bold">{label}</span></button>)}
            </div>
          </section>

          <section className="mt-5" aria-labelledby="evidence-title" data-node-id="2:269">
            <h2 id="evidence-title" className="mb-2.5 text-sm font-bold text-slate-400" data-node-id="2:270">2. Capture Evidence</h2>
            <div className="grid grid-cols-4 gap-3 max-[760px]:grid-cols-2" data-node-id="2:271">
              <label className="flex min-h-[82px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-[#2e2e4a] bg-[#161625] text-center hover:bg-[#1e1e32]" data-node-id="2:272"><Camera size={23} /><span className="text-[13px] font-bold">{evidenceName || "Camera / Photo"}</span><input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => setEvidenceName(event.target.files?.[0]?.name ?? "")} aria-label="Attach a camera photo" /></label>
              <button type="button" onClick={() => setVoiceNoteAdded((added) => !added)} aria-pressed={voiceNoteAdded} className={`flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-xl border border-[#2e2e4a] text-center hover:bg-[#1e1e32] ${voiceNoteAdded ? "bg-green-500/10 text-green-300" : "bg-[#161625]"}`} data-node-id="2:276"><Mic size={23} /><span className="text-[13px] font-bold">{voiceNoteAdded ? "Voice Note Added" : "Voice Note"}</span></button>
              <button type="button" onClick={() => setQuickTextOpen((open) => !open)} aria-expanded={quickTextOpen} className={`flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-xl border border-[#2e2e4a] text-center hover:bg-[#1e1e32] ${quickTextOpen ? "bg-[#1e1e32]" : "bg-[#161625]"}`} data-node-id="2:280"><FileText size={23} /><span className="text-[13px] font-bold">Quick Text</span></button>
              <button type="button" className="flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-xl border border-[#2e2e4a] bg-[#161625] text-center" data-node-id="2:284"><MapPin size={23} /><span className="text-[13px] font-bold">GPS Coordinates</span><span className="text-[11px] font-bold text-green-500">-20.6134, 117.1895</span></button>
            </div>
            {quickTextOpen && <label className="mt-3 block text-xs font-semibold text-slate-400">Quick observation<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} placeholder="Add a short description of what you observed..." className="mt-1.5 block w-full resize-y rounded-lg border border-[#2e2e4a] bg-[#161625] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#d71920]" /></label>}
            {evidenceName && <p className="mt-2 truncate text-xs text-green-400" role="status">Photo attached: {evidenceName}</p>}
          </section>

          <section className="mt-5 rounded-xl border border-[#2e2e4a] bg-[#161625] p-4" data-node-id="2:289">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-[13px] font-bold"><Sparkles size={16} className="text-[#d71920]" />AI Smart Suggester</h2>
              <span className="flex items-center gap-1.5 rounded-lg bg-yellow-500/10 px-2.5 py-1 text-[11px] font-bold text-yellow-500"><i className="h-1.5 w-1.5 rounded-full bg-yellow-500" />Suggested: MODERATE</span>
            </div>
            <p className="mt-3 text-[13px] text-slate-400">Suggested controls to apply based on “{category}” near conveyor structural elements:</p>
            <div className="mt-2 flex flex-wrap gap-2">{suggestions.map((suggestion) => <span key={suggestion} className="rounded-full border border-[#2e2e4a] bg-[#1e1e32] px-2.5 py-1.5 text-[11px] font-bold">{suggestion}</span>)}</div>
          </section>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pb-1" data-node-id="2:309">
            <button type="button" onClick={onCancel} className="h-[43px] rounded-lg border border-[#2e2e4a] px-6 text-sm font-bold text-slate-400 hover:bg-[#161625]" data-node-id="2:310">Cancel &amp; Discard</button>
            <button type="submit" className="h-[43px] rounded-lg bg-[#d71920] px-8 text-sm font-bold text-white hover:bg-red-700" data-node-id="2:312">Submit Hazard Report</button>
          </div>
        </>}
      </form>
    </main>
  );
}

export default function Index() {
  const [activeNav, setActiveNav] = useState("Map");
  const [lightMode, setLightMode] = useState(false);
  const [activeLayers, setActiveLayers] = useState(["Falling Objects", "Active Work Fronts"]);
  const [search, setSearch] = useState("");
  const [showAllAlerts, setShowAllAlerts] = useState(true);

  const visibleAlerts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return alerts.filter((alert) =>
      `${alert.title} ${alert.location}`.toLowerCase().includes(query),
    );
  }, [search]);

  const toggleLayer = (label: string) => {
    setActiveLayers((current) =>
      current.includes(label)
        ? current.filter((layer) => layer !== label)
        : [...current, label],
    );
  };

  const openReport = () => setActiveNav("Report");

  if (activeNav === "Dashboard") {
    return <ExecutiveDashboard onNavigate={setActiveNav} lightMode={lightMode} onToggleTheme={() => setLightMode((current) => !current)} />;
  }

  if (activeNav === "People") {
    return <WorkerAwareness onNavigate={setActiveNav} lightMode={lightMode} onToggleTheme={() => setLightMode((current) => !current)} />;
  }

  if (activeNav === "Areas") {
    return <AreaIntelligence onNavigate={setActiveNav} lightMode={lightMode} onToggleTheme={() => setLightMode((current) => !current)} />;
  }

  if (activeNav === "Incidents") {
    return <IncidentInvestigation onNavigate={setActiveNav} lightMode={lightMode} onToggleTheme={() => setLightMode((current) => !current)} />;
  }

  return (
    <div className={`safezone flex h-screen min-h-[620px] w-full overflow-hidden bg-[#0d0d15] font-sans text-white ${lightMode ? "safezone-light" : ""}`}>
      <aside
        className="flex w-[90px] shrink-0 flex-col items-center border-r border-[#2e2e4a] bg-[#161625] max-[760px]:w-[68px]"
        data-node-id="2:8"
      >
        <div
          className="mt-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#d71920] text-lg font-bold"
          data-node-id="2:9"
        >
          RT
        </div>
        <div className="mt-4 h-px w-12 bg-[#2e2e4a]" data-node-id="2:11" />
        <nav className="mt-4 flex w-full flex-col items-center gap-3" data-node-id="2:12">
          {navItems.map(({ label, Icon, nodeId, routeNodeId }) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveNav(label)}
              className={`flex h-[60px] w-[76px] flex-col items-center justify-center gap-1.5 rounded-lg transition-colors max-[760px]:w-[58px] ${
                activeNav === label ? "bg-[#d71920]" : "hover:bg-[#24243a]"
              }`}
              aria-label={label}
              aria-current={activeNav === label ? "page" : undefined}
              data-node-id={activeNav === "Routes" ? routeNodeId : nodeId}
            >
              <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          ))}
          <button type="button" onClick={() => setLightMode((current) => !current)} className="mt-2 flex h-[52px] w-[76px] flex-col items-center justify-center gap-1 rounded-lg transition-colors hover:bg-[#24243a] max-[760px]:w-[58px]" aria-label={`Switch to ${lightMode ? "dark" : "light"} mode`} aria-pressed={lightMode}><span className="flex h-6 w-6 items-center justify-center">{lightMode ? <Moon size={19} /> : <Sun size={19} />}</span><span className="text-[9px] font-medium">{lightMode ? "Dark mode" : "Light mode"}</span></button>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#2e2e4a] bg-[#161625] px-6 max-[1050px]:px-4 max-[760px]:h-auto max-[760px]:min-h-[72px] max-[760px]:flex-wrap max-[760px]:gap-3 max-[760px]:py-3"
          data-node-id="2:46"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex shrink-0 items-center gap-3" data-node-id="2:48">
              <span className="text-xl font-bold tracking-wide text-[#d71920]">RIO TINTO</span>
              <span className="h-5 w-[3px] bg-[#2e2e4a]" />
              <span className="text-[15px] text-slate-400">SafeZone</span>
            </div>
            <label
              className="flex h-[34px] w-[280px] items-center gap-2 rounded-lg bg-[#1e1e32] px-3 text-slate-400 max-[1100px]:w-[220px] max-[850px]:hidden"
              data-node-id="2:52"
            >
              <Search size={16} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assets, zones, routes..."
                className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-slate-500"
                aria-label="Search alerts and locations"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </label>
          </div>

          <div className="flex shrink-0 items-center gap-5" data-node-id="2:56">
            <div className="flex h-[23px] items-center gap-2 rounded-full bg-green-500/10 px-3 text-[11px] font-bold tracking-wide text-green-500" data-node-id="2:57">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              SITE ONLINE
            </div>
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e32] hover:bg-[#28283e]"
              aria-label="Notifications: 3 unread"
              data-node-id="2:60"
            >
              <AlarmClock size={20} />
              <span className="absolute -right-0.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d71920] text-[9px] font-bold" data-node-id="2:63">3</span>
            </button>
            <button className="flex items-center gap-2.5 text-left" type="button" aria-label="User profile" data-node-id="2:65">
              <span className="h-[38px] w-[38px] rounded-full border-2 border-[#d71920] p-[2px]" data-node-id="2:66">
                <img src="/safezone-avatar.png" alt="" className="h-full w-full rounded-full object-cover" data-node-id="2:67" />
              </span>
              <span className="hidden min-w-[96px] sm:block" data-node-id="2:68">
                <span className="block text-[13px] font-bold leading-[18px]">D. Fletcher</span>
                <span className="block text-[10px] leading-[14px] text-slate-400">Port Superintendent</span>
              </span>
            </button>
          </div>
        </header>

        {activeNav === "Alerts" ? <AlertFeed /> : activeNav === "Routes" ? <RoutePlanner /> : activeNav === "Report" ? <ReportHazard onCancel={() => setActiveNav("Map")} /> : <main className="flex min-h-0 flex-1 max-[900px]:overflow-y-auto max-[760px]:flex-col" data-node-id="2:71">
          <section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#0d0d15] max-[760px]:min-h-[540px] max-[760px]:flex-none" data-node-id="2:72">
            <div className="z-10 flex h-[60px] shrink-0 items-center gap-2 overflow-x-auto bg-[#161625] px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-node-id="2:73">
              {layers.map(({ label, nodeId }) => {
                const selected = activeLayers.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleLayer(label)}
                    aria-pressed={selected}
                    className={`flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-[#2e2e4a] px-3 text-xs font-bold transition-colors ${selected ? "bg-[#d71920] text-white" : "bg-[#1e1e32] text-white hover:bg-[#28283e]"}`}
                    data-node-id={nodeId}
                  >
                    {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden" data-node-id="2:86">
              <img
                src="/safezone-map.png"
                alt="Aerial heatmap of the port showing work zones and hazard areas"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[#0d0d15]/10" />

              <div className="absolute left-[19%] top-[24%] flex h-[23px] items-center gap-1.5 rounded-full bg-black/65 px-2.5 text-[11px] font-bold" data-node-id="2:87">
                <span className="h-2 w-2 rounded-full bg-blue-500" />Maint (8)
              </div>
              <div className="absolute left-[62%] top-[36%] flex h-[23px] items-center gap-1.5 rounded-full bg-black/65 px-2.5 text-[11px] font-bold" data-node-id="2:90">
                <span className="h-2 w-2 rounded-full bg-orange-500" />Rail (4)
              </div>
              <div className="absolute left-[34%] top-[54%] flex h-[23px] items-center gap-1.5 rounded-full bg-black/65 px-2.5 text-[11px] font-bold" data-node-id="2:93">
                <span className="h-2 w-2 rounded-full bg-teal-500" />Port Ops (15)
              </div>

              <div className="absolute left-[75%] top-[28%]" data-node-id="2:96">
                <span className="absolute -left-5 -top-5 h-10 w-10 rounded-full bg-red-500/20" />
                <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-red-500/50" />
                <span className="relative block h-3 w-3 rounded-full bg-red-500" data-node-id="2:99" />
                <div className="absolute left-0 top-6 whitespace-nowrap rounded border border-red-500 bg-[#12121a]/90 px-2 py-1 text-[11px] font-bold" data-node-id="2:100">
                  CRITICAL RISK: Shiploader 2
                </div>
              </div>

              <div className="absolute bottom-4 left-4 rounded-lg border border-[#2e2e4a] bg-[#161625]/90 px-3 py-2.5" data-node-id="2:102">
                <div className="mb-2 text-[11px] font-bold text-slate-400" data-node-id="2:103">SEVERITY LEGEND</div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-red-500" />Critical</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-orange-500" />Elevated</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-yellow-500" />Moderate</span>
                </div>
              </div>

              <button
                type="button"
                onClick={openReport}
                className="absolute bottom-6 right-6 flex h-[47px] items-center gap-2 rounded-full bg-[#d71920] px-5 text-sm font-bold shadow-lg transition-colors hover:bg-red-700"
                data-node-id="2:114"
              >
                <Plus size={18} strokeWidth={2.5} />Report Hazard
              </button>
            </div>
          </section>

          <aside className="w-[320px] shrink-0 overflow-y-auto border-l border-[#2e2e4a] bg-[#161625] px-5 pt-5 max-[900px]:w-[300px] max-[760px]:w-full max-[760px]:overflow-visible" data-node-id="2:118">
            <section data-node-id="2:119">
              <h2 className="mb-3 text-sm font-bold text-slate-400">Safety Telemetry</h2>
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="h-[90px] rounded-lg border border-[#2e2e4a] bg-[#1e1e32] p-3" data-node-id={metric.nodeId}>
                    <div className="text-[22px] font-bold leading-[30px]" style={{ color: metric.color }}>{metric.value}</div>
                    <div className="mt-1 text-[11px] font-medium text-slate-400">{metric.label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 pb-5" data-node-id="2:134">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-400">Live Alert Stream</h2>
                <button
                  type="button"
                  onClick={() => setShowAllAlerts((value) => !value)}
                  className="text-xs font-bold text-[#d71920] hover:text-red-400"
                  data-node-id="2:137"
                >
                  {showAllAlerts ? "Show less" : "See All"}
                </button>
              </div>
              <div className="space-y-2.5" data-node-id="2:138">
                {(showAllAlerts ? visibleAlerts : visibleAlerts.slice(0, 3)).map((alert) => (
                  <article key={alert.id} className="min-h-[63px] rounded-lg border border-[#2e2e4a] bg-[#1e1e32] px-3 py-2.5" data-node-id={alert.id}>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${alert.severity === "critical" ? "bg-red-500" : alert.severity === "elevated" ? "bg-orange-500" : "bg-yellow-500"}`} />
                      <h3 className="truncate text-xs font-bold text-white" title={alert.title}>{alert.title}</h3>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span className="flex min-w-0 items-center gap-1 truncate"><MapPin size={12} className="shrink-0" />{alert.location}</span>
                      <span className="flex shrink-0 items-center gap-1"><Clock3 size={11} />{alert.time}</span>
                    </div>
                  </article>
                ))}
                {visibleAlerts.length === 0 && (
                  <p className="rounded-lg border border-[#2e2e4a] bg-[#1e1e32] px-3 py-4 text-xs text-slate-400">No alerts match “{search}”.</p>
                )}
              </div>
            </section>
          </aside>
        </main>}
      </div>

    </div>
  );
}
