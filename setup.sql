create table if not exists rankings (
  id bigint generated always as identity primary key,
  nickname text not null,
  time float8 not null,
  created_at timestamptz default now()
);

alter table rankings enable row level security;

create policy if not exists "누구나 읽기 가능" on rankings for select using (true);
create policy if not exists "누구나 삽입 가능" on rankings for insert with check (true);
create policy if not exists "누구나 삭제 가능" on rankings for delete using (true);
