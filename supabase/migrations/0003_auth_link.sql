-- Auto-link a Supabase Auth user to their `members` row by matching email.
-- Flow: 1) seed the two members rows with their email addresses (done by the
-- seed script), 2) create the two Auth users (Dashboard -> Authentication ->
-- Users -> Add user, or have them sign up), 3) this trigger fills in
-- members.user_id automatically the moment each account is created.
--
-- Runs with the table owner's privileges (security definer), which is why it
-- can bypass RLS to write the link even though the new user has no member
-- row yet.

create or replace function link_member_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update members
  set user_id = new.id
  where user_id is null
    and lower(email) = lower(new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function link_member_on_signup();

-- Generic updated_at bookkeeping trigger, applied to every table that has
-- the column.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
  tables text[] := array[
    'households', 'accounts', 'transactions', 'assets', 'investments',
    'liabilities', 'goals'
  ];
begin
  foreach t in array tables loop
    execute format(
      'create trigger set_updated_at before update on %I for each row execute function set_updated_at();',
      t
    );
  end loop;
end $$;
