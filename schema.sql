create extension if not exists pgcrypto;

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default ('BRB-' || upper(substr(encode(gen_random_bytes(4),'hex'),1,6))),
  nombre text not null,
  telefono text,
  sellos int not null default 0 check (sellos >= 0),
  total_visitas int not null default 0,
  cortes_gratis int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.visitas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  tipo text not null check (tipo in ('sello','canje')),
  barbero text,
  created_at timestamptz not null default now()
);
create index if not exists visitas_created_idx on public.visitas(created_at desc);

alter table public.clientes enable row level security;
alter table public.visitas enable row level security;

drop policy if exists "staff clientes" on public.clientes;
create policy "staff clientes" on public.clientes for all to authenticated using (true) with check (true);
drop policy if exists "staff visitas" on public.visitas;
create policy "staff visitas" on public.visitas for select to authenticated using (true);

-- Meta de sellos para el corte gratis
create or replace function public.meta_sellos() returns int language sql immutable as $$ select 10 $$;

create or replace function public.registrar_sello(p_codigo text)
returns public.clientes language plpgsql security definer set search_path = public as $$
declare c public.clientes;
begin
  if auth.role() <> 'authenticated' then raise exception 'No autorizado'; end if;
  select * into c from clientes where codigo = upper(trim(p_codigo)) for update;
  if not found then raise exception 'Cliente no encontrado'; end if;
  if c.sellos >= meta_sellos() then raise exception 'El cliente ya tiene su corte gratis, canjéalo primero'; end if;
  update clientes set sellos = sellos + 1, total_visitas = total_visitas + 1 where id = c.id returning * into c;
  insert into visitas(cliente_id, tipo, barbero) values (c.id, 'sello', auth.jwt()->>'email');
  return c;
end $$;

create or replace function public.canjear_corte(p_codigo text)
returns public.clientes language plpgsql security definer set search_path = public as $$
declare c public.clientes;
begin
  if auth.role() <> 'authenticated' then raise exception 'No autorizado'; end if;
  select * into c from clientes where codigo = upper(trim(p_codigo)) for update;
  if not found then raise exception 'Cliente no encontrado'; end if;
  if c.sellos < meta_sellos() then raise exception 'Aún no completa sus sellos'; end if;
  update clientes set sellos = 0, cortes_gratis = cortes_gratis + 1, total_visitas = total_visitas + 1 where id = c.id returning * into c;
  insert into visitas(cliente_id, tipo, barbero) values (c.id, 'canje', auth.jwt()->>'email');
  return c;
end $$;

revoke execute on function public.registrar_sello(text), public.canjear_corte(text) from public, anon;
grant execute on function public.registrar_sello(text), public.canjear_corte(text) to authenticated;
