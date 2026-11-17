import { useState } from 'react';
import { sb, errText, fmtTime, todayIST, uploadPhoto } from '../lib.js';
import { useToast, Icon, Chev, Camera, Photo, Thumbs, useBack, useKept } from '../ui.jsx';
import { personOf, shortOutlet, attOf } from '../data.js';
import { YesNo, Q, istHM, nowHM, staffOf, StockItems } from './OpsOpening.jsx';
import { PrepPlanView, prepOf, qtyText } from './Prep.jsx';
import { Rows } from './OpsClosing.jsx';

// Personal step checklists (one person's own list, step by step, each step submitted on its own).
// On the person's weekly off, their backup does it after accepting the day's work.
const YN = [['yes', 'Yes'], ['no', 'No']], NY = [['no', 'No'], ['yes', 'Yes']], PF = [['pass', 'Pass'], ['fail', 'Fail']];
// field: { k, l, t: 'yn'|'num'|'text'|'staff'|'photos'|'ack'|'pending'|'prep', o, min, opt, show: (a) => bool }
export const LISTS = {
  sc_open: { title: 'Opening checklist', role: 'Senior Chef', when: '10:30 am – 12:30 pm', from: '10:30', due: '12:30', steps: [
    ['grooming', 'Uniform, grooming & hygiene', 'Staff Grooming Verification', [
      { k: 'uniform', l: 'All kitchen staff wearing proper uniform?', t: 'yn' },
      { k: 'hair', l: 'Hair properly covered?', t: 'yn' },
      { k: 'nails', l: 'Nails clean and trimmed?', t: 'yn' },
      { k: 'grooming', l: 'Personal grooming maintained?', t: 'yn' },
      { k: 'issue', l: 'Any staff member not following hygiene standards?', t: 'yn', o: NY },
      { k: 'issue_staff', l: 'Staff name', t: 'staff', show: (a) => a.issue === 'yes' },
      { k: 'photos', l: 'Photo proof (2 photos)', t: 'photos', min: 2 },
    ]],
    ['briefing', 'Daily briefing & preparation plan', 'Daily Briefing / Preparation Plan Confirmation', [
      { k: 'ack', l: 'Daily briefing checked', t: 'ack' },
      { k: 'explained', l: 'Briefing explained to all kitchen staff?', t: 'yn' },
      { k: 'informed', l: "All kitchen staff informed about today's work?", t: 'yn' },
      { k: 'plan', l: 'Preparation plan', t: 'prep' },
      { k: 'plan_checked', l: 'Preparation plan checked?', t: 'yn' },
      { k: 'tasks_told', l: 'All kitchen staff informed about their assigned tasks?', t: 'yn' },
      { k: 'qty_told', l: 'Required quantities explained?', t: 'yn' },
      { k: 'missing', l: 'Any preparation item missing from plan?', t: 'yn', o: NY },
      { k: 'remarks', l: 'Remarks', t: 'text', opt: true },
      { k: 'photos', l: 'Group photo proof (2 photos)', t: 'photos', min: 2 },
    ]],
    ['equipment', 'Kitchen equipment check', 'Kitchen Equipment Verification', [
      { k: 'machines', l: 'All kitchen machines working?', t: 'yn' },
      { k: 'stoves', l: 'Stoves working?', t: 'yn' },
      { k: 'gas', l: 'Gas connection checked?', t: 'yn' },
      { k: 'broken', l: 'Any equipment not working?', t: 'yn', o: NY },
      { k: 'details', l: 'Issue details', t: 'text', show: (a) => a.broken === 'yes' || a.machines === 'no' || a.stoves === 'no' || a.gas === 'no' },
      { k: 'photos', l: 'Proof photos of all machines and stoves', t: 'photos', min: 2 },
    ]],
    ['workstation', 'Workstation arrangement', 'Workstation Verification', [
      { k: 'stations', l: 'All cooking workstations and machines arranged?', t: 'yn' },
      { k: 'vessels', l: 'Cooking vessels and utensils available?', t: 'yn' },
      { k: 'places', l: 'All kitchen items arranged in their correct places?', t: 'yn' },
      { k: 'missing', l: 'Any item missing in the kitchen?', t: 'yn', o: NY },
      { k: 'damaged', l: 'Any item damaged?', t: 'yn', o: NY },
      { k: 'details', l: 'What is missing / damaged', t: 'text', show: (a) => a.missing === 'yes' || a.damaged === 'yes' },
      { k: 'photos', l: 'Photos of all workstations', t: 'photos', min: 2 },
    ]],
    ['store', 'Store-to-kitchen ingredient collection', 'Store-to-Kitchen Verification', [
      { k: 'collected', l: 'All required ingredients collected from store?', t: 'yn' },
      { k: 'backup_veg', l: 'Backup vegetables collected?', t: 'yn' },
      { k: 'reached', l: 'All required items reached kitchen?', t: 'yn' },
      { k: 'details', l: 'What is short', t: 'text', show: (a) => a.collected === 'no' || a.reached === 'no' },
      { k: 'photos', l: 'Proof photo', t: 'photos', min: 1 },
    ]],
    ['paste', 'Paste / premix preparation & top-up', 'Paste / Premix Preparation & Top-up', [
      { k: 'prepared', l: 'All required pastes prepared?', t: 'yn' },
      { k: 'topped', l: 'All pastes topped up?', t: 'yn' },
      { k: 'shortage', l: 'Any paste shortage?', t: 'yn', o: NY },
      { k: 'shortage_note', l: 'Which paste is short', t: 'text', show: (a) => a.shortage === 'yes' },
      { k: 'qty', l: 'Quantity prepared today', t: 'num', opt: true, unit: 'kg' },
      { k: 'premix', l: 'All premixes (kabab, tandoori, coating mix) prepared?', t: 'yn' },
      { k: 'photos', l: 'Proof photo', t: 'photos', min: 1 },
    ]],
    ['prep', 'Preparation verification', 'Preparation Verification', [
      { k: 'rice', l: 'Rice preparation completed?', t: 'yn' },
      { k: 'rice_qty', l: 'Rice quantity as per plan?', t: 'yn' },
      { k: 'rice_quality', l: 'Rice quality checked', t: 'yn', o: PF },
      { k: 'egg_boil', l: 'Egg boiling completed?', t: 'yn' },
      { k: 'egg_peel', l: 'Egg peeling completed?', t: 'yn' },
      { k: 'veg', l: 'Vegetable chopping completed?', t: 'yn' },
      { k: 'as_plan', l: 'All preparation quantities as per plan?', t: 'yn' },
      { k: 'shortage', l: 'Any preparation shortage?', t: 'yn', o: NY },
      { k: 'quality', l: 'Any quality issue?', t: 'yn', o: NY },
      { k: 'staff', l: 'Staff name', t: 'staff', show: (a) => a.shortage === 'yes' || a.quality === 'yes' || a.rice_quality === 'fail' },
      { k: 'remarks', l: 'Remarks', t: 'text', opt: true },
      { k: 'photos', l: 'Proof photo', t: 'photos', min: 1 },
    ]],
    ['topup', 'Ingredient & top-up verification', 'Ingredient & Top-up Verification', [
      { k: 'oil', l: 'Oil topped up?', t: 'yn' },
      { k: 'sauces', l: 'All sauces topped up?', t: 'yn' },
      { k: 'masalas', l: 'All masalas topped up?', t: 'yn' },
      { k: 'ingredients', l: 'All ingredients topped up?', t: 'yn' },
      { k: 'water', l: 'Drinking water topped up?', t: 'yn' },
      { k: 'parcel', l: 'Parcel boxes topped up?', t: 'yn' },
      { k: 'plates', l: 'Plates arranged?', t: 'yn' },
      { k: 'spoons', l: 'Spoons arranged?', t: 'yn' },
      { k: 'shortage', l: 'Any shortage?', t: 'yn', o: NY },
      { k: 'shortage_note', l: 'What is short', t: 'text', show: (a) => a.shortage === 'yes' },
      { k: 'ready', l: 'Kitchen ready before 12:30 PM?', t: 'yn' },
      { k: 'pending', l: 'Any pending task?', t: 'yn', o: NY },
      { k: 'pending_list', l: 'Pending tasks', t: 'pending', show: (a) => a.pending === 'yes' },
      { k: 'pending_note', l: 'Pending task details', t: 'text', show: (a) => a.pending === 'yes' },
      { k: 'photos', l: 'Proof photo', t: 'photos', min: 1 },
    ]],
  ] },
  sc_mid: { title: 'Mid-day checklist', role: 'Senior Chef', when: '3:00 – 4:00 pm', from: '15:00', due: '16:00', steps: [
    ['mprep', 'Preparation verification', 'Mid-Day Preparation Verification', [
      { k: 'plan', l: 'First-batch preparation plan', t: 'plan', slot: 'morning', avail: true },
      { k: 'team', l: 'Pending and rejected tasks of the team', t: 'teamtasks' },
      { k: 'checked', l: 'All first-batch preparations checked?', t: 'yn' },
      { k: 'avail_ok', l: 'Available quantities verified?', t: 'yn' },
      { k: 'issue', l: 'Any shortage or quality issue?', t: 'yn', o: NY },
      { k: 'extra', l: 'Any additional preparation requirement?', t: 'yn', o: NY },
      { k: 'remarks', l: 'Remarks', t: 'text', opt: true },
      { k: 'photos', l: 'Photo proof', t: 'photos', min: 1 },
    ]],
    ['rush', 'Rush-hour preparation', 'Rush Hour Verification', [
      { k: 'plan', l: 'Batch 2 (evening) preparation plan', t: 'plan', slot: 'evening' },
      { k: 'reviewed', l: 'Rush-hour plan reviewed?', t: 'yn' },
      { k: 'informed', l: 'Assigned staff informed?', t: 'yn' },
      { k: 'done', l: 'Rush-hour preparation completed?', t: 'yn' },
      { k: 'qty_ok', l: 'Actual quantities checked?', t: 'yn' },
      { k: 'quality', l: 'Quality checked?', t: 'yn' },
      { k: 'shortage', l: 'Any shortage or rejection?', t: 'yn', o: NY },
      { k: 'shortage_note', l: 'What is short or rejected', t: 'text', show: (a) => a.shortage === 'yes' },
      { k: 'sauces', l: 'All sauce top-up done?', t: 'yn' },
      { k: 'paste', l: 'Paste and premix checked?', t: 'yn' },
      { k: 'oil', l: 'Oil and ingredients top-up done?', t: 'yn' },
      { k: 'service', l: 'Plates, spoons and water top-up done?', t: 'yn' },
      { k: 'photos', l: 'Photo proof', t: 'photos', min: 1 },
    ]],
  ] },
  ch_open: { title: 'Opening checklist', role: 'Chef', when: '10:00 am – 12:00 pm', from: '10:00', due: '12:00', steps: [
    ['cbrief', 'Briefing & arrangement', 'Morning & Arrangement', [
      { k: 'ack', l: "Operations manager's daily briefing", t: 'ack' },
      { k: 'plan', l: 'Preparation plan (your items are highlighted)', t: 'prep' },
      { k: 'opened', l: 'Briefing opened?', t: 'yn' },
      { k: 'plan_checked', l: 'Preparation plan checked?', t: 'yn' },
      { k: 'understood', l: 'Assigned preparation understood?', t: 'yn' },
      { k: 'clarify', l: 'Any clarification required?', t: 'yn', o: NY },
      { k: 'clarify_note', l: 'What needs clarification', t: 'text', show: (a) => a.clarify === 'yes' },
      { k: 'station', l: 'All preparation stations arranged?', t: 'yn' },
      { k: 'utensils', l: 'Required utensils available?', t: 'yn' },
      { k: 'equipment', l: 'Stove, machine, utensil and fridge arrangement done?', t: 'yn' },
      { k: 'received', l: 'Ingredients & stock received from store?', t: 'yn' },
      { k: 'missing', l: 'Any item missing?', t: 'yn', o: NY },
      { k: 'missing_note', l: 'What is missing', t: 'text', show: (a) => a.missing === 'yes' },
      { k: 'photos', l: 'Photo proof', t: 'photos', min: 1 },
    ]],
    ['cprep', 'Preparation plan', 'Preparation Plan', [
      { k: 'plan', l: 'Your preparation items: required vs actually prepared', t: 'plan', slot: 'morning', mine: true },
      { k: 'fifo', l: 'Opening stock – FIFO done?', t: 'yn' },
      { k: 'photos', l: 'Photo proof', t: 'photos', min: 1 },
    ]],
    ['cqc', 'Verification & quality check', 'Verification & Quality Check', [
      { k: 'available', l: 'All assigned items available?', t: 'yn' },
      { k: 'completed', l: 'All assigned preparation completed?', t: 'yn' },
      { k: 'as_plan', l: 'Quantity as per plan?', t: 'yn' },
      { k: 'quality', l: 'Quality checked?', t: 'yn' },
      { k: 'correction', l: 'Any correction required?', t: 'yn', o: NY },
      { k: 'pending', l: 'Any pending preparation?', t: 'yn', o: NY },
      { k: 'shortage', l: 'Any shortage?', t: 'yn', o: NY },
      { k: 'remarks', l: 'Remarks', t: 'text', opt: true },
      { k: 'photos', l: 'Photo proof', t: 'photos', min: 1 },
    ]],
  ] },
  ch_mid: { title: 'Mid-day checklist', role: 'Chef', when: '3:00 – 4:00 pm', from: '15:00', due: '16:00', steps: [
    ['crefill', 'Refill & kitchen support', 'Refill & Kitchen Support', [
      { k: 'items', l: 'Your first-batch preparation items', t: 'refill' },
      { k: 'topup', l: 'Sauce / oil / water top-up done?', t: 'yn' },
      { k: 'paste', l: 'All paste and premix top-up done?', t: 'yn' },
      { k: 'plates', l: 'Plates and spoons arrangement done?', t: 'yn' },
      { k: 'after', l: 'After photos', t: 'photos', min: 1 },
    ]],
  ] },
  sc_close: { title: 'Closing checklist', role: 'Senior Chef', when: '10:30 – 11:30 pm', from: '22:30', due: '23:30', steps: [
    ['cstock', 'Closing inventory', 'Closing Inventory Verification', [
      { k: 'stock', l: "Today's leftover (closing stock) of each item", t: 'inventory' },
      { k: 'variance', l: 'Any difference or shortage in stock?', t: 'yn', o: NY },
      { k: 'variance_note', l: 'What is short or different', t: 'text', show: (a) => a.variance === 'yes' },
      { k: 'photos', l: 'Photo proof', t: 'photos', min: 1 },
    ]],
    ['ckitchen', 'Closing kitchen verification', 'Closing Kitchen Verification', [
      { k: 'day', l: "Today's preparation and staff tasks", t: 'daysum' },
      { k: 'team', l: 'Pending and rejected tasks of the team', t: 'teamtasks' },
      { k: 'cleaning', l: 'All kitchen cleaning tasks completed?', t: 'yn' },
      { k: 'verified', l: 'All staff tasks verified?', t: 'yn' },
      { k: 'pending', l: 'Any pending work?', t: 'yn', o: NY },
      { k: 'quality', l: 'Any unresolved quality issue?', t: 'yn', o: NY },
      { k: 'mopping', l: 'Kitchen sweeping & mopping done?', t: 'yn' },
      { k: 'packed', l: 'All leftover items packed?', t: 'yn' },
      { k: 'remarks', l: 'Remarks', t: 'text', opt: true },
      { k: 'photos', l: 'Photo proof', t: 'photos', min: 1 },
      { k: 'after', l: 'After photo', t: 'photos', min: 1 },
    ]],
    ['cleft', 'Leftover & wastage verification', 'Kitchen Leftover & Wastage Verification', [
      { k: 'day', l: 'Prepared quantities across all batches', t: 'daysum', only: 'items' },
      { k: 'waste', l: 'Wasted items', t: 'waste' },
      { k: 'reported', l: 'All kitchen leftover quantities reported?', t: 'yn' },
      { k: 'unreported', l: 'Any unreported wastage?', t: 'yn', o: NY },
      { k: 'stored', l: 'All food packed and stored properly?', t: 'yn' },
      { k: 'discrepancy', l: 'Any discrepancy?', t: 'yn', o: NY },
      { k: 'details', l: 'Details', t: 'text', show: (a) => a.unreported === 'yes' || a.discrepancy === 'yes' },
      { k: 'photos', l: 'Photo proof', t: 'photos', min: 1 },
    ]],
    ['cfinal', 'Final kitchen closing', 'Final Kitchen Closing Report', [
      { k: 'switched', l: 'All kitchen equipment switched off safely?', t: 'yn' },
      { k: 'gas', l: 'Gas connection checked?', t: 'yn' },
      { k: 'arranged', l: 'Kitchen items arranged properly?', t: 'yn' },
      { k: 'cleaned', l: 'Kitchen cleaning completed?', t: 'yn' },
      { k: 'fridge', l: 'Fridge and stored food checked?', t: 'yn' },
      { k: 'tomorrow', l: 'Any pending issue for tomorrow?', t: 'yn', o: NY },
      { k: 'tomorrow_note', l: 'What is pending for tomorrow', t: 'text', show: (a) => a.tomorrow === 'yes' },
      { k: 'remarks', l: 'Remarks', t: 'text', opt: true },
      { k: 'photos', l: 'Photo proof', t: 'photos', min: 1 },
    ]],
  ] },
};
// closing: today's first and second batch (required from the plan, prepared from the mid-day checklist) and the team's tasks
const daySum = (d, owner) => { const o = owner.outlet_id, items = [];
  [['morning', 'First batch', 'mprep'], ['evening', 'Additional batch', 'rush']].forEach(([slot, batch, step]) => { const got = stepOf(d, owner.id, 'sc_mid', step)?.answers?.plan || [];
    planRows(d, o, slot).forEach((r, i) => { const g = got[i] && got[i].item === r.name ? got[i] : null;
      items.push({ batch, item: r.name, unit: r.unit, required: qtyText(r), prepared: g ? g.prepared : null, balance: g ? g.balance : null }); }); });
  const T = (d.tasks || []).filter((t) => t.outlet_id === o && (t.for_day || '').slice(0, 10) === (d.day || todayIST()) && ['chef', 'housekeeping'].includes(personOf(d, t.assigned_to).role));
  const T2 = T.length ? T : (d.tasks || []).filter((t) => t.outlet_id === o && t.status !== 'cancelled' && ['chef', 'housekeeping'].includes(personOf(d, t.assigned_to).role));
  const c = (st) => T2.filter((t) => st.includes(t.status)).length;
  return { items, tasks: { done: c(['approved']), waiting: c(['submitted']), pending: c(['open', 'in_progress']), rejected: c(['rejected']) } }; };
