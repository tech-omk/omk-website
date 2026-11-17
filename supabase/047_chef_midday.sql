-- Chef mid-day checklist (3:00 – 4:00 pm, same as the senior chefs): Refill & kitchen support, approved by the ops manager.
-- Ramesh gets it; Roshan gets the same opening and mid-day checklists as Ramesh.
begin;

create or replace function public.submit_staff_step(p_person uuid, p_list text, p_step text, p_answers jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_day date := (now() at time zone 'Asia/Kolkata')::date; p people; ord text[]; i int; cur text;
begin
  select * into p from people where id = p_person and active;
  if p.id is null or not (p_list = any(p.lists)) then raise exception 'This checklist is not set up for this person.'; end if;
  if not (p.id = auth.uid() or public.covering_for(p.id)) then raise exception 'This checklist is not yours today.'; end if;
  if not exists (select 1 from attendance where person_id = auth.uid() and day = v_day and kind = 'in') then raise exception 'Check in with your selfie first.'; end if;
  ord := case p_list
    when 'sc_open' then array['grooming', 'briefing', 'equipment', 'workstation', 'store', 'paste', 'prep', 'topup']
    when 'sc_mid' then array['mprep', 'rush']
    when 'sc_close' then array['cstock', 'ckitchen', 'cleft', 'cfinal']
    when 'ch_open' then array['cbrief', 'cprep', 'cqc']
    when 'ch_mid' then array['crefill']
  end;
  i := array_position(ord, p_step);
  if i is null then raise exception 'Unknown step.'; end if;
  if i > 1 and not exists (select 1 from staff_steps where person_id = p.id and day = v_day and list = p_list and step = ord[i - 1]) then raise exception 'Finish the step before this one first.'; end if;
  select status into cur from staff_steps where person_id = p.id and day = v_day and list = p_list and step = p_step;
  if cur is not null and cur <> 'rejected' then raise exception 'This step is already submitted.'; end if;
  insert into staff_steps (person_id, day, list, step, answers, by_person, at, status) values (p.id, v_day, p_list, p_step, coalesce(p_answers, '{}'), auth.uid(), now(), 'submitted')
  on conflict (person_id, day, list, step) do update set answers = excluded.answers, by_person = excluded.by_person, at = now(), status = 'submitted', checked_by = null, checked_at = null;
end $$;
revoke all on function public.submit_staff_step(uuid, text, text, jsonb) from public, anon;
grant execute on function public.submit_staff_step(uuid, text, text, jsonb) to authenticated;

update public.people set lists = coalesce(lists, '{}') || array(select x from unnest(array['ch_open', 'ch_mid']) with ordinality as t(x, n) where not (x = any(coalesce(lists, '{}'))) order by n)
where active and ((outlet_id = 'rr' and name ~* '^ramesh\M') or name ~* '^roshan\M');

commit;
select 'chef mid-day checklist ready' as done, (select string_agg(name || ' (' || outlet_id || '): ' || array_to_string(lists, ', '), '; ') from public.people where 'ch_mid' = any(lists)) as who;
