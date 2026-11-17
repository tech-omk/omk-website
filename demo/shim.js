// DEMO MODE: the whole app runs against a fake backend inside this page. Nothing reaches the real OMK database.
import { fresh, makeHandler, U, DAY, tile } from './backend.js';
import logoUrl from './logo.png';
import bootUrl from './boot-3d.jpg';
const LOCAL = { '/logo.png': logoUrl, '/boot-3d.jpg': bootUrl };


// Keep the demo apart from the live app on the same phone: its saved login, drafts and offline queue
// live under their own names, so the demo can never use or clear the real ones.
const AUTH = 'sb-iwnmvhjpcklehvwaixas-auth-token';
export const REAL_SESSION = (() => { try { return JSON.parse(localStorage.getItem(AUTH) || 'null'); } catch { return null; } })();
const SP = Storage.prototype, g = SP.getItem, st = SP.setItem, rm = SP.removeItem;
const dk = (k) => 'demo:' + k;
SP.getItem = function (k) { return g.call(this, dk(k)); };
SP.setItem = function (k, v) { return st.call(this, dk(k), v); };
SP.removeItem = function (k) { return rm.call(this, dk(k)); };
try { const open = indexedDB.open.bind(indexedDB); indexedDB.open = (name, v) => open('demo-' + name, v); } catch { /* */ }

const realFetch = window.fetch.bind(window);
// only owners/admins open the demo: checked against the real login on this phone
export const LIVE = /omk-ops.*\.vercel\.app$/.test(location.hostname);
export async function allowed() {
  if (!LIVE) return true;   // the separate test page (not inside the live app)
  const t = REAL_SESSION; if (!t?.access_token || !t.user?.id) return false;
  try { const r = await realFetch(`https://iwnmvhjpcklehvwaixas.supabase.co/rest/v1/people?id=eq.${t.user.id}&select=role`, { headers: { apikey: 'sb_publishable_b3QXajWwPbdRr4oZgMwS-g_CEARMC0E', Authorization: 'Bearer ' + t.access_token } });
    const rows = r.ok ? await r.json() : []; return ['owner', 'admin'].includes(rows[0]?.role); } catch { return false; }
}

const HOST = 'iwnmvhjpcklehvwaixas.supabase.co';
const DBKEY = 'omk-demo-db', WHO = 'omk-demo-who';
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* private window */ } } };

export const ROLES = [
  { id: U(1), label: 'Staff', sub: 'Hasmath · Kitchen Helper · RR Nagar' },
  { id: U(2), label: 'Senior chef', sub: 'Jayanth · RR Nagar' },
  { id: U(9), label: 'Staff (not checked in)', sub: 'Ramesh · Chef · RR Nagar' },
  { id: U(3), label: 'Store incharge', sub: 'Karthikeya · RR Nagar' },
  { id: U(6), label: 'Store incharge', sub: 'Sunil · JP Nagar' },
  { id: U(7), label: 'Ops manager', sub: 'Chandrashekhara · both outlets' },
  { id: U(8), label: 'Admin', sub: 'David · everything' },
  { id: '00000000-0000-0000-0000-000000000110', label: 'Owner', sub: 'Dilip · everything' },
];