function DaySumView({ v, only }) {
  const short = v.items.filter((r) => r.balance > 0), notDone = v.items.filter((r) => r.prepared === 'Not yet');
  return <>{v.items.length ? <div className="pc-rows ro ds-rows"><div className="pc-row pc-head"><span>Item · batch</span><span>Required</span><span>Prepared</span><span>Balance</span></div>
    {v.items.map((r, j) => <div key={j} className={'pc-row' + (r.balance > 0 ? ' short' : '')}><span><b>{r.item}</b><small>{r.batch}</small></span><span className="num">{r.required}</span><span className="num">{r.prepared ?? '–'}</span><span className={'num' + (r.balance > 0 ? ' bad-t' : '')}>{r.balance == null ? '–' : `${r.balance} ${r.unit}`}</span></div>)}</div>
    : <span className="sub">No preparation plan saved for today.</span>}
    {only !== 'items' && <div className="ds-sum"><span><b className="num">{v.tasks.done}</b>Tasks approved</span><span><b className="num">{v.tasks.waiting}</b>To verify</span><span><b className="num">{v.tasks.pending}</b>Pending</span><span><b className="num">{v.tasks.rejected}</b>Rejected</span>
      <span><b className="num">{short.length + notDone.length}</b>Preparation short / pending</span></div>}</>;
}
// closing: count every stock item (the same items the ops manager counts)
function InvCount({ d, reload, value = {}, onChange }) {
  const items = d.countItems || [];
  return <><StockItems d={d} reload={reload} />{items.length > 0 && <div className="oo-inv oo-inv2"><div className="oo-tr oo-th"><span className="grow">Item</span><span>Leftover</span></div>
    {items.map((i) => <div key={i.id} className="oo-tr"><span className="grow">{i.name}<small>{i.unit}</small></span>
      <span><input className="txt num" inputMode="decimal" value={value[i.id] ?? ''} placeholder="0" aria-label={`Closing ${i.name}`} onChange={(e) => onChange({ ...value, [i.id]: e.target.value.replace(/[^\d.]/g, '') })} /></span></div>)}</div>}</>;
}
const num = (v) => (v === '' || v == null ? null : Number(v));
const planRows = (d, o, slot) => (prepOf(d, o, d.day || todayIST(), slot)?.items || []);
const planFor = (d, owner, f) => planRows(d, owner.outlet_id, f.slot).map((r, i) => ({ r, i })).filter(({ r }) => !f.mine || r.assigned_to === owner.id);   // index kept: answers are stored by plan row
const rowDone = (r, x = {}, avail) => (r.unit === 'as per plan' ? !!x.prep : x.prep !== undefined && x.prep !== '') && (!avail || r.unit === 'as per plan' || (x.avail !== undefined && x.avail !== ''));
// first / second batch plan: required (from the ops manager's plan) vs prepared (and available now), balance worked out
function PlanCheck({ d, owner, f, value = {}, onChange }) {
  const R = planFor(d, owner, f);
  if (!R.length) return <span className="sub">{f.mine && planRows(d, owner.outlet_id, f.slot).length ? 'No items are assigned to you in today’s preparation plan.' : `No ${f.slot === 'evening' ? 'evening' : 'morning'} preparation plan saved for today. The ops manager adds it on the Briefing page.`}</span>;
  const set = (i, k, v) => onChange({ ...value, [i]: { ...(value[i] || {}), [k]: v } });
  const clean = (e) => e.target.value.replace(/[^\d.]/g, '');
  return <div className={'pc-rows' + (f.avail ? ' pc-av' : '')}><div className="pc-row pc-head"><span>Item · staff</span><span>Required</span><span>Prepared</span>{f.avail && <span>Available</span>}<span>Balance</span></div>
    {R.map(({ r, i }) => { const x = value[i] || {}, pp = r.unit === 'as per plan';
      const bal = !pp && r.qty != null && x.prep !== undefined && x.prep !== '' ? Math.max(0, Number(r.qty) - Number(x.prep)) : null;
      return <div key={i} className={'pc-row' + (bal > 0 ? ' short' : '')}><span><b>{r.name}</b><small>{r.assigned_to ? personOf(d, r.assigned_to).name : '–'}</small></span><span className="num">{qtyText(r)}</span>
        {pp ? <span className="pc-pp"><YesNo value={x.prep} onChange={(v) => set(i, 'prep', v)} opts={[['done', 'Done'], ['not', 'Not yet']]} /></span>
          : <span><input className="txt num" inputMode="decimal" placeholder={r.unit || '0'} value={x.prep ?? ''} onChange={(e) => set(i, 'prep', clean(e))} aria-label={`Prepared ${r.name}`} /></span>}
        {f.avail && !pp && (<span><input className="txt num" inputMode="decimal" placeholder={r.unit || '0'} value={x.avail ?? ''} onChange={(e) => set(i, 'avail', clean(e))} aria-label={`Available ${r.name}`} /></span>)}
        <span className={'num' + (bal > 0 ? ' bad-t' : '')}>{pp ? (x.prep === 'not' ? 'Pending' : '–') : bal == null ? '–' : `${bal} ${r.unit}`}</span></div>; })}</div>;
}
// chef mid-day: their own first-batch items – assigned (plan), prepared (their opening checklist), available (senior chef's mid-day check, where done), balance
const scOf = (d, o) => d.people.find((p) => p.active && p.outlet_id === o && (p.lists || []).includes('sc_mid'));
const refillRows = (d, owner) => { const mine = stepOf(d, owner.id, 'ch_open', 'cprep')?.answers?.plan || [], sc = scOf(d, owner.outlet_id), scx = sc ? stepOf(d, sc.id, 'sc_mid', 'mprep') : null, scp = scx?.answers?.plan || [];
  return planFor(d, owner, { slot: 'morning', mine: true }).map(({ r, i }) => { const m = mine.find((x) => x.item === r.name), j = scp.find((x) => x.item === r.name), pp = r.unit === 'as per plan';
    const prepared = m ? m.prepared : null, balance = !pp && r.qty != null && typeof prepared === 'number' ? Math.max(0, Number(r.qty) - prepared) : null;
    return { i, item: r.name, unit: r.unit, pp, assigned: qtyText(r), prepared, scAvail: j && j.available != null ? j.available : null, balance }; }); };
