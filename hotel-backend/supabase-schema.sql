-- Run this in your Supabase SQL Editor to create all required tables

create table if not exists users (
  id bigserial primary key,
  username text unique not null,
  password text not null,
  role text default 'admin',
  created_at timestamptz default now()
);

create table if not exists rooms (
  id bigserial primary key,
  room_number text unique not null,
  type text not null,
  floor integer default 1,
  capacity integer default 2,
  price_per_night numeric not null,
  status text default 'Available',
  amenities text default '',
  description text default '',
  created_at timestamptz default now()
);

create table if not exists guests (
  id bigserial primary key,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  id_type text,
  id_number text,
  nationality text,
  address text,
  created_at timestamptz default now()
);

create table if not exists bookings (
  id bigserial primary key,
  guest_id bigint references guests(id),
  room_id bigint references rooms(id),
  check_in date not null,
  check_out date not null,
  adults integer default 1,
  children integer default 0,
  total_amount numeric not null,
  status text default 'Confirmed',
  payment_status text default 'Pending',
  special_requests text default '',
  created_at timestamptz default now()
);

create table if not exists staff (
  id bigserial primary key,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  role text not null,
  department text not null,
  salary numeric default 0,
  status text default 'Active',
  join_date date,
  created_at timestamptz default now()
);

-- IMPORTANT: Disable Row Level Security (RLS) on all tables
-- (or configure policies if you want RLS enabled)
alter table users disable row level security;
alter table rooms disable row level security;
alter table guests disable row level security;
alter table bookings disable row level security;
alter table staff disable row level security;