const iso = (h, m, dd = 0) => new Date(Date.parse(`${DAY}T00:00:00+05:30`) + (h * 60 + m) * 60e3 + dd * 864e5).toISOString();   // minutes may run past 0/60
function seed() {
  const T = fresh();
  T.salaries = [[1, 18000], [2, 24000], [3, 25000], [4, 20000], [5, 22000], [6, 27000], [7, 30000], [9, 22000]].map(([n, m]) => ({ person_id: U(n), monthly: m }));
  // ---- a full team for testing: more staff at both outlets ----
  const X = (n) => `00000000-0000-0000-0000-0000000001${String(n).padStart(2, '0')}`;
  const extra = [[1, 'Santhosh', 'chef', 'rr', '10:00', 'Chef and Inventory Incharge']];
  extra.forEach(([n, name, role, o, sh, des], i) => {
    T.people.push({ id: X(n), name, phone: '98450001' + String(n).padStart(2, '0'), role, designation: des, outlet_id: o, shift_start: sh + ':00', active: true });
    T.attendance.push({ id: 900 + n, person_id: X(n), outlet_id: o, day: DAY, kind: 'in', at: iso(Number(sh.slice(0, 2)), Number(sh.slice(3)) - 5 + i), selfie_path: `${o}/s/x${n}.jpg`, distance_m: 10 + i });
  });
  // ---- tasks: a realistic day for every staff member ----
  const MGR = { rr: U(3), jp: U(6) };
  let id = 500; T.tasks = [];
  const tk = (to, o, title, status, x = {}) => T.tasks.push({ id: id++, outlet_id: o, title, note: null, priority: 'normal', due_at: iso(16, 0), assigned_to: to, assigned_by: MGR[o], created_at: iso(10, 15),
    status, photos: [], history: [], for_day: DAY, photo_required: true, ...x });
  const P = (o, k, n = 2) => Array.from({ length: n }, (_, i) => `${o}/x/${k}-${i}.jpg`);
  const CHEF = [['Arrange washed vessels', 10, 45], ['Boil eggs (1st batch)', 11, 10], ['Prep egg mix (evening)', 12, 5], ['Top-up sauces & pastes', 12, 20], ['Label containers', 12, 40], ['Prep onions & chillies', 13, 0]];
  const HK = [['Washroom cleaning', 11, 40], ['Empty dustbins', 12, 0], ['Arrange tables & chairs', 12, 25], ['Wipe menu boards', 12, 50]];
  const done = (to, o, list) => list.forEach(([t, h, m]) => tk(to, o, t, 'approved', { photos: P(o, t.length), submitted_at: iso(h, m - 4), decided_at: iso(h, m), decided_by: MGR[o] }));
  const check = (to, o, title, h, m, x = {}) => tk(to, o, title, 'submitted', { photos: P(o, title.length + m), submitted_at: iso(h, m), ...x });
  // RR Nagar
  done(U(2), 'rr', CHEF.slice(0, 4));
  check(U(2), 'rr', 'Prepare fried rice base', 14, 10, { priority: 'urgent', note: 'Prepare egg fried rice base (5 kg).\nFollow OMK recipe v3.0.\nKeep it in labelled containers.\nMaintain temperature & hygiene.', done_note: 'Rice base prepared (3 kg). Remaining 2 kg will be completed by 03:30 PM.' });
  tk(U(2), 'rr', 'Refill ingredient stock', 'open', { due_at: iso(9, 30) });
  tk(U(2), 'rr', 'Boil eggs (2nd batch)', 'in_progress', { started_at: iso(13, 40), qty_label: 'Boiled egg quantity', qty_unit: 'eggs' });
  done(U(1), 'rr', [['Arrange washed vessels', 10, 40], ['Empty dustbins', 12, 0]]);
  check(U(1), 'rr', 'Kitchen floor mopping', 13, 20, { done_note: 'Mopped twice, floor still drying near the sink.' });
  tk(U(1), 'rr', 'Dining area cleaning', 'rejected', { photos: P('rr', 'din'), submitted_at: iso(12, 30), reject_note: 'Corner tables still dusty', note: 'Wipe all tables and chairs.\nClean under the counter.' });
  tk(U(1), 'rr', 'Clean glass door', 'open', { priority: 'low' });
  tk(U(9), 'rr', 'Top up sauces (schezwan, mayo)', 'rejected', { photos: P('rr', 'sauce', 1), submitted_at: iso(11, 50), reject_note: 'Mayo bottle still half empty' });
  tk(U(9), 'rr', 'Check gas cylinder', 'open', { priority: 'urgent', due_at: iso(11, 0) });
  done(X(1), 'rr', CHEF.slice(0, 5)); check(X(1), 'rr', 'Clean the fryer', 13, 55, { note: 'Drain the oil.\nWipe the basket and walls.', done_note: 'Oil changed too.' }); tk(X(1), 'rr', 'Prep onions & chillies', 'in_progress', { started_at: iso(14, 0) });
  // JP Nagar
  done(U(5), 'jp', CHEF.slice(0, 4)); check(U(5), 'jp', 'Prepare fried rice base', 13, 50, { done_note: 'Full 5 kg done.' }); tk(U(5), 'jp', 'Refill ingredient stock', 'open');
  done(U(4), 'jp', CHEF.slice(0, 3)); check(U(4), 'jp', 'Count store stock', 12, 30);
  // tasks the ops manager gave the store incharges (they show in the manager's My Tasks)
  const ops = (to, o, title, status, x = {}) => tk(to, o, title, status, { assigned_by: U(7), created_at: iso(9, 30), ...x });
  ops(U(3), 'rr', 'Count the cash drawer', 'open', { due_at: iso(17, 0), note: 'Count notes and coins.\nPhoto of the count sheet.' });
  ops(U(3), 'rr', 'Check fridge temperatures', 'submitted', { photos: P('rr', 'fr'), submitted_at: iso(12, 0), done_note: 'All 3 fridges at 3–4 °C.' });
  ops(U(3), 'rr', 'Order packing boxes', 'approved', { photos: P('rr', 'box', 1), submitted_at: iso(11, 0), decided_at: iso(11, 30), decided_by: U(7) });
  ops(U(6), 'jp', 'Count the cash drawer', 'open', { due_at: iso(17, 0) });
  // tasks the owner gave the ops manager (they show in the ops manager's My Tasks; David verifies them)
  tk(U(7), null, 'Visit JP Nagar and check the cold room', 'open', { assigned_by: U(8), created_at: iso(9, 0), due_at: iso(18, 0), note: 'Check temperatures.\nPhoto of the cold room log.' });
  tk(U(7), null, 'Review the weekly report with both managers', 'submitted', { assigned_by: U(8), created_at: iso(9, 0), photos: P('hq', 'wk'), submitted_at: iso(13, 15), done_note: 'Discussed late check-ins and egg wastage.' });
  tk(U(7), null, 'Confirm Diwali staff plan', 'approved', { assigned_by: U(8), created_at: iso(9, 0), photos: P('hq', 'dw', 1), submitted_at: iso(11, 0), decided_at: iso(11, 20), decided_by: U(8) });
  // requests to the ops manager
  const tom = new Date(Date.parse(`${DAY}T12:00:00Z`) + 864e5).toISOString().slice(0, 10);
  T.requests = [
    { id: 960, person_id: X(1), outlet_id: 'rr', kind: 'emergency_leave', details: { from: DAY, days: 2 }, note: 'Mother admitted in hospital', status: 'pending', created_at: iso(9, 40) },
    { id: 961, person_id: U(1), outlet_id: 'rr', kind: 'shift_change', details: { day: tom, shift: 2 }, note: 'College exam in the morning', status: 'pending', created_at: iso(11, 15) },
    { id: 962, person_id: U(3), outlet_id: 'rr', kind: 'material', details: { item: 'Gas cylinder', qty: 2, unit: 'nos', urgent: true }, note: 'Backup cylinder also empty', status: 'pending', created_at: iso(12, 30) },
    { id: 963, person_id: U(6), outlet_id: 'jp', kind: 'material', details: { item: 'Cling film', qty: 5, unit: 'rolls' }, note: null, status: 'pending', created_at: iso(13, 5) },
    { id: 964, person_id: U(4), outlet_id: 'jp', kind: 'shift_change', details: { day: tom, off: true }, note: 'Need tomorrow off', status: 'rejected', decided_by: U(7), decided_at: iso(10, 0), decide_note: 'Two people already off tomorrow', created_at: iso(8, 50) },
    { id: 965, person_id: U(2), outlet_id: 'rr', kind: 'material', details: { item: 'Gloves', qty: 3, unit: 'boxes' }, note: null, status: 'approved', decided_by: U(7), decided_at: iso(10, 30), created_at: iso(9, 10) },
  ];
  // the manager's own checklists: opening done, mid-shift and closing still to do
  const items = (cid) => T.checklist_items.filter((i) => i.checklist_id === cid);
  const allYes = (cid, o) => Object.fromEntries(items(cid).map((i) => [i.id, i.type === 'yn' ? { v: 'y' } : i.type === 'num' ? { n: i.min_val ?? i.max_val ?? 0 } : i.type === 'photo' ? { photos: P(o, i.id) } : i.type === 'ba' ? { before: P(o, i.id + 'b'), after: P(o, i.id + 'a'), bt: iso(11, 0), at: iso(11, 20) } : { v: 'y' }]));
  T.runs = T.runs.filter((r) => !(r.outlet_id === 'rr' && r.checklist_id === 'mgr_open'));
  T.runs.push({ id: 880, outlet_id: 'rr', checklist_id: 'mgr_open', day: DAY, by_person: U(3), submitted_at: iso(11, 5), status: 'done', answers: allYes('mgr_open', 'rr') });
  T.advances = [
    { id: 601, person_id: U(9), outlet_id: 'rr', amount: 5000, reason: 'Personal expense', status: 'requested', requested_at: iso(9, 30) },
    { id: 602, person_id: U(5), outlet_id: 'jp', amount: 4000, reason: 'Rent', status: 'approved', decided_by: U(8), decided_at: iso(10, 0), requested_at: iso(9, 0, -1) },
    { id: 603, person_id: U(2), outlet_id: 'rr', amount: 3000, reason: 'Medical', status: 'disbursed', decided_by: U(8), disbursed_at: iso(18, 0, -6), deduct_month: DAY.slice(0, 8) + '01', requested_at: iso(9, 0, -7) },
  ];
  T.announcements = [{ id: 701, outlet_id: null, title: 'Diwali timings', body: 'Both outlets open 10 am to 11 pm this week. Full team on duty.', by_person: U(8), at: iso(9, 0) }];
  T.warnings = [{ id: 711, person_id: U(9), outlet_id: 'rr', level: 1, reason: 'Late 3 times this week', by_person: U(3), at: iso(18, 0, -2) }];
  T.training_videos = [{ id: 721, title: 'How to boil and peel eggs fast', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', role: null, active: true, at: iso(9, 0, -3) },
    { id: 722, title: 'Refilling sauces the right way', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', role: 'chef', active: true, at: iso(9, 0, -2) },
    { id: 723, title: 'Washroom cleaning checklist', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', role: 'housekeeping', active: true, at: iso(9, 0, -2) }];
  T.training_assignments = [{ id: 731, video_id: 722, person_id: U(9), reason: 'Task sent back: Top up sauces – mayo bottle still half empty', assigned_by: U(7), at: iso(12, 10), done_at: null },
    { id: 733, video_id: 723, person_id: U(1), reason: 'Washroom photos sent back twice – floor still wet', assigned_by: U(7), at: iso(12, 30), done_at: null },
    { id: 732, video_id: 721, person_id: U(2), reason: 'Eggs were overcooked twice this week', assigned_by: U(7), at: iso(10, 0, -1), done_at: iso(15, 0, -1) }];
  T.training_done = [{ video_id: 721, person_id: U(2) }];
  // escalations to the ops manager
  T.escalations = [
    { id: 751, person_id: U(1), outlet_id: 'rr', category: 'electrical', what: 'Bulb above the billing counter is not working', urgent: false, photo: null, status: 'open', created_at: iso(12, 40) },
    { id: 752, person_id: U(5), outlet_id: 'jp', category: 'gas', what: 'Gas smell near burner 3 – cylinder switched off', urgent: true, photo: null, status: 'open', created_at: iso(13, 20) },
    { id: 753, person_id: U(3), outlet_id: 'rr', category: 'breakage', what: '6 plates broken during rush, need replacement', urgent: false, photo: null, status: 'working', handled_by: U(7), working_at: iso(12, 0), note: 'New plates coming tomorrow', created_at: iso(11, 30) },
    { id: 754, person_id: U(2), outlet_id: 'rr', category: 'water', what: 'Kitchen sink tap leaking', urgent: false, photo: null, status: 'solved', handled_by: U(7), solved_at: iso(17, 0, -1), note: 'Plumber changed the tap', created_at: iso(10, 0, -1) }];
  // stock list and last night's closing count (RR Nagar only, so JP Nagar shows the 'no closing count' note)
  T.count_items = [['Boiled eggs', 'nos', 50], ['Fried kulfi', 'nos', 10], ['Tortilla', 'nos', 10], ['Diet coke', 'nos', 20], ['Boiled rice', 'kg', 2], ['Chopped onion', 'kg', 1], ['Chopped capsicum', 'kg', 1],
    ['Chopped cabbage', 'kg', 2], ['Chopped tomato', 'kg', 0.5], ['Brownie', 'nos', 30], ['Breads', 'nos', 3]].map(([name, unit], i) => ({ id: 761 + i, name, unit, sort: i + 1, active: true }));
  const yday = new Date(Date.parse(`${DAY}T12:00:00Z`) - 864e5).toISOString().slice(0, 10);
  T.stock_counts = [50, 10, 10, 20, 2, 1, 1, 2, 0.5, 30, 3].map((q, i) => ({ outlet_id: 'rr', day: yday, kind: 'closing', item_id: 761 + i, qty: q, by_person: U(3), at: iso(22, 40, -1) }));
  T.ops_audits = [{ outlet_id: 'rr', day: yday, step: 'inventory', answers: { reason: 'Staff food', reason_note: '4 eggs used for staff breakfast' }, by_person: U(7), at: iso(10, 20, -1) }];
  // today's preparation plan for RR Nagar (JP Nagar left empty so the 'not saved yet' state shows too)
  T.prep_plans = [{ outlet_id: 'rr', day: DAY, slot: 'morning', updated_by: U(7), at: iso(9, 40), items: [
    { name: 'Boiled eggs', qty: 100, unit: 'pcs', assigned_to: U(2) }, { name: 'Chopped onion', qty: 2, unit: 'kg', assigned_to: U(2) }, { name: 'Chopped capsicum', qty: 1, unit: 'kg', assigned_to: U(2) },
    { name: 'Chopped cabbage', qty: 2, unit: 'kg', assigned_to: U(2) }, { name: 'Rice preparation', qty: 10, unit: 'kg', assigned_to: U(9) }, { name: 'Gravy / base preparation', qty: 5, unit: 'kg', assigned_to: U(9) },
    { name: 'Ingredient arrangement', qty: null, unit: 'as per plan', assigned_to: U(1) }] },
    { outlet_id: 'rr', day: DAY, slot: 'evening', updated_by: U(7), at: iso(15, 50), items: [{ name: 'Boiled eggs', qty: 60, unit: 'pcs', assigned_to: U(2) }, { name: 'Rice preparation', qty: 6, unit: 'kg', assigned_to: U(9) }, { name: 'Chopped onion', qty: 1, unit: 'kg', assigned_to: U(2) }] },
    { outlet_id: 'jp', day: new Date(Date.parse(`${DAY}T12:00:00Z`) - 864e5).toISOString().slice(0, 10), slot: 'morning', updated_by: U(7), at: iso(9, 30, -1), items: [{ name: 'Boiled eggs', qty: 80, unit: 'pcs', assigned_to: U(5) }, { name: 'Rice preparation', qty: 8, unit: 'kg', assigned_to: U(5) }] }];
  // today's briefings: opening sent to both outlets (some have read it), mid-day not sent yet
  T.briefings = [{ id: 741, day: DAY, kind: 'opening', outlet_id: null, body: 'Good morning team!\n1. Diwali rush today – everyone on the floor by 11.\n2. Check egg stock before opening.\n3. Push egg kulfi with every order.', sent_by: U(7), at: iso(10, 15) }];
  T.briefing_acks = [{ briefing_id: 741, person_id: U(2), acked_at: iso(10, 40) }, { briefing_id: 741, person_id: U(6), acked_at: iso(10, 50), explained_at: iso(11, 5) },
    { briefing_id: 741, person_id: U(5), acked_at: iso(11, 2) }, { briefing_id: 741, person_id: X(1), acked_at: iso(10, 55) }];
  const mon = (() => { const d = new Date(DAY + 'T12:00:00Z'); return new Date(d.getTime() - ((d.getUTCDay() || 7) - 1) * 864e5).toISOString().slice(0, 10); })();
  const addD = (d, n) => new Date(new Date(d + 'T12:00:00Z').getTime() + n * 864e5).toISOString().slice(0, 10);
  [1, 2, 9, 3].forEach((n, k) => { for (let i = 0; i < 7; i++) T.roster.push({ person_id: U(n), day: addD(mon, i), outlet_id: 'rr', shift_id: i === (k + 2) % 7 ? null : (k % 2 ? 2 : 1), off: i === (k + 2) % 7 }); });
  T.staff_steps = [{ person_id: U(2), day: DAY, list: 'sc_open', step: 'grooming', status: 'submitted', by_person: U(2), at: iso(10, 50), answers: { uniform: 'yes', hair: 'yes', nails: 'yes', grooming: 'yes', issue: 'no', photos: [] } }];
  // ---- leftover counts and wastage from the senior chefs (Closing checklist), yesterday and tonight → the ops manager's Inventory management table ----
  { const Y = new Date(Date.parse(`${DAY}T12:00:00Z`) - 864e5).toISOString().slice(0, 10), unit = Object.fromEntries(T.count_items.map((i) => [i.name, i.unit]));
    const stock = (m) => ({ stock: Object.entries(m).map(([item, closing]) => ({ id: (T.count_items.find((i) => i.name === item) || {}).id, item, unit: unit[item], closing })) });
    const step = (pid, d, k, answers, h, m, dd, st) => T.staff_steps.push({ person_id: pid, day: d, list: 'sc_close', step: k, status: st, answers, by_person: pid, at: iso(h, m, dd) });
    // Jayanth, RR Nagar
    step(U(2), Y, 'cstock', stock({ 'Boiled eggs': 12, 'Fried kulfi': 20, 'Tortilla': 30, 'Diet coke': 48, 'Boiled rice': 3, 'Chopped onion': 0.5, 'Chopped capsicum': 0.3, 'Chopped cabbage': 0.4, 'Chopped tomato': 1, 'Brownie': 15, 'Breads': 24 }), 22, 40, -1, 'approved');
    step(U(2), DAY, 'cstock', stock({ 'Boiled eggs': 8, 'Fried kulfi': 14, 'Tortilla': 22, 'Diet coke': 31, 'Boiled rice': 2.5, 'Chopped onion': 0.4, 'Chopped capsicum': 0.2, 'Chopped cabbage': 0.6, 'Chopped tomato': 0.6, 'Brownie': 9, 'Breads': 16 }), 22, 38, 0, 'submitted');
    step(U(2), DAY, 'ckitchen', { cleaning: 'yes', verified: 'yes', pending: 'no', quality: 'no', mopping: 'yes', packed: 'yes', photos: [], after: [] }, 22, 52, 0, 'submitted');
    step(U(2), DAY, 'cleft', { reported: 'yes', unreported: 'no', stored: 'yes', discrepancy: 'no', photos: [], waste: [{ item: 'Boiled eggs', qty: 6, unit: 'nos', rate: 7 }, { item: 'Chopped onion', qty: 0.3, unit: 'kg', rate: 40 }, { item: 'Boiled rice', qty: 0.5, unit: 'kg', rate: 60 }] }, 23, 4, 0, 'submitted');
    // Himal, JP Nagar
    step(U(5), Y, 'cstock', stock({ 'Boiled eggs': 9, 'Fried kulfi': 16, 'Tortilla': 25, 'Diet coke': 36, 'Boiled rice': 2, 'Chopped onion': 0.4, 'Chopped capsicum': 0.2, 'Chopped cabbage': 0.3, 'Chopped tomato': 0.8, 'Brownie': 12, 'Breads': 18 }), 22, 45, -1, 'approved');
    step(U(5), DAY, 'cstock', stock({ 'Boiled eggs': 26, 'Fried kulfi': 11, 'Tortilla': 19, 'Diet coke': 28, 'Boiled rice': 1.5, 'Chopped onion': 0.3, 'Chopped capsicum': 0.1, 'Chopped cabbage': 0.2, 'Chopped tomato': 0.5, 'Brownie': 7, 'Breads': 12 }), 22, 41, 0, 'submitted');
    step(U(5), DAY, 'ckitchen', { cleaning: 'yes', verified: 'yes', pending: 'no', quality: 'no', mopping: 'yes', packed: 'yes', photos: [], after: [] }, 22, 55, 0, 'submitted');
    step(U(5), DAY, 'cleft', { reported: 'yes', unreported: 'no', stored: 'yes', discrepancy: 'no', photos: [], waste: [{ item: 'Boiled eggs', qty: 4, unit: 'nos', rate: 7 }, { item: 'Brownie', qty: 2, unit: 'nos', rate: 45 }] }, 23, 8, 0, 'submitted');
    // today so far: both ops opening checklists done, RR mid-day done; team leads' opening and mid-day mostly done
    ['rr', 'jp'].forEach((o, n) => { ['start', 'attendance', 'briefing', 'inventory', 'tasks', 'overview'].forEach((k, i) => T.ops_audits.push({ outlet_id: o, day: DAY, step: k, answers: {}, selfie: null, by_person: U(7), at: iso(10, 4 + i * 4 + n * 2) })); });
    ['m_tasks', 'm_prep', 'm_food', 'm_stock', 'm_summary'].forEach((k, i) => T.ops_audits.push({ outlet_id: 'rr', day: DAY, step: k, answers: {}, selfie: null, by_person: U(7), at: iso(16, 8 + i * 9) }));
    ['briefing', 'equipment', 'workstation', 'store', 'paste', 'prep', 'topup'].forEach((k, i) => T.staff_steps.push({ person_id: U(2), day: DAY, list: 'sc_open', step: k, status: 'approved', answers: {}, by_person: U(2), at: iso(11, 2 + i * 9) }));
    ['grooming', 'briefing', 'equipment', 'workstation', 'store', 'paste', 'prep', 'topup'].forEach((k, i) => T.staff_steps.push({ person_id: U(5), day: DAY, list: 'sc_open', step: k, status: 'approved', answers: {}, by_person: U(5), at: iso(10, 50 + i * 12) }));
    ['mprep', 'rush'].forEach((k, i) => { T.staff_steps.push({ person_id: U(2), day: DAY, list: 'sc_mid', step: k, status: i ? 'submitted' : 'approved', answers: {}, by_person: U(2), at: iso(15, 20 + i * 25) }); T.staff_steps.push({ person_id: U(5), day: DAY, list: 'sc_mid', step: k, status: 'approved', answers: {}, by_person: U(5), at: iso(15, 30 + i * 22) }); });
    T.prep_plans.push({ outlet_id: 'jp', day: DAY, slot: 'morning', updated_by: U(7), at: iso(9, 35), items: [{ name: 'Boiled eggs', qty: 90, unit: 'pcs', assigned_to: U(5) }, { name: 'Chopped onion', qty: 1.5, unit: 'kg', assigned_to: U(5) }, { name: 'Chopped cabbage', qty: 1, unit: 'kg', assigned_to: U(5) }, { name: 'Rice preparation', qty: 8, unit: 'kg', assigned_to: U(5) }] },
      { outlet_id: 'jp', day: DAY, slot: 'evening', updated_by: U(7), at: iso(15, 45), items: [{ name: 'Boiled eggs', qty: 50, unit: 'pcs', assigned_to: U(5) }, { name: 'Chopped onion', qty: 1, unit: 'kg', assigned_to: U(5) }] }); }
  // ---- history for Daily operations → Day by day (last 30 days, made-up but steady) ----
  { let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const day = (dd) => new Date(Date.parse(`${DAY}T12:00:00Z`) + dd * 864e5).toISOString().slice(0, 10);
    const staffP = T.people.filter((p) => p.outlet_id && !['owner', 'admin', 'ops_manager'].includes(p.role));
    const TT = ['Boil eggs (1st batch)', 'Top-up sauces & pastes', 'Clean the fryer', 'Label containers', 'Prep onions & chillies', 'Arrange washed vessels', 'Count the cash drawer'];
    T.tasks_hist = []; let tid = 3000, aid = 5000;
    for (let dd = -59; dd <= -1; dd++) { const D = day(dd);
      staffP.forEach((p, k) => { const off = (k + dd + 40) % 7 === 0;
        if (off) { T.roster.push({ person_id: p.id, day: D, outlet_id: p.outlet_id, shift_id: null, off: true }); return; }
        if (rnd() < 0.94) { const late = rnd() < 0.14; T.attendance.push({ id: aid++, person_id: p.id, outlet_id: p.outlet_id, day: D, kind: 'in', at: iso(10, late ? 22 + Math.floor(rnd() * 30) : -5 - Math.floor(rnd() * 20), dd), selfie_path: 'x.jpg', distance_m: 12, late_reason: late ? 'Traffic' : null, late_status: late ? 'accepted' : null });
          const nT = 2 + Math.floor(rnd() * 2); for (let j = 0; j < nT; j++) { const r = rnd(), st = r < 0.84 ? 'approved' : r < 0.91 ? 'rejected' : dd > -3 ? 'open' : 'approved';
            T.tasks_hist.push({ id: tid++, outlet_id: p.outlet_id, title: TT[(k + j + dd + 70) % TT.length], assigned_to: p.id, assigned_by: MGR[p.outlet_id], status: st, for_day: D, created_at: iso(10, 15, dd), due_at: iso(16, 0, dd),
              submitted_at: st === 'open' ? null : iso(rnd() < 0.85 ? 14 : 17, Math.floor(rnd() * 50), dd), decided_at: st === 'approved' || st === 'rejected' ? iso(18, 0, dd) : null, photos: [], history: [] }); } } });
      ['rr', 'jp'].forEach((o) => { const put = (step, h, m) => T.ops_audits.push({ outlet_id: o, day: D, step, answers: {}, selfie: null, by_person: U(7), at: iso(h, m, dd) });
        const r1 = rnd(); if (r1 > 0.05) { ['start', 'attendance', 'briefing', 'inventory', 'tasks'].forEach((k, i) => put(k, 10, 2 + i * 4)); if (r1 > 0.1) put('overview', 10, r1 > 0.3 ? 26 : 48); }
        if (dd >= -26) { const r2 = rnd(); if (r2 > 0.08) { ['m_tasks', 'm_prep', 'm_food', 'm_stock'].forEach((k, i) => put(k, 16, 5 + i * 8)); if (r2 > 0.15) put('m_summary', r2 > 0.35 ? 16 : 17, r2 > 0.35 ? 50 : 20); } }
        if (dd >= -22) { const r3 = rnd(); if (r3 > 0.06) { ['c_stock', 'c_waste', 'c_sales', 'c_purchase', 'c_feedback', 'c_complaints'].forEach((k, i) => put(k, 22, 35 + i * 7)); if (r3 > 0.12) put('c_final', r3 > 0.3 ? 23 : 23, r3 > 0.3 ? 20 : 48); } } });
      if (dd >= -10) { const r4 = rnd(); if (r4 > 0.1) ['grooming', 'briefing', 'equipment', 'workstation', 'store', 'paste', 'prep', 'topup'].slice(0, r4 > 0.2 ? 8 : 5).forEach((k, i) => T.staff_steps.push({ person_id: U(2), day: D, list: 'sc_open', step: k, answers: {}, by_person: U(2), at: iso(10, 40 + i * 11 + (r4 > 0.75 ? 25 : 0), dd) })); }
      if (dd >= -3) ['mprep', 'rush'].forEach((k, i) => T.staff_steps.push({ person_id: U(2), day: D, list: 'sc_mid', step: k, answers: {}, by_person: U(2), at: iso(15, 20 + i * 25, dd) }));
      if (rnd() < 0.35) T.escalations.push({ id: 7000 + dd, person_id: U(1), outlet_id: rnd() < 0.5 ? 'rr' : 'jp', category: 'breakage', what: 'Plate broken', urgent: false, photo: null, status: 'solved', created_at: iso(13, 0, dd) });
    } }
  T._day = DAY; T._ver = DEMO_VER;
  return T;
}

const DEMO_VER = 25;
let T = null;
try { T = JSON.parse(store.get(DBKEY) || 'null'); } catch { T = null; }
// bump DEMO_VER when the demo's starting data changes, so phones drop practice data made with the old rules
if (!T || T._day !== DAY || T._ver !== DEMO_VER) T = seed();
// checklist rules (photos needed, items) always come fresh from the app, even when practice data is kept
{ const f = fresh(); T.checklists = f.checklists; T.checklist_items = f.checklist_items; }
const save = () => store.set(DBKEY, JSON.stringify(T));
save();

export const who = () => store.get(WHO);
export function viewAs(uid) { store.set(WHO, uid); setToken(uid); location.reload(); }
export function resetDemo() { store.set(DBKEY, ''); try { localStorage.removeItem(DBKEY); } catch { /* */ } location.reload(); }
function setToken(uid) {
  store.set('sb-iwnmvhjpcklehvwaixas-auth-token', JSON.stringify({ access_token: 'demo.demo.demo', refresh_token: 'demo', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 86400, user: { id: uid, aud: 'authenticated', role: 'authenticated', email: 'demo@staff.omk-ops.app' } }));
}
const uid = who();
if (uid) setToken(uid);
const handler = makeHandler(T, uid);

// photos taken in the demo stay in this page
const blobs = new Map();
const tileUrl = (label, hue) => 'data:image/svg+xml;utf8,' + encodeURIComponent(tile(label, hue));


window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input.url;
  if (/\/version\.json/.test(url)) return new Response('', { status: 404 });
  if (!url.includes(HOST)) return realFetch(input, init);
  const method = (init.method || (input.method) || 'GET').toUpperCase();
  const hdr = {}; new Headers(init.headers || (input.headers) || {}).forEach((v, k) => { hdr[k] = v; });
  let body = init.body;
  if (body instanceof Blob || body instanceof FormData) {
    const p = decodeURIComponent(new URL(url).pathname.replace('/storage/v1/object/photos/', ''));
    const b = body instanceof FormData ? [...body.values()].find((v) => v instanceof Blob) : body;
    if (b) blobs.set(p, URL.createObjectURL(b)); body = '';
  }
  const req = { url: () => url, method: () => method, postData: () => (typeof body === 'string' ? body : ''), headers: () => hdr };
  let res;
  await handler({ request: () => req, fulfill: async (o) => {
    const status = o.status || 200;
    if (o.json !== undefined) res = new Response(status === 204 ? null : JSON.stringify(o.json), { status, headers: { 'content-type': 'application/json' } });
    else res = new Response(status === 204 ? null : (o.body ?? ''), { status, headers: { 'content-type': o.contentType || 'text/plain' } });
  } });
  if (method !== 'GET') save();
  return res || new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
};

// <img> pointing at the photo store: show the demo photo instead
const fixSrc = (v) => { if (typeof v === 'string' && LOCAL[v]) return LOCAL[v]; if (typeof v !== 'string' || !v.includes(HOST + '/storage')) return v;
  const p = decodeURIComponent(new URL(v).pathname.replace(/^.*\/object\/(sign\/)?photos\//, ''));
  return blobs.get(p) || tileUrl(/\/s\//.test(p) ? 'Selfie' : 'Photo', (p.length * 37) % 360); };
const setAttr = Element.prototype.setAttribute;
Element.prototype.setAttribute = function (n, v) { return setAttr.call(this, n, (n === 'src' || n === 'href') ? fixSrc(v) : v); };
const srcDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
Object.defineProperty(HTMLImageElement.prototype, 'src', { ...srcDesc, set(v) { srcDesc.set.call(this, fixSrc(v)); } });

// location: always at the person's outlet
const me = T.people.find((p) => p.id === uid), o = T.outlets.find((x) => x.id === (me?.outlet_id || 'rr'));
const pos = { coords: { latitude: o.lat, longitude: o.lng, accuracy: 12 }, timestamp: Date.now() };
try { Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition: (ok) => setTimeout(() => ok({ ...pos, timestamp: Date.now() }), 300), watchPosition: (ok) => { ok(pos); return 1; }, clearWatch() {} } }); } catch { /* */ }
try { navigator.permissions.query = async () => ({ state: 'granted', onchange: null, addEventListener() {} }); } catch { /* */ }

// camera: a moving test picture instead of the real camera
function fakeStream() {
  const c = document.createElement('canvas'); c.width = 480; c.height = 640; const x = c.getContext('2d'); let t = 0;
  const draw = () => { t++; x.fillStyle = `hsl(${(t * 2) % 360},45%,58%)`; x.fillRect(0, 0, 480, 640); x.fillStyle = '#fff'; x.font = 'bold 44px sans-serif'; x.textAlign = 'center';
    x.fillText('DEMO PHOTO', 240, 300); x.font = '28px sans-serif'; x.fillText(new Date().toLocaleTimeString('en-IN'), 240, 350); };
  draw(); setInterval(draw, 100); return c.captureStream(15);
}
if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => fakeStream();
else try { Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: async () => fakeStream(), enumerateDevices: async () => [] } }); } catch { /* */ }

// the page this runs in can't show confirm boxes: in the demo every 'Are you sure?' answers yes
window.confirm = () => true;

// no service worker or push in the demo
try { if (navigator.serviceWorker) navigator.serviceWorker.register = () => Promise.reject(new Error('demo')); } catch { /* */ }
try { delete window.PushManager; } catch { /* */ }