const refillSc = (d, owner) => { const sc = scOf(d, owner.outlet_id), x = sc ? stepOf(d, sc.id, 'sc_mid', 'mprep') : null;
  return { name: sc ? sc.name.split(' ')[0] : 'Senior chef', st: x ? stStatus(x) : null, at: x?.at }; };
const refillDone = (r, x = {}) => (r.pp || (x.avail ?? r.scAvail ?? '') !== '') && !!x.more && (x.more !== 'yes' || Number(x.more_qty) > 0) && !!x.quality;
const RV = { assigned: 'Assigned', prepared: 'Prepared', avail: 'Available', balance: 'Balance' };
function RefillHead({ sc }) {
  return <div className="rf-sc"><span>{sc.name}'s mid-day verification</span><b className={sc.st === 'approved' || sc.st === 'submitted' ? '' : 'bad-t'}>{sc.st ? `${sc.st === 'rejected' ? 'Sent back' : 'Done'} · ${fmtTime(sc.at)}` : 'Not done yet'}</b></div>;
}
function RefillCheck({ d, owner, value = {}, onChange }) {
  const R = refillRows(d, owner), sc = refillSc(d, owner);
  if (!R.length) return <span className="sub">{planRows(d, owner.outlet_id, 'morning').length ? 'No items are assigned to you in today’s preparation plan.' : 'No morning preparation plan saved for today. The ops manager adds it on the Briefing page.'}</span>;
  const set = (i, k, v) => onChange({ ...value, [i]: { ...(value[i] || {}), [k]: v } });
  const clean = (e) => e.target.value.replace(/[^\d.]/g, '');
  return <div className="rf-list"><RefillHead sc={sc} />{R.map((r) => { const x = value[r.i] || {}, av = x.avail ?? (r.scAvail != null ? String(r.scAvail) : '');
    return <div key={r.i} className={'rf-item' + (r.balance > 0 ? ' short' : '')}><b className="rf-name">{r.item}</b>
      <div className="rf-facts"><span><small>{RV.assigned}</small><b className="num">{r.assigned}</b></span><span><small>{RV.prepared}</small><b className="num">{r.prepared == null ? '–' : r.pp ? r.prepared : `${r.prepared} ${r.unit || ''}`}</b></span>
        <span><small>{RV.balance}</small><b className={'num' + (r.balance > 0 ? ' bad-t' : '')}>{r.balance == null ? '–' : `${r.balance} ${r.unit || ''}`}</b></span></div>
      {!r.pp && <div className="rf-q"><span>Available now{r.scAvail != null && x.avail === undefined ? <small> · from {sc.name}</small> : null}</span><div className="oo-numin"><input className="txt num" inputMode="decimal" placeholder="0" value={av} onChange={(e) => set(r.i, 'avail', clean(e))} aria-label={`Available ${r.item}`} />{r.unit && <span>{r.unit}</span>}</div></div>}
      <div className="rf-q"><span>Additional preparation required?</span><YesNo value={x.more} onChange={(v) => set(r.i, 'more', v)} opts={NY} /></div>
      {x.more === 'yes' && <div className="rf-q"><span>Additional quantity suggested</span><div className="oo-numin"><input className="txt num" inputMode="decimal" placeholder="0" value={x.more_qty ?? ''} onChange={(e) => set(r.i, 'more_qty', clean(e))} aria-label={`Additional ${r.item}`} />{r.unit && !r.pp && <span>{r.unit}</span>}</div></div>}
      <div className="rf-q"><span>Any quality issue?</span><YesNo value={x.quality} onChange={(v) => set(r.i, 'quality', v)} opts={NY} /></div></div>; })}</div>;
}
function RefillView({ v }) {
  if (!v.items.length) return <span className="sub">No items assigned that day.</span>;
  return <div className="rf-list"><RefillHead sc={v.sc} />{v.items.map((r, j) => <div key={j} className={'rf-item' + (r.balance > 0 || r.quality === 'yes' ? ' short' : '')}><b className="rf-name">{r.item}</b>
    <div className="rf-facts"><span><small>{RV.assigned}</small><b className="num">{r.assigned}</b></span><span><small>{RV.prepared}</small><b className="num">{r.prepared ?? '–'}</b></span><span><small>{RV.avail}</small><b className="num">{r.available == null ? '–' : `${r.available} ${r.unit || ''}`}</b></span><span><small>{RV.balance}</small><b className={'num' + (r.balance > 0 ? ' bad-t' : '')}>{r.balance == null ? '–' : `${r.balance} ${r.unit || ''}`}</b></span></div>
    <div className="oo-kv"><span>Additional preparation</span><b className={r.more === 'yes' ? 'bad-t' : ''}>{r.more === 'yes' ? `Yes · ${r.more_qty} ${r.unit && r.unit !== 'as per plan' ? r.unit : ''}` : 'No'}</b></div>
    <div className="oo-kv"><span>Quality issue</span><b className={r.quality === 'yes' ? 'bad-t' : ''}>{r.quality === 'yes' ? 'Yes' : 'No'}</b></div></div>)}</div>;
}
const teamTasks = (d, o, pid) => (d.tasks || []).filter((t) => t.outlet_id === o && t.assigned_to !== pid && ['open', 'in_progress', 'submitted', 'rejected'].includes(t.status) && ['chef', 'housekeeping'].includes(personOf(d, t.assigned_to).role));
const TSTAT = { open: 'Not started', in_progress: 'In progress', submitted: 'To verify', rejected: 'Rejected' };

