// Stateful fake backend for end-to-end UI tests (no real server touched).
import fx from './fixtures.json';
const day = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
const at = (h, m) => new Date(`${day}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+05:30`).toISOString();
const U = (n) => `00000000-0000-0000-0000-00000000000${n}`;
const P = (o, k, n) => Array.from({ length: n }, (_, i) => `${o}/${day}/x/${k}-${i}.jpg`);
export function fresh() {
  const people = [
    { id: U(1), name: 'Hasmath', phone: '9845021734', role: 'chef', designation: 'Kitchen Helper', outlet_id: 'rr', shift_start: '10:00:00', active: true },
    { id: U(2), name: 'Jayanth', phone: '9901640218', role: 'chef', designation: 'Senior Chef and Kitchen Incharge', outlet_id: 'rr', shift_start: '10:00:00', active: true, lists: ['sc_open', 'sc_mid', 'sc_close'], backup_id: U(9) },
    { id: U(3), name: 'Karthikeya', phone: '9741288305', role: 'store_manager', designation: 'Store Incharge', outlet_id: 'rr', shift_start: '10:00:00', active: true },
    { id: U(4), name: 'Roshan Chandh', phone: '9845000004', role: 'chef', designation: 'Chef and Inventory Incharge', outlet_id: 'jp', shift_start: '10:00:00', active: true, lists: ['ch_open', 'ch_mid'] },
    { id: U(5), name: 'Himal', phone: '9845000005', role: 'chef', designation: 'Senior Chef and Kitchen Incharge', outlet_id: 'jp', shift_start: '10:00:00', active: true, lists: ['sc_open', 'sc_mid', 'sc_close'] },
    { id: U(6), name: 'Sunil', phone: '9845000006', role: 'store_manager', designation: 'Store Manager', outlet_id: 'jp', shift_start: '10:00:00', active: true },
    { id: U(7), name: 'Chandrashekhara - N', phone: '9845000007', role: 'ops_manager', outlet_id: null, shift_start: '10:00:00', active: true },
    { id: U(8), name: 'David', phone: '9845000008', role: 'admin', outlet_id: null, shift_start: '10:00:00', active: true },
    { id: '00000000-0000-0000-0000-000000000110', name: 'Dilip', phone: '9845000010', role: 'owner', outlet_id: null, shift_start: '11:00:00', active: true },
    { id: U(9), name: 'Ramesh', phone: '9845000009', role: 'chef', designation: 'Chef', outlet_id: 'rr', shift_start: '10:00:00', active: true, backup_id: U(2) , lists: ['ch_open', 'ch_mid']},
  ];
  const outlets = [
    { id: 'jp', name: 'OMK JP Nagar', address: 'JP Nagar 2nd Phase', lat: 12.912, lng: 77.586, radius_m: 100, active: true },
    { id: 'rr', name: 'OMK RR Nagar', address: 'RR Nagar', lat: 12.9146, lng: 77.5075, radius_m: 100, active: true },
  ];
  const attendance = [
    { id: 1, person_id: U(1), outlet_id: 'rr', day, kind: 'in', at: at(11, 52), selfie_path: 'rr/s/hasmath.jpg', distance_m: 18, late_reason: 'Bus was late', late_status: 'pending' },
    { id: 2, person_id: U(2), outlet_id: 'rr', day, kind: 'in', at: at(10, 56), selfie_path: 'rr/s/jayanth.jpg', distance_m: 24 },
    { id: 3, person_id: U(3), outlet_id: 'rr', day, kind: 'in', at: at(10, 50), selfie_path: 'rr/s/karthikeya.jpg', distance_m: 12 },
    { id: 4, person_id: U(4), outlet_id: 'jp', day, kind: 'in', at: at(11, 26), selfie_path: 'jp/s/l.jpg', distance_m: 15 },
    { id: 5, person_id: U(5), outlet_id: 'jp', day, kind: 'in', at: at(10, 58), selfie_path: 'jp/s/i.jpg', distance_m: 41 },
    { id: 6, person_id: U(6), outlet_id: 'jp', day, kind: 'in', at: at(11, 20), selfie_path: 'jp/s/a.jpg', distance_m: 22, late_reason: 'Traffic', late_status: 'pending' },
    { id: 7, person_id: U(7), outlet_id: null, day, kind: 'in', at: at(11, 5), selfie_path: 'hq/s/d.jpg', distance_m: null },
  ];
  const yes = (cid) => Object.fromEntries(fx.items.filter((i) => i.checklist_id === cid).map((i) => [i.id,
    i.type === 'yn' ? { v: 'y' } : i.type === 'num' ? { n: i.min_val ?? i.max_val ?? 0 } : i.type === 'photo' ? { photos: P('rr', i.id, 2) } : { before: P('rr', i.id + 'b', 2), after: P('rr', i.id + 'a', 2), bt: at(11, 55), at: at(12, 8) }]));
  const chefJp = yes('chef_open'); chefJp.o1z = { n: -12 }; chefJp.o3 = { v: 'n', note: 'Backup stove knob broken' };
  const runs = [
    { id: 11, outlet_id: 'rr', checklist_id: 'clean_open', day, by_person: U(1), submitted_at: at(12, 14), status: 'pending', answers: yes('clean_open') },
    { id: 12, outlet_id: 'jp', checklist_id: 'chef_open', day, by_person: U(5), submitted_at: at(11, 41), status: 'pending', answers: chefJp },
    { id: 13, outlet_id: 'jp', checklist_id: 'mgr_open', day, by_person: U(6), submitted_at: at(12, 9), status: 'done', answers: yes('mgr_open') },
    { id: 14, outlet_id: 'rr', checklist_id: 'chef_prep', day, by_person: U(2), submitted_at: at(12, 20), status: 'sent_back', back_item: 'p3', back_note: 'Labels not visible', decided_by: U(3), answers: yes('chef_prep') },
  ];
  const issues = [
    { id: 21, outlet_id: 'jp', what: 'Freezer temperature: -12 °C', source: 'Kitchen opening', reported_by: U(5), reported_at: new Date(Date.now() - 2.5 * 3600e3).toISOString(), fixed_at: null },
    { id: 22, outlet_id: 'rr', what: 'Burner 2 leaking', source: 'Kitchen opening', reported_by: U(2), reported_at: new Date(Date.now() - 0.5 * 3600e3).toISOString(), fixed_at: null },
    { id: 23, outlet_id: 'rr', what: 'Old issue escalated to owners', source: 'Kitchen closing', reported_by: U(2), reported_at: new Date(Date.now() - 5 * 3600e3).toISOString(), fixed_at: null },
  ];
  const leaves = [
    { id: 31, person_id: U(9), from_date: day, days: 1, reason: "Sister's wedding", status: 'pending', created_at: at(9, 0) },
    { id: 32, person_id: U(6), from_date: day, days: 1, reason: 'Family function', status: 'pending', created_at: at(9, 5) },
    { id: 33, person_id: U(4), from_date: day, days: 1, reason: 'Doctor visit', status: 'approved', decided_by: U(6), created_at: at(8, 0) },
    { id: 34, person_id: U(7), from_date: day, days: 2, reason: 'Wedding', status: 'pending', created_at: at(8, 30) },
  ];
  return { outlets, people, attendance, runs, issues, leaves, location_blocks: [{ id: 41, person_id: U(9), outlet_id: 'rr', at: at(10, 40), distance_m: 2400 }],
    tasks: [], task_rules: [], handovers: [], breaks: [],
    shifts: [{ id: 1, name: 'Morning', start_time: '10:00:00', end_time: '19:00:00', active: true }, { id: 2, name: 'Noon', start_time: '12:00:00', end_time: '21:00:00', active: true }], roster: [],
    salaries: [{ person_id: U(2), monthly: 24000 }, { person_id: U(9), monthly: 22000 }], advances: [], advance_repayments: [], announcements: [], warnings: [], training_videos: [], training_done: [], blacklist: [], stock_issues: [],
    stock_items: ['rr', 'jp'].flatMap((o, k) => [['Eggs', 'nos', 200, 320], ['Rice', 'kg', 10, 18], ['Onion', 'kg', 10, 4], ['Tomato', 'kg', 5, 5], ['Cheese', 'kg', 3, 1.2], ['Cooking oil', 'ltr', 5, 8], ['Mayonnaise', 'kg', 2, 1], ['Schezwan sauce', 'kg', 2, null]]
      .map(([name, unit, min_qty, qty], i) => ({ id: 800 + k * 20 + i, outlet_id: o, name, unit, min_qty, qty, sort: i, active: true, updated_at: qty == null ? null : at(17, 10), updated_by: U(3) }))),
    task_templates: [{ id: 1, name: 'Kitchen – Daily Tasks', role: 'chef', active: true, sort: 1, items: [{ title: 'Boil eggs (1st batch)', qty_label: 'Boiled egg quantity', qty_unit: 'eggs' }, { title: 'Prep egg kulfi mix' }, { title: 'Top up sauces (schezwan, mayo)' }, { title: 'Dining area cleaning' }, { title: 'Arrange tables & chairs' }] },
      { id: 2, name: 'Housekeeping – Daily Tasks', role: 'housekeeping', active: true, sort: 2, items: [{ title: 'Dining area cleaning' }, { title: 'Arrange tables & chairs' }, { title: 'Washroom cleaning' }] }],
    requests: [], briefings: [], briefing_acks: [], training_assignments: [], escalations: [], count_items: [], stock_counts: [], ops_audits: [], prep_plans: [], staff_steps: [], cover_accepts: [],
    checklists: JSON.parse(JSON.stringify(fx.checklists)).map((c) => ({ ...c, active: false })),   // old checklists are switched off (live too)
    checklist_items: JSON.parse(JSON.stringify(fx.items)) };
}
function tile(label, hue) { return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"><rect width="160" height="120" fill="hsl(${hue},45%,55%)"/><text x="80" y="70" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#fff">${label}</text></svg>`; }


export const DAY = day;
export { U, tile };
// handler(route) with the same shape the tests use; T is the live demo data, uid the person being viewed
export function makeHandler(T, uid, opts = {}) {
  const log = { rpc: [], uploads: 0, bad: [] };
  const me = () => T.people.find((p) => p.id === uid);
  let nid = T._nid || 1000;
  const h = async (route) => {
    const req = route.request(), url = new URL(req.url()), p = url.pathname;
    if (opts.delay) await new Promise((r) => setTimeout(r, opts.delay));
    if (p.startsWith('/auth/v1/logout')) return route.fulfill({ status: 204, body: '' });
    if (p.startsWith('/auth/v1/token')) return opts.badLogin ? route.fulfill({ status: 400, json: { error: 'invalid_grant', error_description: 'Invalid login credentials' } })
      : route.fulfill({ json: { access_token: 'x.y.z', refresh_token: 'r', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: U(1), aud: 'authenticated', role: 'authenticated' } } });
    if (p.startsWith('/auth/')) return route.fulfill({ json: { id: uid, aud: 'authenticated', role: 'authenticated' } });
    if (p.startsWith('/storage/v1/object/sign/photos') && req.method() === 'POST') {
      const body = JSON.parse(req.postData() || '{}');
      return route.fulfill({ json: (body.paths || []).map((x) => ({ path: x, signedURL: `/object/sign/photos/${x}?token=t`, error: null })) });
    }
    if (p.startsWith('/storage/v1/object/sign/')) return route.fulfill({ contentType: 'image/svg+xml', body: tile('Photo', (p.length * 37) % 360) });
    if (p.startsWith('/storage/v1/object/photos/') && req.method() === 'POST') {
      log.uploads++; const path = decodeURIComponent(p.replace('/storage/v1/object/photos/', ''));
      const seg = path.split('/'); if (seg[2] !== uid) log.bad.push('upload path uid mismatch ' + path);
      if (seg[0] !== (me().outlet_id || 'hq')) log.bad.push('upload folder wrong ' + path);
      return route.fulfill({ json: { Key: 'photos/' + path, Id: 'x' } });
    }
    if (p.startsWith('/functions/v1/push')) { const bd = JSON.parse(req.postData() || '{}'); log.push = log.push || []; log.push.push(bd);
      return route.fulfill({ json: bd.action === 'key' ? { publicKey: 'BKjDSxGDVz6q3cZp6Zu0Gk4ahD0ylzB2jcMIg4mDhaG7Z6qitn4ixr3KZmgjx5KJvFQzD1ZxuzBptKMxl7c1yrA' } : { sent: 1 } }); }
    if (p.startsWith('/rest/v1/rpc/')) {
      const fn = p.split('/').pop(); const a = JSON.parse(req.postData() || '{}'); log.rpc.push([fn, a]);
      const ok = (j = null) => route.fulfill({ json: j });
      if (opts.rpcError && opts.rpcError[fn]) return route.fulfill({ status: 400, json: { code: 'P0001', message: opts.rpcError[fn] } });
      switch (fn) {
        case 'needs_setup': return ok(!!opts.setup);
        case 'check_location': return ok(opts.far ? { ok: false, outlet: 'rr', outlet_name: 'OMK RR Nagar', distance_m: 2400, radius_m: 100 } : { ok: true, outlet: me().outlet_id || 'rr', outlet_name: 'OMK RR Nagar', distance_m: 18, radius_m: 100 });
        case 'mark_attendance': T.attendance.push({ id: nid++, person_id: uid, outlet_id: me().outlet_id, day, kind: a.p_kind, at: new Date().toISOString(), selfie_path: a.p_selfie, distance_m: 10, late_reason: a.p_late_reason || null, late_status: a.p_late_reason ? 'pending' : null }); return ok();
        case 'submit_run': { const cl = T.checklists.find((c) => c.id === a.p_checklist); T.runs = T.runs.filter((r) => !(r.checklist_id === cl.id && r.outlet_id === me().outlet_id));
          T.runs.push({ id: nid++, outlet_id: me().outlet_id, checklist_id: cl.id, day, by_person: uid, submitted_at: new Date().toISOString(), status: cl.needs_approval ? 'pending' : 'done', answers: a.p_answers });
          const bad = T.checklist_items.filter((i) => i.checklist_id === cl.id && ((i.type === 'yn' && a.p_answers[i.id]?.v === 'n') || (i.type === 'num' && ((i.min_val != null && a.p_answers[i.id]?.n < i.min_val) || (i.max_val != null && a.p_answers[i.id]?.n > i.max_val)))));
          bad.forEach((i) => T.issues.unshift({ id: nid++, outlet_id: me().outlet_id, what: i.label, source: cl.title, reported_by: uid, reported_at: new Date().toISOString(), fixed_at: null }));
          return ok({ problems: bad.length }); }
        case 'decide_run': { const r = T.runs.find((x) => x.id === a.p_run); Object.assign(r, a.p_approve ? { status: 'approved', decided_by: uid } : { status: 'sent_back', back_item: a.p_item, back_note: a.p_note, decided_by: uid }); return ok(); }
        case 'decide_late': { T.attendance.find((x) => x.id === a.p_att).late_status = a.p_status; return ok(); }
        case 'decide_leave': { Object.assign(T.leaves.find((x) => x.id === a.p_leave), { status: a.p_approve ? 'approved' : 'rejected', decided_by: uid }); return ok(); }
        case 'ask_leave': T.leaves.unshift({ id: nid++, person_id: uid, from_date: a.p_from, days: a.p_days, reason: a.p_reason, status: 'pending', created_at: new Date().toISOString() }); return ok();
        case 'fix_issue': Object.assign(T.issues.find((x) => x.id === a.p_issue), { fixed_at: new Date().toISOString(), fixed_by: uid, fix_photo_path: a.p_photo }); return ok();
        case 'set_radius': T.outlets.find((o) => o.id === a.p_outlet).radius_m = a.p_radius; return ok();
        case 'add_person': if (!['owner', 'admin'].includes(me().role) && !(me().role === 'ops_manager' && ['housekeeping', 'chef', 'store_manager'].includes(a.p_role)))
            return route.fulfill({ status: 400, json: { code: 'P0001', message: 'The ops manager can add housekeeping, chefs and store incharges. Owners add everyone else.' } });
          T.people.push({ id: U(0) + nid++, name: a.p_name, phone: a.p_phone, role: a.p_role, outlet_id: a.p_outlet, shift_start: a.p_shift, active: true }); return ok(U(0));
        case 'update_person': Object.assign(T.people.find((x) => x.id === a.p_id), { name: a.p_name, role: a.p_role, outlet_id: a.p_outlet, shift_start: a.p_shift, active: a.p_active }); return ok();
        case 'reset_pin': return ok();
        case 'start_break': T.breaks.push({ id: nid++, person_id: uid, outlet_id: me().outlet_id, day, started_at: new Date().toISOString(), ended_at: null }); return ok({});
        case 'end_break': { const b = T.breaks.find((x) => x.person_id === uid && !x.ended_at); if (opts.farBreak) return ok({ ok: false, distance_m: 850, radius_m: 100, outlet_name: 'OMK RR Nagar' }); b.ended_at = new Date().toISOString(); b.late_min = 0; return ok({ ok: true, minutes: 31, late_min: 0 }); }
        case 'assign_task': { const to = T.people.find((x) => x.id === a.p_to); T.tasks.unshift({ id: nid++, outlet_id: to.outlet_id, title: a.p_title, note: a.p_note || null, priority: a.p_priority, due_at: a.p_due, assigned_to: to.id, assigned_by: uid, created_at: new Date().toISOString(), status: 'open', photos: [] }); return ok(nid); }
        case 'submit_task': Object.assign(T.tasks.find((x) => x.id === a.p_task), { status: 'submitted', photos: a.p_photos, done_note: a.p_note || null, submitted_at: new Date().toISOString() }); return ok();
        case 'decide_task': Object.assign(T.tasks.find((x) => x.id === a.p_task), a.p_approve ? { status: 'approved', decided_by: uid, decided_at: new Date().toISOString() } : { status: 'rejected', reject_note: a.p_note, decided_by: uid, decided_at: new Date().toISOString() }); return ok();
        case 'spawn_tasks': return ok(0);
        case 'add_task_rule': { const to = T.people.find((x) => x.id === a.p_to); const r = { id: nid++, outlet_id: to.outlet_id, title: a.p_title, note: a.p_note || null, priority: a.p_priority, assigned_to: to.id, assigned_by: uid, repeat: a.p_repeat, weekday: a.p_weekday, due_time: a.p_due_time, active: true, created_at: new Date().toISOString() }; T.task_rules.unshift(r);
          if (a.p_repeat === 'daily') T.tasks.unshift({ id: nid++, outlet_id: to.outlet_id, title: a.p_title, note: a.p_note, priority: a.p_priority, due_at: null, assigned_to: to.id, assigned_by: uid, rule_id: r.id, for_day: day, created_at: new Date().toISOString(), status: 'open', photos: [] }); return ok(r.id); }
        case 'stop_task_rule': T.task_rules.find((x) => x.id === a.p_rule).active = false; T.task_rules = T.task_rules.filter((x) => x.active); return ok();
        case 'write_handover': T.handovers.unshift({ id: nid++, outlet_id: me().outlet_id, by_person: uid, at: new Date().toISOString(), notes: a.p_notes || null, cash: a.p_cash, cash_photo: a.p_cash_photo, low_stock: a.p_low || [], equipment: a.p_equipment || null }); return ok(1);
        case 'ack_handover': Object.assign(T.handovers.find((x) => x.id === a.p_id), { ack_by: uid, ack_at: new Date().toISOString() }); return ok();
        case 'assign_task2': { const to = T.people.find((x) => x.id === a.p_to); T.tasks.unshift({ id: nid++, outlet_id: to.outlet_id, title: a.p_title, note: a.p_note || null, priority: a.p_priority, due_at: a.p_due, assigned_to: to.id, assigned_by: uid, created_at: new Date().toISOString(), status: 'open', photos: [], history: [], qty_label: a.p_qty_label, qty_unit: a.p_qty_unit, photo_required: a.p_photo !== false }); return ok(nid - 1); }
        case 'submit_task2': { const t = T.tasks.find((x) => x.id === a.p_task); if (t.photo_required !== false && !(a.p_photos || []).length) return route.fulfill({ status: 400, json: { code: 'P0001', message: 'Add at least one photo of the finished work.' } }); if (t.status === 'rejected') t.history = [...(t.history || []), { photos: t.photos, rejected: t.reject_note }];
          Object.assign(t, { status: 'submitted', photos: a.p_photos, done_note: a.p_note || null, qty_value: a.p_qty, submitted_at: new Date().toISOString() }); return ok(); }
        case 'ask_advance': T.advances.unshift({ id: nid++, person_id: uid, outlet_id: me().outlet_id, amount: a.p_amount, reason: a.p_reason, status: 'requested', requested_at: new Date().toISOString() }); return ok(1);
        case 'decide_advance': { const x = T.advances.find((y) => y.id === a.p_id); if (a.p_action !== 'disburse' && !['owner', 'admin'].includes(me().role)) return route.fulfill({ status: 400, json: { code: 'P0001', message: 'Only an owner can approve or reject an advance.' } }); Object.assign(x, a.p_action === 'disburse' ? { status: 'disbursed', disbursed_by: uid, disbursed_at: new Date().toISOString(), deduct_month: day.slice(0, 8) + '01' } : { status: a.p_action === 'approve' ? 'approved' : 'rejected', decided_by: uid, decided_at: new Date().toISOString() }); return ok(); }
        case 'record_repayment': T.advance_repayments.unshift({ id: nid++, advance_id: a.p_id, amount: a.p_amount, mode: a.p_mode, at: new Date().toISOString(), by_person: uid }); return ok();
        case 'update_stock': a.p_items.forEach((e) => Object.assign(T.stock_items.find((x) => x.id === e.id), { qty: e.qty, updated_at: new Date().toISOString(), updated_by: uid })); return ok(a.p_items.length);
        case 'save_stock_item': if (a.p_id) Object.assign(T.stock_items.find((x) => x.id === a.p_id), { name: a.p_name, unit: a.p_unit, min_qty: a.p_min, active: a.p_active }); else T.stock_items.push({ id: nid++, outlet_id: a.p_outlet, name: a.p_name, unit: a.p_unit, min_qty: a.p_min, qty: null, active: true, sort: 99 }); T.stock_items = T.stock_items.filter((x) => x.active); return ok(1);
        case 'report_stock_issue': { const it = T.stock_items.find((x) => x.id === a.p_item); T.stock_issues.unshift({ id: nid++, outlet_id: it.outlet_id, item_id: it.id, note: a.p_note, photo: a.p_photo, at: new Date().toISOString(), by_person: uid }); return ok(1); }
        case 'resolve_stock_issue': T.stock_issues.find((x) => x.id === a.p_id).resolved_at = new Date().toISOString(); return ok();
        case 'post_announcement': T.announcements.unshift({ id: nid++, outlet_id: a.p_outlet || (me().role === 'store_manager' ? me().outlet_id : null), title: a.p_title, body: a.p_body, by_person: uid, at: new Date().toISOString() }); return ok(1);
        case 'issue_warning': { const p = T.people.find((x) => x.id === a.p_person); T.warnings.unshift({ id: nid++, person_id: p.id, outlet_id: p.outlet_id, level: a.p_level, reason: a.p_reason, by_person: uid, at: new Date().toISOString() }); return ok(1); }
        case 'blacklist_person': { const p = T.people.find((x) => x.id === a.p_person); T.blacklist.unshift({ phone: p.phone, person_id: p.id, name: p.name, reason: a.p_reason, by_person: uid, at: new Date().toISOString() }); p.active = false; return ok(); }
        case 'add_training_video': T.training_videos.unshift({ id: nid++, title: a.p_title, url: a.p_url, role: a.p_role, active: true, at: new Date().toISOString() }); return ok(1);
        case 'watched_video': if (!T.training_done.some((w) => w.video_id === a.p_video && w.person_id === uid)) T.training_done.push({ video_id: a.p_video, person_id: uid });
          (T.training_assignments || []).forEach((x) => { if (x.video_id === a.p_video && x.person_id === uid && !x.done_at) x.done_at = new Date().toISOString(); }); return ok();
        case 'assign_training': { const no = (m) => route.fulfill({ status: 400, json: { code: 'P0001', message: m } });
          if (!['ops_manager', 'owner', 'admin'].includes(me().role)) return no('Only the ops manager and owners assign training.');
          if ((T.training_assignments ||= []).some((x) => x.video_id === a.p_video && x.person_id === a.p_person && !x.done_at)) return no('This video is already assigned to them.');
          T.training_assignments.unshift({ id: nid++, video_id: a.p_video, person_id: a.p_person, reason: a.p_reason, assigned_by: uid, at: new Date().toISOString(), done_at: null }); return ok(nid - 1); }
        case 'save_prep_plan': { if (!['ops_manager', 'owner', 'admin'].includes(me().role)) return route.fulfill({ status: 400, json: { code: 'P0001', message: 'Only the ops manager and owners make the preparation plan.' } });
          const day = T._day || DAY, slot = a.p_slot || 'morning'; T.prep_plans = (T.prep_plans || []).filter((x) => !(x.outlet_id === a.p_outlet && x.day === day && (x.slot || 'morning') === slot));
          T.prep_plans.push({ outlet_id: a.p_outlet, day, slot, items: a.p_items, updated_by: uid, at: new Date().toISOString() }); return ok(); }
        case 'list_escalations': { const r = me().role, owner = ['owner', 'admin'].includes(r), top = owner || r === 'ops_manager';
          return ok((T.escalations || []).filter((e) => e.person_id === uid || top || (r === 'store_manager' && e.outlet_id === me().outlet_id))
            .map((e) => ({ ...e, person_id: owner || e.person_id === uid ? e.person_id : null, mine: e.person_id === uid }))); }
        case 'raise_escalation': { const no = (m) => route.fulfill({ status: 400, json: { code: 'P0001', message: m } });
          if (!me().outlet_id) return no('Only outlet staff raise escalations.'); if ((a.p_what || '').trim().length < 3) return no('Write what the problem is.');
          (T.escalations ||= []).unshift({ id: nid++, person_id: uid, outlet_id: me().outlet_id, category: a.p_category, what: a.p_what.trim(), urgent: !!a.p_urgent || a.p_category === 'gas', photo: a.p_photo || null, status: 'open', created_at: new Date().toISOString() }); return ok(nid - 1); }
        case 'update_escalation': { const no = (m) => route.fulfill({ status: 400, json: { code: 'P0001', message: m } });
          if (!['ops_manager', 'owner', 'admin'].includes(me().role)) return no('Only the ops manager and owners handle escalations.');
          const e = T.escalations.find((x) => x.id === a.p_id), now = new Date().toISOString();
          if (a.p_status === 'working') Object.assign(e, { status: 'working', handled_by: uid, working_at: now, note: a.p_note || e.note || null });
          else { if ((a.p_note || '').trim().length < 2) return no('Write how it was solved.'); Object.assign(e, { status: 'solved', handled_by: uid, solved_at: now, note: a.p_note.trim() }); } return ok(); }
        case 'save_count_item': { const no = (m) => route.fulfill({ status: 400, json: { code: 'P0001', message: m } });
          if (!['ops_manager', 'owner', 'admin', 'store_manager'].includes(me().role) && !(me().lists || []).length) return no('Only the senior chefs and managers change the stock list.');
          if ((a.p_name || '').trim().length < 2) return no('Write the item name.');
          if (T.count_items.some((x) => x.active && x.name.toLowerCase() === a.p_name.trim().toLowerCase() && x.id !== a.p_id)) return no('This item is already in the list.');
          if (a.p_id) { Object.assign(T.count_items.find((x) => x.id === a.p_id), { name: a.p_name.trim(), unit: a.p_unit || 'nos' }); return ok(a.p_id); }
          T.count_items.push({ id: nid++, name: a.p_name.trim(), unit: a.p_unit || 'nos', sort: T.count_items.length + 1, active: true }); return ok(nid - 1); }
        case 'remove_count_item': { const x = T.count_items.find((y) => y.id === a.p_id); if (x) x.active = false; return ok(); }
        case 'save_stock_count': { const no = (m) => route.fulfill({ status: 400, json: { code: 'P0001', message: m } }); const r = me().role, top = ['ops_manager', 'owner', 'admin'].includes(r);
          if (a.p_kind === 'closing' && !(top || (r === 'store_manager' && me().outlet_id === a.p_outlet))) return no('Only the store incharge of this outlet counts closing stock.');
          if (a.p_kind === 'opening' && !top) return no('Only the ops manager counts opening stock.'); const day = T._day || DAY; let n = 0;
          Object.entries(a.p_counts || {}).forEach(([k, v]) => { if (v === '' || v == null) return; T.stock_counts = T.stock_counts.filter((c) => !(c.outlet_id === a.p_outlet && c.day === day && c.kind === a.p_kind && c.item_id === Number(k)));
            T.stock_counts.push({ outlet_id: a.p_outlet, day, kind: a.p_kind, item_id: Number(k), qty: Number(v), by_person: uid, at: new Date().toISOString() }); n++; });
          return n ? ok(n) : no('Enter at least one count.'); }
        case 'submit_ops_step': { const no = (m) => route.fulfill({ status: 400, json: { code: 'P0001', message: m } }); const mid = ['m_tasks', 'm_prep', 'm_food', 'm_stock', 'm_summary'], clo = ['c_stock', 'c_waste', 'c_sales', 'c_purchase', 'c_feedback', 'c_complaints', 'c_final'], ord = mid.includes(a.p_step) ? mid : clo.includes(a.p_step) ? clo : ['start', 'attendance', 'briefing', 'inventory', 'tasks', 'overview'], day = T._day || DAY, i = ord.indexOf(a.p_step);
          if (!['ops_manager', 'owner', 'admin'].includes(me().role)) return no('Only the ops manager does the opening checklist.');
          if (a.p_step === 'start' && !a.p_selfie) return no('Take your selfie to start.');
          const has = (s) => T.ops_audits.some((x) => x.outlet_id === a.p_outlet && x.day === day && x.step === s);
          if (i > 0 && !has(ord[i - 1])) return no('Finish the step before this one first.'); if (has(a.p_step)) return no('This step is already submitted.');
          T.ops_audits.push({ outlet_id: a.p_outlet, day, step: a.p_step, answers: a.p_answers || {}, selfie: a.p_selfie || null, by_person: uid, at: new Date().toISOString() }); return ok(); }
        case 'send_briefing': { if (!['ops_manager', 'owner', 'admin'].includes(me().role)) return route.fulfill({ status: 400, json: { code: 'P0001', message: 'Only the ops manager and owners send briefings.' } });
          T.briefings ||= []; T.briefing_acks ||= []; const o = a.p_outlet || null, day = T._day || DAY;
          const b = T.briefings.find((x) => x.day === day && x.kind === a.p_kind && (x.outlet_id || null) === o);
          if (b) { Object.assign(b, { body: a.p_body.trim(), sent_by: uid, at: new Date().toISOString() }); T.briefing_acks = T.briefing_acks.filter((x) => x.briefing_id !== b.id); return ok(b.id); }
          T.briefings.push({ id: nid++, day, kind: a.p_kind, outlet_id: o, body: a.p_body.trim(), sent_by: uid, at: new Date().toISOString() }); return ok(nid - 1); }
        case 'ack_briefing': { T.briefing_acks ||= []; if (a.p_explained && me().role !== 'store_manager') return route.fulfill({ status: 400, json: { code: 'P0001', message: 'Only the store incharge confirms the team was told.' } });
          const x = T.briefing_acks.find((y) => y.briefing_id === a.p_id && y.person_id === uid), now = new Date().toISOString();
          if (x) { if (a.p_explained && !x.explained_at) x.explained_at = now; } else T.briefing_acks.push({ briefing_id: a.p_id, person_id: uid, acked_at: now, explained_at: a.p_explained ? now : null }); return ok(); }
        case 'settle_advances': return ok(0);
        case 'set_salary': T.salaries = T.salaries.filter((x) => x.person_id !== a.p_person).concat(a.p_monthly ? [{ person_id: a.p_person, monthly: a.p_monthly }] : []); return ok();
        case 'my_advance_room': { const sal = T.salaries.find((x) => x.person_id === uid); const used = T.advances.filter((x) => x.person_id === uid && x.status !== 'rejected').reduce((q, x) => q + Number(x.amount), 0);
          return ok({ salary: sal ? sal.monthly : null, limit: sal ? Math.round(sal.monthly * 0.25) : null, used }); }
        case 'apply_roster': return ok(0);
        case 'set_backup': { if (!['ops_manager', 'owner', 'admin'].includes(me().role)) return route.fulfill({ status: 400, json: { code: 'P0001', message: 'Only the ops manager and owners assign backups.' } });
          T.people.find((x) => x.id === a.p_id).backup_id = a.p_backup || null; return ok(); }
        case 'accept_cover': { const day = T._day || DAY, p = T.people.find((x) => x.id === a.p_person);
          if (!p || p.backup_id !== uid || !(T.roster || []).some((r) => r.person_id === p.id && r.day === day && r.off)) return route.fulfill({ status: 400, json: { code: 'P0001', message: 'You are not the backup for this person today.' } });
          T.cover_accepts ||= []; if (!T.cover_accepts.some((c) => c.person_id === p.id && c.day === day)) T.cover_accepts.push({ person_id: p.id, day, backup_id: uid, at: new Date().toISOString() }); return ok(); }
        case 'submit_staff_step': { const no = (m) => route.fulfill({ status: 400, json: { code: 'P0001', message: m } }); const day = T._day || DAY, p = T.people.find((x) => x.id === a.p_person);
          if (!p || !(p.lists || []).includes(a.p_list)) return no('This checklist is not set up for this person.');
          const cov = p.backup_id === uid && (T.roster || []).some((r) => r.person_id === p.id && r.day === day && r.off);
          if (p.id !== uid && !cov) return no('This checklist is not yours today.');
          if (!T.attendance.some((x) => x.person_id === uid && x.day === day && x.kind === 'in')) return no('Check in with your selfie first.');
          const ord = a.p_list === 'sc_mid' ? ['mprep', 'rush'] : a.p_list === 'sc_close' ? ['cstock', 'ckitchen', 'cleft', 'cfinal'] : a.p_list === 'ch_open' ? ['cbrief', 'cprep', 'cqc'] : a.p_list === 'ch_mid' ? ['crefill'] : ['grooming', 'briefing', 'equipment', 'workstation', 'store', 'paste', 'prep', 'topup'], i = ord.indexOf(a.p_step); T.staff_steps ||= [];
          const has = (s) => T.staff_steps.some((x) => x.person_id === p.id && x.day === day && x.list === a.p_list && x.step === s);
          if (i < 0) return no('Unknown step.'); if (i > 0 && !has(ord[i - 1])) return no('Finish the step before this one first.'); const old = T.staff_steps.find((x) => x.person_id === p.id && x.day === day && x.list === a.p_list && x.step === a.p_step);
          if (old && old.status !== 'rejected') return no('This step is already submitted.');
          const row = { person_id: p.id, day, list: a.p_list, step: a.p_step, answers: a.p_answers || {}, by_person: uid, at: new Date().toISOString(), status: 'submitted', checked_by: null, checked_at: null, note: old ? old.note : null };
          if (old) Object.assign(old, row); else T.staff_steps.push(row); return ok(); }
        case 'verify_staff_step': { const no = (m) => route.fulfill({ status: 400, json: { code: 'P0001', message: m } }); const me = T.people.find((x) => x.id === uid);
          if (!['ops_manager', 'owner', 'admin'].includes(me?.role)) return no('Only the ops manager and owners can approve checklists.');
          if (!a.p_ok && (a.p_note || '').trim().length < 2) return no('Write what needs to be redone.');
          const x = (T.staff_steps || []).find((z) => z.person_id === a.p_person && z.day === a.p_day && z.list === a.p_list && z.step === a.p_step && (z.status || 'approved') === 'submitted');
          if (!x) return no('This step was already checked.');
          Object.assign(x, { status: a.p_ok ? 'approved' : 'rejected', checked_by: uid, checked_at: new Date().toISOString(), note: a.p_ok ? null : a.p_note.trim() }); return ok(); }
        case 'start_task': Object.assign(T.tasks.find((x) => x.id === a.p_task), { status: 'in_progress', started_at: new Date().toISOString() }); return ok();
        case 'save_shift': if (a.p_id) Object.assign(T.shifts.find((x) => x.id === a.p_id), { name: a.p_name, start_time: a.p_start, end_time: a.p_end, active: a.p_active }); else T.shifts.push({ id: nid++, name: a.p_name, start_time: a.p_start, end_time: a.p_end, active: true }); return ok(1);
        case 'set_roster': if (!['ops_manager', 'owner', 'admin'].includes(me().role)) return route.fulfill({ status: 400, json: { code: 'P0001', message: 'Only the ops manager and owners can change the roster.' } });
          a.p_items.forEach((e) => { T.roster = T.roster.filter((r) => !(r.person_id === e.person && r.day === e.day)); if (e.off || e.shift) T.roster.push({ person_id: e.person, day: e.day, outlet_id: T.people.find((p) => p.id === e.person).outlet_id, shift_id: e.off ? null : e.shift, off: !!e.off }); }); return ok(a.p_items.length);
        case 'copy_roster_week': { const add = (dd, n) => new Date(new Date(dd + 'T12:00:00Z').getTime() + n * 864e5).toISOString().slice(0, 10); const src = T.roster.filter((r) => r.day >= a.p_from && r.day <= add(a.p_from, 6));
          src.forEach((r) => { T.roster = T.roster.filter((x) => !(x.person_id === r.person_id && x.day === add(r.day, 7))); T.roster.push({ ...r, day: add(r.day, 7) }); }); return ok(src.length); }
        case 'delete_person': { if (!['owner', 'admin'].includes(me().role)) return route.fulfill({ status: 400, json: { code: 'P0001', message: 'Only owners can delete staff.' } });
          const x = T.people.find((q) => q.id === a.p_id); Object.assign(x, { active: false, deleted_at: new Date().toISOString(), deleted_by: uid });
          T.tasks.forEach((t) => { if (t.assigned_to === a.p_id && ['open', 'in_progress', 'rejected'].includes(t.status)) t.status = 'cancelled'; }); return ok(); }
        case 'ask_request': T.requests.unshift({ id: nid++, person_id: uid, outlet_id: me().outlet_id, kind: a.p_kind, details: a.p_details, note: a.p_note || null, status: 'pending', created_at: new Date().toISOString() }); return ok(nid - 1);
        case 'decide_request': { if (!['ops_manager', 'owner', 'admin'].includes(me().role)) return route.fulfill({ status: 400, json: { code: 'P0001', message: 'Only the ops manager and owners can decide requests.' } });
          const r = T.requests.find((x) => x.id === a.p_id); Object.assign(r, { status: a.p_approve ? 'approved' : 'rejected', decided_by: uid, decided_at: new Date().toISOString(), decide_note: a.p_note || null });
          if (a.p_approve && r.kind === 'emergency_leave') T.leaves.unshift({ id: nid++, person_id: r.person_id, from_date: r.details.from, days: r.details.days, reason: 'Emergency: ' + (r.note || ''), status: 'approved', decided_by: uid, created_at: new Date().toISOString() });
          if (a.p_approve && r.kind === 'shift_change') { T.roster = T.roster.filter((x) => !(x.person_id === r.person_id && x.day === r.details.day)); T.roster.push({ person_id: r.person_id, day: r.details.day, outlet_id: r.outlet_id, shift_id: r.details.off ? null : r.details.shift, off: !!r.details.off }); }
          return ok(); }
        case 'cancel_task': Object.assign(T.tasks.find((x) => x.id === a.p_task), { status: 'cancelled' }); return ok();
        default: return ok();
      }
    }
    if (p.startsWith('/rest/v1/')) {
      const t = p.split('/').pop(); let rows = [...(T[t] || [])];
      if (t === 'tasks' && (url.searchParams.get('or') || '').includes('for_day.gte')) rows = rows.concat(T.tasks_hist || []);   // Daily operations → Day by day
      for (const [k, v] of url.searchParams) { if (/^(select|order|limit|or)$/.test(k)) continue; if (v.startsWith('eq.')) rows = rows.filter((r) => String(r[k]) === v.slice(3)); else if (v.startsWith('gte.')) rows = rows.filter((r) => r[k] != null && String(r[k]) >= v.slice(4)); else if (v.startsWith('lte.')) rows = rows.filter((r) => r[k] != null && String(r[k]) <= v.slice(4)); else if (v.startsWith('neq.')) rows = rows.filter((r) => String(r[k]) !== v.slice(4)); else if (v.startsWith('in.(')) { const set = v.slice(4, -1).split(',').map((x) => x.replace(/"/g, '')); rows = rows.filter((r) => set.includes(String(r[k]))); } }
      if (url.searchParams.get('order')?.startsWith('day')) rows.sort((a, b) => String(a.day).localeCompare(String(b.day)));
      if (url.searchParams.get('limit') === '1') rows = rows.slice(0, 1);
      if ((req.headers()['accept'] || '').includes('vnd.pgrst.object')) return rows.length ? route.fulfill({ json: rows[0] }) : route.fulfill({ status: 406, json: { code: 'PGRST116', message: 'no rows' } });
      return route.fulfill({ json: rows });
    }
    return route.fulfill({ json: {} });
  };
  return async (route) => { const r = await h(route); T._nid = Math.max(T._nid || 1000, nid); return r; };
}
