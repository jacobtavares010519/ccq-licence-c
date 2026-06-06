-- =============================================
-- NOVOLT — Supabase Schema + RLS
-- Run this in the Supabase SQL editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================
create type item_category as enum ('Tool', 'Equipment', 'Consumable');
create type item_condition as enum ('Good', 'NeedsRepair', 'Retired');
create type location_type as enum ('Office', 'Truck', 'Site');
create type site_status as enum ('Active', 'Completed', 'OnHold');
create type task_status as enum ('ToDo', 'InProgress', 'Done');
create type employee_status as enum ('Active', 'Inactive');
create type movement_action as enum ('Receive', 'Transfer', 'Consume');

-- =============================================
-- CORE TABLES
-- =============================================

create table trucks (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  number text not null,
  employee_id uuid,
  created_at timestamptz default now()
);

create table sites (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  client text,
  address text,
  status site_status not null default 'Active',
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz default now()
);

create table employees (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text,
  phone text,
  email text,
  truck_id uuid references trucks(id) on delete set null,
  status employee_status not null default 'Active',
  created_at timestamptz default now()
);

-- Add FK from trucks to employees (after both tables exist)
alter table trucks
  add constraint trucks_employee_id_fkey
  foreign key (employee_id) references employees(id) on delete set null;

-- =============================================
-- INVENTORY TABLES
-- =============================================

create table items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category item_category not null,
  condition item_condition,
  supplier text,
  supplier_ref text,
  min_qty numeric not null default 0,
  created_at timestamptz default now()
);

create table item_locations (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references items(id) on delete cascade,
  location_type location_type not null,
  location_id uuid,  -- null = Office (singleton), truck id, or site id
  quantity numeric not null default 0,
  updated_at timestamptz default now(),
  unique (item_id, location_type, location_id)
);

create table inventory_movements (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references items(id) on delete cascade,
  action movement_action not null,
  from_loc_type location_type,
  from_loc_id uuid,
  to_loc_type location_type,
  to_loc_id uuid,
  quantity numeric not null,
  date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

-- =============================================
-- HOURS & TASKS TABLES
-- =============================================

create table hours (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references employees(id) on delete cascade,
  site_id uuid not null references sites(id) on delete cascade,
  date date not null,
  hours numeric not null,
  notes text,
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade,
  title text not null,
  description text,
  employee_id uuid references employees(id) on delete set null,
  status task_status not null default 'ToDo',
  due_date date,
  created_at timestamptz default now()
);

-- =============================================
-- INDEXES
-- =============================================
create index on item_locations(item_id);
create index on inventory_movements(item_id);
create index on inventory_movements(date);
create index on hours(employee_id);
create index on hours(site_id);
create index on hours(date);
create index on tasks(site_id);
create index on tasks(status);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table sites enable row level security;
alter table employees enable row level security;
alter table trucks enable row level security;
alter table items enable row level security;
alter table item_locations enable row level security;
alter table inventory_movements enable row level security;
alter table hours enable row level security;
alter table tasks enable row level security;

-- Policy: authenticated users can read/write all rows
create policy "auth_all" on sites for all to authenticated using (true) with check (true);
create policy "auth_all" on employees for all to authenticated using (true) with check (true);
create policy "auth_all" on trucks for all to authenticated using (true) with check (true);
create policy "auth_all" on items for all to authenticated using (true) with check (true);
create policy "auth_all" on item_locations for all to authenticated using (true) with check (true);
create policy "auth_all" on inventory_movements for all to authenticated using (true) with check (true);
create policy "auth_all" on hours for all to authenticated using (true) with check (true);
create policy "auth_all" on tasks for all to authenticated using (true) with check (true);

-- =============================================
-- FUNCTION: update item_locations on movement
-- =============================================
create or replace function apply_inventory_movement()
returns trigger language plpgsql security definer as $$
begin
  -- Deduct from source
  if new.from_loc_type is not null then
    insert into item_locations(item_id, location_type, location_id, quantity)
    values (new.item_id, new.from_loc_type, new.from_loc_id, -new.quantity)
    on conflict (item_id, location_type, coalesce(location_id, '00000000-0000-0000-0000-000000000000'::uuid))
    do update set quantity = item_locations.quantity - new.quantity, updated_at = now();

    -- Actually use the unique constraint properly
    update item_locations
    set quantity = quantity - new.quantity, updated_at = now()
    where item_id = new.item_id
      and location_type = new.from_loc_type
      and (location_id = new.from_loc_id or (location_id is null and new.from_loc_id is null));
  end if;

  -- Add to destination
  if new.to_loc_type is not null then
    insert into item_locations(item_id, location_type, location_id, quantity)
    values (new.item_id, new.to_loc_type, new.to_loc_id, new.quantity)
    on conflict (item_id, location_type, location_id)
    do update set quantity = item_locations.quantity + new.quantity, updated_at = now();
  end if;

  return new;
end;
$$;

-- Simpler approach: manage item_locations from app layer for reliability
-- The trigger above is provided as reference; app-layer mutations are preferred.