const weekOff = (d, p) => (d.roster || []).some((r) => r.person_id === p.id && r.day === (d.day || todayIST()) && r.off);
const shown = (f, a) => !f.show || f.show(a);
const filled = (f, a, d, owner) => { if (!shown(f, a) || f.opt || f.t === 'prep' || f.t === 'pending' || f.t === 'teamtasks' || f.t === 'daysum') return true; const v = a[f.k];
  if (f.t === 'plan') return planFor(d, owner, f).every(({ r, i }) => rowDone(r, (v || {})[i], f.avail));
  if (f.t === 'refill') return refillRows(d, owner).every((r) => refillDone(r, (v || {})[r.i]));
  if (f.t === 'photos') return (v || []).length >= f.min;
  if (f.t === 'waste') return (v || []).every((x) => x.item && Number(x.qty) > 0);
  if (f.t === 'inventory') return (d.countItems || []).length > 0 && (d.countItems || []).every((i) => v && v[i.id] !== undefined && v[i.id] !== '');
  if (f.t === 'staff') return (v || []).length > 0;
  if (f.t === 'text') return (v || '').trim().length >= 2;
  return v !== undefined && v !== '' && v !== null; };
export const stepOf = (d, pid, list, step, day = d.day || todayIST()) => (d.staffSteps || []).find((s) => s.person_id === pid && s.list === list && s.step === step && s.day === day);
// each submitted step waits for the ops manager: submitted -> approved, or rejected (sent back, filled again)
export const stStatus = (x) => (x ? x.status || 'approved' : null);
const counts = (x) => x && stStatus(x) !== 'rejected';
export const STEP_TAG = { submitted: ['amber', 'Waiting for approval'], approved: ['green', 'Approved'], rejected: ['red', 'Sent back'] };
export const listProgress = (d, pid, list) => { const L = LISTS[list], X = L.steps.map(([k]) => stepOf(d, pid, list, k)), done = X.filter(counts).length, last = X[X.length - 1], fin = counts(last) ? last : null;
  return { done, total: L.steps.length, fin, late: fin && istHM(fin.at) > L.due, started: done > 0, waiting: X.filter((x) => stStatus(x) === 'submitted').length, back: X.filter((x) => stStatus(x) === 'rejected').length, approved: X.filter((x) => stStatus(x) === 'approved').length }; };
