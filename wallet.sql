-- Apple Wallet: token público por cliente, token de autenticación del pase y registro de dispositivos
alter table public.clientes
  add column if not exists token uuid not null default gen_random_uuid(),
  add column if not exists pass_auth text not null default encode(gen_random_bytes(16),'hex'),
  add column if not exists updated_at timestamptz not null default now();
create unique index if not exists clientes_token_key on public.clientes(token);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists clientes_touch on public.clientes;
create trigger clientes_touch before update on public.clientes for each row execute function public.touch_updated_at();

create table if not exists public.pass_registros (
  device_id text not null,
  serial uuid not null references public.clientes(id) on delete cascade,
  push_token text not null,
  created_at timestamptz not null default now(),
  primary key (device_id, serial)
);
alter table public.pass_registros enable row level security; -- sin políticas: solo vía funciones

-- Tarjeta pública por token (página del cliente y generación del pase)
create or replace function public.tarjeta_por_token(p_token uuid)
returns table(id uuid, codigo text, nombre text, sellos int, total_visitas int, cortes_gratis int, pass_auth text, updated_at timestamptz)
language sql security definer set search_path = public stable as $$
  select id, codigo, nombre, sellos, total_visitas, cortes_gratis, pass_auth, updated_at from clientes where token = p_token
$$;

-- Alta de cliente desde la página pública
create or replace function public.registrar_cliente(p_nombre text, p_telefono text)
returns uuid language plpgsql security definer set search_path = public as $$
declare t uuid;
begin
  if length(trim(coalesce(p_nombre,''))) < 2 then raise exception 'Escribe tu nombre'; end if;
  insert into clientes(nombre, telefono) values (left(trim(p_nombre),60), nullif(left(trim(coalesce(p_telefono,'')),20),'')) returning token into t;
  return t;
end $$;

-- Web service de Apple Wallet (autenticado con el pass_auth de cada pase)
create or replace function public.wallet_pase(p_serial uuid, p_auth text)
returns table(id uuid, codigo text, nombre text, sellos int, total_visitas int, cortes_gratis int, pass_auth text, updated_at timestamptz)
language sql security definer set search_path = public stable as $$
  select id, codigo, nombre, sellos, total_visitas, cortes_gratis, pass_auth, updated_at from clientes where id = p_serial and pass_auth = p_auth
$$;

create or replace function public.wallet_registrar(p_device text, p_serial uuid, p_auth text, p_push text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from clientes where id = p_serial and pass_auth = p_auth) then return 'unauthorized'; end if;
  if exists (select 1 from pass_registros where device_id = p_device and serial = p_serial) then
    update pass_registros set push_token = p_push where device_id = p_device and serial = p_serial; return 'exists';
  end if;
  insert into pass_registros(device_id, serial, push_token) values (p_device, p_serial, p_push); return 'created';
end $$;

create or replace function public.wallet_baja(p_device text, p_serial uuid, p_auth text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from clientes where id = p_serial and pass_auth = p_auth) then return false; end if;
  delete from pass_registros where device_id = p_device and serial = p_serial; return true;
end $$;

create or replace function public.wallet_seriales(p_device text, p_since timestamptz)
returns table(serial uuid, updated_at timestamptz) language sql security definer set search_path = public stable as $$
  select c.id, c.updated_at from pass_registros r join clientes c on c.id = r.serial
  where r.device_id = p_device and (p_since is null or c.updated_at > p_since)
$$;

-- Tokens push de un cliente: solo para el barbero con sesión
create or replace function public.push_tokens(p_codigo text)
returns setof text language plpgsql security definer set search_path = public stable as $$
begin
  if auth.role() <> 'authenticated' then raise exception 'No autorizado'; end if;
  return query select r.push_token from pass_registros r join clientes c on c.id = r.serial where c.codigo = upper(trim(p_codigo));
end $$;

revoke execute on function public.tarjeta_por_token(uuid), public.registrar_cliente(text,text), public.wallet_pase(uuid,text),
  public.wallet_registrar(text,uuid,text,text), public.wallet_baja(text,uuid,text), public.wallet_seriales(text,timestamptz), public.push_tokens(text) from public;
grant execute on function public.tarjeta_por_token(uuid), public.registrar_cliente(text,text), public.wallet_pase(uuid,text),
  public.wallet_registrar(text,uuid,text,text), public.wallet_baja(text,uuid,text), public.wallet_seriales(text,timestamptz) to anon, authenticated;
grant execute on function public.push_tokens(text) to authenticated;