// ops manager / owners: steps waiting for their approval
export const stepsToVerify = (me, d, f = 'all') => (['ops_manager', 'owner', 'admin'].includes(me.role) ? (d.staffSteps || []).filter((s) => stStatus(s) === 'submitted' && s.person_id !== me.id && LISTS[s.list] && (f === 'all' || personOf(d, s.person_id).outlet_id === f)) : [])
  .sort((a, b) => (a.at || '').localeCompare(b.at || ''));
export const coversToday = (me, d) => d.people.filter((p) => p.active && p.backup_id === me.id && p.id !== me.id && weekOff(d, p));
export const coverAccepted = (d, pid) => (d.covers || []).find((c) => c.person_id === pid && c.day === (d.day || todayIST()));
// the step checklists this person does today: their own (unless on weekly off), plus those of people they cover (once accepted)
export function myLists(me, d) {
  const self = d.people.find((p) => p.id === me.id) || me, out = [];
  if (!weekOff(d, self)) (self.lists || []).filter((l) => LISTS[l]).forEach((l) => out.push({ p: self, l }));
  coversToday(me, d).filter((p) => coverAccepted(d, p.id)).forEach((p) => (p.lists || []).filter((l) => LISTS[l]).forEach((l) => out.push({ p, l, cover: true })));
  return out;
}

// cards on Home and My Tasks
export function StepListCards({ me, d, onOpen }) {
  if (d.isToday === false) return null;
  const L = myLists(me, d); if (!L.length) return null;
  return <section className="card mtlist oo-cards">{L.map(({ p, l, cover }) => { const S = LISTS[l], g = listProgress(d, p.id, l), late = !g.fin && nowHM() > S.due;
    return <button key={p.id + l} className="oo-card" onClick={() => onOpen(p.id, l)}><span className={'ri ' + (g.fin ? 'g' : late ? 'r' : 'y')}><Icon name={g.fin ? 'check' : 'clip'} /></span>
      <span className="grow"><b>{S.title}{cover ? ` · for ${p.name}` : ''}</b><small>{g.back ? `${g.back} step${g.back === 1 ? '' : 's'} sent back · fill again` : g.fin ? `Submitted · ${fmtTime(g.fin.at)}${g.late ? ' (late)' : ''} · ${g.waiting ? 'waiting for approval' : 'approved'}` : `${S.when} · ${g.started ? `${g.done} of ${g.total} steps done` : late ? 'Not started · overdue' : 'Not started'}`}</small></span>
      {g.back ? <span className="tag red">Sent back</span> : g.fin ? <span className={'tag ' + (g.waiting ? 'amber' : 'green')}>{g.waiting ? 'Waiting' : 'Approved'}</span> : <span className="tag amber">{g.done}/{g.total}</span>}<Chev /></button>; })}</section>;
}

function Photos({ me, value = [], onChange, min, title }) {
  const toast = useToast(); const [cam, setCam] = useState(false), [up, setUp] = useState(0);
  const add = async (blob) => { setUp((n) => n + 1); try { const p = await uploadPhoto(blob, me, false); onChange((x) => [...(x || []), p]); } catch (e) { toast(errText(e)); } finally { setUp((n) => n - 1); } };
  return <><div className="tk-ph big">{value.map((p) => <span key={p} className="phx"><Photo path={p} group={value} alt="" /><button aria-label="Remove photo" onClick={() => onChange((x) => (x || []).filter((z) => z !== p))}><Icon name="x" size={14} /></button></span>)}
    {Array.from({ length: up }, (_, i) => <span key={'u' + i} className="ph"><span className="spin" /></span>)}
    <button className="tk-add" onClick={() => setCam(true)}><Icon name="camera" /><span className="num">{value.length}/{min}</span></button></div>
    {cam && <Camera title={title} multi have={value.length} onPhoto={add} onClose={() => setCam(false)} />}</>;
}

function Ack({ me, d, owner, value, set, reload }) {
  const toast = useToast(); const [busy, setBusy] = useState(false);
  const b = (d.briefings || []).filter((x) => x.kind === 'opening' && (!x.outlet_id || x.outlet_id === owner.outlet_id));
  const acked = b.length && b.every((x) => (d.briefAcks || []).some((a) => a.briefing_id === x.id && a.person_id === me.id));
  if (acked && value !== 'yes') setTimeout(() => set('yes'));
  if (!b.length && value !== 'none') setTimeout(() => set('none'));
  const ack = async () => { setBusy(true); for (const x of b) { const { error } = await sb.rpc('ack_briefing', { p_id: x.id, p_explained: false }); if (error) { setBusy(false); return toast(errText(error)); } } setBusy(false); reload(); };
  if (!b.length) return <span className="sub">The ops manager has not sent the opening briefing yet.</span>;
  return <>{b.map((x) => <p key={x.id} className="bf-full">{x.body}</p>)}
    {acked ? <span className="tag green">Acknowledged</span> : <button className="btn yolk small" disabled={busy} onClick={ack}><Icon name="check" size={16} />I have read and understood</button>}</>;
}

export default function StepList({ me, d, reload, pid, list, onBack }) {
  const toast = useToast(); const S = LISTS[list], owner = personOf(d, pid), cover = pid !== me.id;
  const [busy, setBusy] = useState(false), [view, setView] = useState(false);
  const [a, setA] = useKept(`${me.id}:sl:${pid}:${list}`, {});
  useBack(view, () => setView(false));
  const past = d.isToday === false, next = S.steps.find(([k]) => !counts(stepOf(d, pid, list, k))), cur = next && !past ? next : null, redo = cur && stStatus(stepOf(d, pid, list, cur[0])) === 'rejected' ? stepOf(d, pid, list, cur[0]) : null;
  const set = (k, v) => setA((x) => ({ ...x, [k]: typeof v === 'function' ? v(x[k]) : v }));
  if (view) return <StepListView d={d} pid={pid} list={list} onBack={() => setView(false)} />;
  const inn = attOf(d, me.id, 'in');
  const staff = staffOf(d, owner.outlet_id).filter((p) => p.id !== pid);
  const fields = cur ? cur[3] : [], ok = fields.every((f) => filled(f, a, d, owner));
  const team = teamTasks(d, owner.outlet_id, pid);
  const myPending = (d.tasks || []).filter((t) => t.assigned_to === pid && ['open', 'in_progress', 'rejected'].includes(t.status));
  const submit = async () => { setBusy(true);
    const out = {}; fields.forEach((f) => { if (!shown(f, a) || f.t === 'prep') return; const v = a[f.k];
      if (f.t === 'staff') out[f.k] = (v || []).map((id) => personOf(d, id).name).join(', ');
      else if (f.t === 'pending') out[f.k] = myPending.map((t) => t.title);
      else if (f.t === 'daysum') out[f.k] = daySum(d, owner);
      else if (f.t === 'waste') out[f.k] = (v || []).map((r) => ({ item: r.item, qty: Number(r.qty), unit: r.unit, rate: r.rate === '' || r.rate == null ? null : Number(r.rate) }));
      else if (f.t === 'inventory') out[f.k] = (d.countItems || []).map((i) => ({ id: i.id, item: i.name, unit: i.unit, closing: num((v || {})[i.id]) }));
      else if (f.t === 'teamtasks') out[f.k] = team.map((t) => `${t.title} · ${personOf(d, t.assigned_to).name} · ${TSTAT[t.status]}`);
      else if (f.t === 'refill') { const sc = refillSc(d, owner); out[f.k] = { sc, items: refillRows(d, owner).map((r) => { const x = (v || {})[r.i] || {}, av = x.avail ?? (r.scAvail != null ? String(r.scAvail) : '');
        return { item: r.item, unit: r.unit, assigned: r.assigned, prepared: r.prepared == null ? null : r.pp ? r.prepared : `${r.prepared} ${r.unit || ''}`.trim(), available: r.pp ? null : num(av), balance: r.balance, more: x.more, more_qty: x.more === 'yes' ? num(x.more_qty) : null, quality: x.quality }; }) }; }
      else if (f.t === 'plan') out[f.k] = planFor(d, owner, f).map(({ r, i }) => { const x = (v || {})[i] || {}, pp = r.unit === 'as per plan';
        return { item: r.name, staff: r.assigned_to ? personOf(d, r.assigned_to).name : '', required: qtyText(r), unit: r.unit, prepared: pp ? (x.prep === 'done' ? 'Done' : 'Not yet') : num(x.prep), available: f.avail && !pp ? num(x.avail) : null, balance: !pp && r.qty != null ? Math.max(0, Number(r.qty) - Number(x.prep || 0)) : null }; });
      else if (v !== undefined && v !== '') out[f.k] = v; });
    const { error } = await sb.rpc('submit_staff_step', { p_person: pid, p_list: list, p_step: cur[0], p_answers: out }); setBusy(false);
    if (error) return toast(errText(error)); toast(`${cur[2]} sent to the ops manager for approval.`); setA({}); reload(); window.scrollTo(0, 0); };
  const last = S.steps[S.steps.length - 1][0];
  return <>
    <div><button className="back" onClick={onBack}><Icon name="back" />Back</button></div>
    <div className="th-head"><h2>{S.title}</h2><span className="sub">{shortOutlet(d, owner.outlet_id)} · {S.when}{cover ? ` · covering for ${owner.name} (weekly off)` : ''}</span></div>
    <section className="card oo-steps">{S.steps.map(([k, l], i) => { const x = stepOf(d, pid, list, k), on = cur && k === cur[0];
      const st = stStatus(x), dn = counts(x);
      return <button key={k} className={'oo-st' + (dn ? ' done' : on ? ' on' : '')} disabled={!x} onClick={() => setView(true)}><span className="oo-n">{dn ? <Icon name="check" size={14} /> : i + 1}</span>
        <span className="grow">{l}{x && <small className={'st-' + st}>{STEP_TAG[st][1]}</small>}</span>{dn ? <small className={istHM(x.at) > S.due ? 'late' : ''}>{fmtTime(x.at)}</small> : on ? <small>{st === 'rejected' ? 'Redo' : 'Now'}</small> : null}</button>; })}</section>
    {past ? <p className="sub">This is an earlier day.</p>
      : !cur ? <section className="card oo-form oo-fin"><Icon name="check" size={28} /><b>{S.title} submitted · {fmtTime(stepOf(d, pid, list, last).at)}</b>
        <small>{istHM(stepOf(d, pid, list, last).at) > S.due ? `Finished after ${S.when.split('– ')[1]}.` : 'Finished on time.'} {(() => { const g = listProgress(d, pid, list); return g.waiting ? `${g.waiting} step${g.waiting === 1 ? ' is' : 's are'} waiting for the ops manager's approval.` : 'All steps approved by the ops manager.'; })()} Tap any step above to see what was sent.</small></section>
      : !inn ? <section className="card oo-form"><p className="oo-warn">Check in with your selfie first. The checklist opens after you check in.</p></section>
      : <>{nowHM() < S.from && <p className="oo-warn">This checklist is for {S.when}.</p>}
        <h2 className="sh"><span>{S.steps.indexOf(cur) + 1}. {cur[1]}</span></h2>
        {redo && <section className="card oo-sentback"><Icon name="x" size={18} /><span className="grow"><b>Sent back by {personOf(d, redo.checked_by)?.name || 'the ops manager'}</b><small>“{redo.note}” · fill this step again and submit.</small></span></section>}
        <section className="card oo-form">{fields.filter((f) => shown(f, a)).map((f) => { const v = a[f.k];
          return <Q key={f.k} label={f.l + (f.opt ? ' (optional)' : '')} auto={f.t === 'ack' || f.t === 'pending' || f.t === 'teamtasks' || f.t === 'daysum'}>
            {f.t === 'yn' && <YesNo value={v} onChange={(x) => set(f.k, x)} opts={f.o || YN} />}
            {f.t === 'num' && <div className="oo-numin"><input className="txt num" inputMode="decimal" value={v ?? ''} placeholder="0" onChange={(e) => set(f.k, e.target.value.replace(/[^\d.]/g, ''))} />{f.unit && <span>{f.unit}</span>}</div>}
            {f.t === 'text' && <textarea className="txt" rows={2} value={v || ''} onChange={(e) => set(f.k, e.target.value)} />}
            {f.t === 'staff' && <div className="chips wrap">{staff.map((p) => <button key={p.id} className={'chip' + ((v || []).includes(p.id) ? ' on' : '')} onClick={() => set(f.k, (v || []).includes(p.id) ? v.filter((z) => z !== p.id) : [...(v || []), p.id])}>{p.name}</button>)}</div>}
            {f.t === 'photos' && <Photos me={me} value={v || []} min={f.min} title={f.l} onChange={(fn) => set(f.k, fn)} />}
            {f.t === 'ack' && <Ack me={me} d={d} owner={owner} value={v} set={(x) => set(f.k, x)} reload={reload} />}
            {f.t === 'prep' && (<PrepPlanView me={owner} d={d} slot="morning" /> || null)}
            {f.t === 'prep' && !(d.prepPlans || []).some((p) => p.outlet_id === owner.outlet_id && p.day === (d.day || todayIST()) && (p.slot || 'morning') === 'morning' && p.items?.length) && <span className="sub">No preparation plan saved yet for today.</span>}
            {f.t === 'daysum' && <DaySumView v={daySum(d, owner)} only={f.only} />}
            {f.t === 'waste' && <Rows kind="waste" value={v || []} onChange={(x) => set(f.k, x)} stock={d.countItems || []} />}
            {f.t === 'inventory' && <InvCount d={d} reload={reload} value={v || {}} onChange={(x) => set(f.k, x)} />}
            {f.t === 'refill' && <RefillCheck d={d} owner={owner} value={v || {}} onChange={(x) => set(f.k, x)} />}
            {f.t === 'plan' && <PlanCheck d={d} owner={owner} f={f} value={v || {}} onChange={(x) => set(f.k, x)} />}
            {f.t === 'teamtasks' && (team.length ? <div className="oo-inv oo-inv-ro tt-list">{team.map((t) => <div key={t.id} className="oo-tr"><span className="grow">{t.title}<small>{personOf(d, t.assigned_to).name}</small></span><span className={'tag ' + (t.status === 'rejected' ? 'red' : t.status === 'submitted' ? 'amber' : 'blue')}>{TSTAT[t.status]}</span></div>)}</div> : <span className="sub">No pending or rejected tasks for the team.</span>)}
            {f.t === 'pending' && (myPending.length ? <ul className="td-list">{myPending.map((t) => <li key={t.id}>{t.title}</li>)}</ul> : <span className="sub">No open tasks in the app.</span>)}
          </Q>; })}</section>
        <button className="btn yolk" disabled={busy || !ok} onClick={submit}><Icon name="check" />Submit: {cur[2]}</button></>}
  </>;
}

const ans = (f, v) => { if (Array.isArray(v)) return v.join(', ') || '–'; const o = (f.o || YN).find(([k]) => k === v); return v === 'none' ? 'No briefing sent' : o ? o[1] : v ?? '–'; };
// ops manager / owners (and the store incharge): what was submitted
export function StepListView({ d, pid, list, onBack }) {
  const S = LISTS[list], owner = personOf(d, pid);
  const KV = ({ k, v, bad }) => <div className="oo-kv"><span>{k}</span><b className={bad ? 'bad-t' : ''}>{v}</b></div>;
  return <>
    {onBack && <div><button className="back" onClick={onBack}><Icon name="back" />Back</button></div>}
    <div className="th-head"><h2>{owner.name} · {S.title}</h2><span className="sub">{shortOutlet(d, owner.outlet_id)} · {S.when}</span></div>
    {S.steps.map(([k, l], i) => { const x = stepOf(d, pid, list, k);
      return <section key={k} className="card oo-form"><div className="oo-vh"><b>{i + 1}. {l}</b>{x ? <span className={'tag ' + STEP_TAG[stStatus(x)][0]}>{STEP_TAG[stStatus(x)][1]} · {fmtTime(x.at)}</span> : <span className="tag grey">Not done</span>}</div>
        <StepBody d={d} pid={pid} list={list} i={i} x={x} /></section>; })}
  </>;
}

// the answers of one submitted step (also used in To verify)
export function StepBody({ d, pid, list, i, x }) {
  const S = LISTS[list], [k, l] = S.steps[i], B = x?.answers || {};
  const KV = ({ k, v, bad }) => <div className="oo-kv"><span>{k}</span><b className={bad ? 'bad-t' : ''}>{v}</b></div>;
  return <>
        {x && stStatus(x) === 'rejected' && <KV k="Sent back" v={`“${x.note}” · ${personOf(d, x.checked_by)?.name || ''}`} bad />}
        {x && stStatus(x) === 'approved' && x.checked_by && <KV k="Approved by" v={`${personOf(d, x.checked_by)?.name || ''} · ${fmtTime(x.checked_at)}`} />}
        {x && x.by_person !== pid && <KV k="Done by" v={`${personOf(d, x.by_person).name} (backup)`} />}
        {x && k === 'briefing' && <KV k="Preparation plan" v="Seen with the briefing" />}
        {x && S.steps[i][3].map((f) => { const v = B[f.k]; if (v === undefined || f.t === 'prep') return null;
          if (f.t === 'plan') return <div key={f.k} className="oo-q"><label>{f.l}</label>{v.length ? <div className={'pc-rows ro' + (f.avail ? ' pc-av' : '')}><div className="pc-row pc-head"><span>Item · staff</span><span>Required</span><span>Prepared</span>{f.avail && <span>Available</span>}<span>Balance</span></div>
            {v.map((r, j) => <div key={j} className={'pc-row' + (r.balance > 0 ? ' short' : '')}><span><b>{r.item}</b><small>{r.staff || '–'}</small></span><span className="num">{r.required}</span><span className="num">{r.prepared ?? '–'}</span>{f.avail && <span className="num">{r.available ?? '–'}</span>}<span className={'num' + (r.balance > 0 ? ' bad-t' : '')}>{r.balance == null ? '–' : `${r.balance} ${r.unit}`}</span></div>)}</div> : <span className="sub">No plan that day.</span>}</div>;
          if (f.t === 'refill') return <div key={f.k} className="oo-q"><label>{f.l}</label><RefillView v={v} /></div>;
          if (f.t === 'daysum') return <div key={f.k} className="oo-q"><label>{f.l}</label><DaySumView v={v} only={f.only} /></div>;
          if (f.t === 'waste') return <div key={f.k} className="oo-q"><label>{f.l}</label>{v.length ? <div className="oo-inv oo-inv-ro">{v.map((r, j) => <div key={j} className="oo-tr"><span className="grow">{r.item}</span><span className="num">{r.qty} {r.unit}{r.rate ? ` · ₹${Math.round(r.qty * r.rate)}` : ''}</span></div>)}</div> : <span className="sub">No wastage</span>}</div>;
          if (f.t === 'inventory') return <div key={f.k} className="oo-q"><label>{f.l}</label><div className="oo-inv oo-inv-ro"><div className="oo-tr oo-th"><span className="grow">Item</span><span>Closing</span></div>{v.map((r, j) => <div key={j} className="oo-tr"><span className="grow">{r.item}<small>{r.unit}</small></span><span className="num">{r.closing ?? '–'}</span></div>)}</div></div>;
          if (f.t === 'teamtasks') return <div key={f.k} className="oo-q"><label>{f.l}</label>{v.length ? <div className="oo-inv oo-inv-ro tt-list">{v.map((x, j) => { const [t, who, st] = x.split(' · ');
            return <div key={j} className="oo-tr"><span className="grow">{t}<small>{who}</small></span><span className={'tag ' + (st === 'Rejected' ? 'red' : st === 'To verify' ? 'amber' : 'blue')}>{st}</span></div>; })}</div> : <span className="sub">None</span>}</div>;
          if (f.t === 'photos') return <div key={f.k} className="oo-q"><label>{f.l}</label><Thumbs paths={v} label={l} /></div>;
          const bad = (f.o === NY && v === 'yes') || ((!f.o || f.o === YN) && v === 'no') || v === 'fail';
          return <KV key={f.k} k={f.l} v={ans(f, v)} bad={bad} />; })}
  </>;
}

// To verify: one step with approve / send back
export function StepReview({ d, s, reload, n }) {
  const toast = useToast(); const [busy, setBusy] = useState(false), [redo, setRedo] = useState(false), [note, setNote] = useState('');
  const S = LISTS[s.list], i = S.steps.findIndex(([k]) => k === s.step), late = istHM(s.at) > S.due;
  const decide = async (ok) => { setBusy(true);
    const { error } = await sb.rpc('verify_staff_step', { p_person: s.person_id, p_day: s.day, p_list: s.list, p_step: s.step, p_ok: ok, p_note: ok ? null : note.trim() }); setBusy(false);
    if (error) return toast(errText(error)); toast(ok ? 'Approved.' : 'Sent back.'); reload(); };
  return <div className="th-vitem">{n && <div className="th-vno num">{n}</div>}
    <section className="card oo-form"><div className="oo-vh"><b>{S.title} · {i + 1}. {S.steps[i][1]}</b><span className={'tag ' + (late ? 'amber' : 'green')}>{fmtTime(s.at)}{late ? ' · late' : ''}</span></div>
      <StepBody d={d} pid={s.person_id} list={s.list} i={i} x={s} /></section>
    {!redo ? <div className="th-act"><button className="btn ok" disabled={busy} onClick={() => decide(true)}><Icon name="check" />Approve</button>
      <button className="btn bad-line" disabled={busy} onClick={() => setRedo(true)}><Icon name="x" />Send back</button></div>
      : <section className="card th-act"><textarea className="txt" rows={2} placeholder="What needs to be redone?" value={note} onChange={(e) => setNote(e.target.value)} autoFocus />
        <div className="two"><button className="btn ghost" onClick={() => setRedo(false)}>Cancel</button><button className="btn danger" disabled={busy || note.trim().length < 2} onClick={() => decide(false)}>Send back</button></div></section>}
  </div>;
}

// Home card for the backup: "Today you cover for X (weekly off)" – accept to get their work
export function CoverCard({ me, d, reload }) {
  const toast = useToast(); const [busy, setBusy] = useState(0);
  if (d.isToday === false) return null;
  const C = coversToday(me, d); if (!C.length) return null;
  const accept = async (p) => { setBusy(p.id); const { error } = await sb.rpc('accept_cover', { p_person: p.id }); setBusy(0);
    if (error) return toast(errText(error)); toast(`Accepted. ${p.name.split(' ')[0]}'s work for today is in your My Tasks.`); reload(); };
  return <section className="card cover-card">{C.map((p) => { const ok = coverAccepted(d, p.id), n = (d.tasks || []).filter((t) => t.assigned_to === p.id && ['open', 'in_progress', 'rejected'].includes(t.status)).length, cl = (p.lists || []).filter((l) => LISTS[l]).length;
    return <div key={p.id} className="rq-h"><span className={'ri ' + (ok ? 'g' : 'a')}><Icon name="swap" /></span>
      <div className="grow"><b>{ok ? `You are covering for ${p.name} today` : `${p.name} is on weekly off – you are the backup`}</b>
        <small>{ok ? `Accepted at ${fmtTime(ok.at)} · ${p.name.split(' ')[0]} and the store incharge can see it.` : `${n} open task${n === 1 ? '' : 's'}${cl ? ` and ${cl} checklist${cl > 1 ? 's' : ''}` : ''} will come to you once you accept.`}</small></div>
      {!ok && <button className="btn yolk small" disabled={busy === p.id} onClick={() => accept(p)}><Icon name="check" size={16} />I accept</button>}</div>; })}</section>;
}
