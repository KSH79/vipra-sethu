create extension if not exists "pg_trgm" with schema "public";

create extension if not exists "postgis" with schema "public";


  create table "public"."admin_actions" (
    "id" uuid not null default gen_random_uuid(),
    "provider_id" uuid,
    "actor_id" uuid,
    "notes" text,
    "created_at" timestamp without time zone default now(),
    "metadata" jsonb,
    "action_type" text not null default 'edited'::text
      );


alter table "public"."admin_actions" enable row level security;


  create table "public"."admins" (
    "user_email" text not null,
    "role" text default 'admin'::text,
    "added_at" timestamp with time zone default now(),
    "added_by" text
      );


alter table "public"."admins" enable row level security;


  create table "public"."categories" (
    "code" text not null,
    "name" text not null,
    "description" text,
    "active" boolean not null default true,
    "sort_order" integer not null default 0,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."categories" enable row level security;


  create table "public"."provider_photos" (
    "id" uuid not null default gen_random_uuid(),
    "provider_id" uuid not null,
    "photo_url" text,
    "caption" text,
    "display_order" integer default 0,
    "uploaded_at" timestamp with time zone default now(),
    "original_path" text,
    "thumbnail_path" text,
    "mime_type" text,
    "size_bytes" integer,
    "width" integer,
    "height" integer,
    "created_at" timestamp with time zone not null default now(),
    "is_primary" boolean default true
      );


alter table "public"."provider_photos" enable row level security;


  create table "public"."provider_rituals" (
    "id" uuid not null default gen_random_uuid(),
    "provider_id" uuid not null,
    "ritual_name" text not null,
    "description" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."provider_rituals" enable row level security;


  create table "public"."providers" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" text not null,
    "phone" text not null,
    "whatsapp" text,
    "languages" text[],
    "photo_url" text,
    "status" text default 'pending_review'::text,
    "location" public.geography(Point,4326),
    "created_at" timestamp without time zone default now(),
    "email" text,
    "years_experience" integer,
    "about" text,
    "location_text" text,
    "service_radius_km" integer,
    "availability_notes" text,
    "travel_notes" text,
    "expectations" text[],
    "response_time_hours" integer,
    "rejection_reason" text,
    "profile_photo_url" text,
    "updated_at" timestamp with time zone default now(),
    "approved_at" timestamp with time zone,
    "approved_by" uuid,
    "category_code" text not null,
    "sampradaya_code" text,
    "search_tsvector" tsvector generated always as (((setweight(to_tsvector('english'::regconfig, COALESCE(name, ''::text)), 'A'::"char") || setweight(to_tsvector('english'::regconfig, COALESCE(about, ''::text)), 'B'::"char")) || setweight(to_tsvector('english'::regconfig, COALESCE(location_text, ''::text)), 'C'::"char"))) stored
      );


alter table "public"."providers" enable row level security;


  create table "public"."sampradayas" (
    "code" text not null,
    "name" text not null,
    "description" text,
    "active" boolean not null default true,
    "sort_order" integer not null default 0,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."sampradayas" enable row level security;

CREATE UNIQUE INDEX admin_actions_pkey ON public.admin_actions USING btree (id);

CREATE UNIQUE INDEX admins_pkey ON public.admins USING btree (user_email);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (code);

CREATE INDEX idx_admin_actions_action_type ON public.admin_actions USING btree (action_type);

CREATE INDEX idx_admin_actions_actor_id ON public.admin_actions USING btree (actor_id);

CREATE INDEX idx_admin_actions_created_at ON public.admin_actions USING btree (created_at DESC);

CREATE INDEX idx_admin_actions_provider_id ON public.admin_actions USING btree (provider_id);

CREATE INDEX idx_admins_role ON public.admins USING btree (role);

CREATE INDEX idx_categories_active_order ON public.categories USING btree (active, sort_order);

CREATE INDEX idx_provider_photos_display_order ON public.provider_photos USING btree (provider_id, display_order);

CREATE INDEX idx_provider_photos_provider_id ON public.provider_photos USING btree (provider_id);

CREATE INDEX idx_provider_rituals_name ON public.provider_rituals USING btree (ritual_name);

CREATE INDEX idx_provider_rituals_provider_id ON public.provider_rituals USING btree (provider_id);

CREATE INDEX idx_providers_category_code ON public.providers USING btree (category_code);

CREATE INDEX idx_providers_email ON public.providers USING btree (email);

CREATE INDEX idx_providers_geo ON public.providers USING gist (location);

CREATE INDEX idx_providers_languages ON public.providers USING gin (languages);

CREATE INDEX idx_providers_name_trgm ON public.providers USING gin (name public.gin_trgm_ops);

CREATE INDEX idx_providers_sampradaya_code ON public.providers USING btree (sampradaya_code);

CREATE INDEX idx_providers_search_tsvector ON public.providers USING gin (search_tsvector);

CREATE INDEX idx_providers_status ON public.providers USING btree (status);

CREATE INDEX idx_providers_updated_at ON public.providers USING btree (updated_at DESC);

CREATE INDEX idx_providers_user_id ON public.providers USING btree (user_id);

CREATE INDEX idx_sampradayas_active_order ON public.sampradayas USING btree (active, sort_order);

CREATE UNIQUE INDEX provider_photos_pkey ON public.provider_photos USING btree (id);

CREATE UNIQUE INDEX provider_rituals_pkey ON public.provider_rituals USING btree (id);

CREATE UNIQUE INDEX providers_pkey ON public.providers USING btree (id);

CREATE UNIQUE INDEX sampradayas_pkey ON public.sampradayas USING btree (code);

CREATE UNIQUE INDEX ux_provider_photos_primary ON public.provider_photos USING btree (provider_id) WHERE (is_primary IS TRUE);

alter table "public"."admin_actions" add constraint "admin_actions_pkey" PRIMARY KEY using index "admin_actions_pkey";

alter table "public"."admins" add constraint "admins_pkey" PRIMARY KEY using index "admins_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."provider_photos" add constraint "provider_photos_pkey" PRIMARY KEY using index "provider_photos_pkey";

alter table "public"."provider_rituals" add constraint "provider_rituals_pkey" PRIMARY KEY using index "provider_rituals_pkey";

alter table "public"."providers" add constraint "providers_pkey" PRIMARY KEY using index "providers_pkey";

alter table "public"."sampradayas" add constraint "sampradayas_pkey" PRIMARY KEY using index "sampradayas_pkey";

alter table "public"."admin_actions" add constraint "admin_actions_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE not valid;

alter table "public"."admin_actions" validate constraint "admin_actions_provider_id_fkey";

alter table "public"."admin_actions" add constraint "check_action_type" CHECK ((action_type = ANY (ARRAY['approved'::text, 'rejected'::text, 'suspended'::text, 'unsuspended'::text, 'edited'::text]))) not valid;

alter table "public"."admin_actions" validate constraint "check_action_type";

alter table "public"."provider_photos" add constraint "provider_photos_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE not valid;

alter table "public"."provider_photos" validate constraint "provider_photos_provider_id_fkey";

alter table "public"."provider_rituals" add constraint "provider_rituals_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE not valid;

alter table "public"."provider_rituals" validate constraint "provider_rituals_provider_id_fkey";

alter table "public"."providers" add constraint "check_email_format" CHECK (((email IS NULL) OR (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))) not valid;

alter table "public"."providers" validate constraint "check_email_format";

alter table "public"."providers" add constraint "check_status" CHECK ((status = ANY (ARRAY['pending_review'::text, 'approved'::text, 'rejected'::text, 'suspended'::text]))) not valid;

alter table "public"."providers" validate constraint "check_status";

alter table "public"."providers" add constraint "providers_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES auth.users(id) not valid;

alter table "public"."providers" validate constraint "providers_approved_by_fkey";

alter table "public"."providers" add constraint "providers_category_code_fkey" FOREIGN KEY (category_code) REFERENCES public.categories(code) not valid;

alter table "public"."providers" validate constraint "providers_category_code_fkey";

alter table "public"."providers" add constraint "providers_sampradaya_code_fkey" FOREIGN KEY (sampradaya_code) REFERENCES public.sampradayas(code) not valid;

alter table "public"."providers" validate constraint "providers_sampradaya_code_fkey";

set check_function_bodies = off;

do $$ begin
  create type "public"."geometry_dump" as ("path" integer[], "geom" public.geometry);
exception when duplicate_object then null; end $$;

CREATE OR REPLACE FUNCTION public.get_active_categories()
 RETURNS SETOF public.categories
 LANGUAGE sql
 STABLE
AS $function$
  select * from categories
  where active = true
  order by sort_order, name;
$function$
;

CREATE OR REPLACE FUNCTION public.get_active_sampradayas()
 RETURNS SETOF public.sampradayas
 LANGUAGE sql
 STABLE
AS $function$
  select * from sampradayas
  where active = true
  order by sort_order, name;
$function$
;

CREATE OR REPLACE FUNCTION public.get_category_stats()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select jsonb_object_agg(
    coalesce(c.name, 'Uncategorized'),
    provider_count
  )
  from (
    select
      p.category_code,
      count(*) as provider_count
    from providers p
    where p.status = 'approved'
    group by p.category_code
  ) counts
  left join categories c on c.code = counts.category_code;
$function$
;

CREATE OR REPLACE FUNCTION public.get_provider_details(provider_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select jsonb_build_object(
    'provider', (
      select row_to_json(pvt.*)
      from provider_with_taxonomies pvt
      where pvt.id = provider_id
    ),
    'photos', (
      select coalesce(jsonb_agg(row_to_json(ph.*) order by ph.display_order), '[]'::jsonb)
      from provider_photos ph
      where ph.provider_id = get_provider_details.provider_id
    ),
    'rituals', (
      select coalesce(jsonb_agg(row_to_json(pr.*)), '[]'::jsonb)
      from provider_rituals pr
      where pr.provider_id = get_provider_details.provider_id
    ),
    'admin_actions', (
      select coalesce(jsonb_agg(row_to_json(aa.*) order by aa.created_at desc), '[]'::jsonb)
      from admin_actions aa
      where aa.provider_id = get_provider_details.provider_id
    )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.get_sampradaya_stats()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select jsonb_object_agg(
    coalesce(s.name, 'Not specified'),
    provider_count
  )
  from (
    select
      p.sampradaya_code,
      count(*) as provider_count
    from providers p
    where p.status = 'approved'
    group by p.sampradaya_code
  ) counts
  left join sampradayas s on s.code = counts.sampradaya_code;
$function$
;

CREATE OR REPLACE FUNCTION public.log_provider_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO admin_actions (
      provider_id,
      actor_id,
      action_type,
      notes,
      metadata
    ) VALUES (
      NEW.id,
      auth.uid(), -- Current user who made the change
      NEW.status, -- Use status as action_type (approved, rejected, suspended)
      CASE 
        WHEN NEW.status = 'rejected' THEN NEW.rejection_reason
        ELSE 'Status changed from ' || OLD.status || ' to ' || NEW.status
      END,
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status,
        'changed_at', now()
      )
    );
    
    -- Update approved_at and approved_by if status changed to approved
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
      NEW.approved_at = now();
      NEW.approved_by = auth.uid();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$
;

create or replace view "public"."provider_with_taxonomies" as  SELECT p.id,
    p.user_id,
    p.name,
    p.phone,
    p.whatsapp,
    p.languages,
    p.photo_url,
    p.status,
    p.location,
    p.created_at,
    p.email,
    p.years_experience,
    p.about,
    p.location_text,
    p.service_radius_km,
    p.availability_notes,
    p.travel_notes,
    p.expectations,
    p.response_time_hours,
    p.rejection_reason,
    p.profile_photo_url,
    p.updated_at,
    p.approved_at,
    p.approved_by,
    p.category_code,
    p.sampradaya_code,
    c.name AS category_name,
    s.name AS sampradaya_name
   FROM ((public.providers p
     LEFT JOIN public.categories c ON ((c.code = p.category_code)))
     LEFT JOIN public.sampradayas s ON ((s.code = p.sampradaya_code)));


CREATE OR REPLACE FUNCTION public.search_providers(p_text text DEFAULT NULL::text, p_category text DEFAULT NULL::text, p_languages text[] DEFAULT NULL::text[], p_sampradaya text DEFAULT NULL::text, p_lat double precision DEFAULT NULL::double precision, p_lon double precision DEFAULT NULL::double precision, p_radius_km double precision DEFAULT 15, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS TABLE(providers public.providers, total_count bigint, distance_km double precision, text_similarity_score double precision, text_rank real)
 LANGUAGE sql
 STABLE
AS $function$
  select 
    p.*::providers,
    count(*) over() as total_count,
    case 
      when p_lat is not null and p_lon is not null and p.location is not null 
      then ST_Distance(p.location::geography, ST_MakePoint(p_lon,p_lat)::geography) / 1000
      else null
    end as distance_km,
    case 
      when p_text is not null then similarity(p.name, p_text)
      else null
    end as text_similarity_score,
    case 
      when p_text is not null then ts_rank(p.search_tsvector, plainto_tsquery('english', p_text))
      else null
    end as text_rank
  from providers p
  where p.status='approved'
    and (p_category is null or p.category_code=p_category)
    and (p_sampradaya is null or p.sampradaya_code=p_sampradaya)
    and (p_languages is null or p.languages && p_languages)
    and (
      p_text is null 
      or p.search_tsvector @@ plainto_tsquery('english', p_text)
      or p.name ilike '%'||p_text||'%'
      or (p_text is not null and similarity(p.name, p_text) > 0.2)
    )
    and (p_lat is null or p_lon is null or (p.location is not null and ST_DWithin(p.location::geography, ST_MakePoint(p_lon,p_lat)::geography, p_radius_km*1000)))
  order by 
    case when p_text is not null and ts_rank(p.search_tsvector, plainto_tsquery('english', p_text)) > 0.1 then 1 else 2 end,
    case when p_text is not null then ts_rank(p.search_tsvector, plainto_tsquery('english', p_text)) else 0 end desc,
    case when p_lat is not null and p_lon is not null and p.location is not null then ST_Distance(p.location::geography, ST_MakePoint(p_lon,p_lat)::geography) else 0 end,
    p.created_at desc
  limit p_limit offset p_offset;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

do $$ begin
  create type "public"."valid_detail" as ("valid" boolean, "reason" character varying, "location" public.geometry);
exception when duplicate_object then null; end $$;

CREATE OR REPLACE FUNCTION public.validate_admin_action()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Ensure actor_id is set (either from NEW or from auth.uid())
  IF NEW.actor_id IS NULL THEN
    NEW.actor_id = auth.uid();
  END IF;
  
  -- Validate that actor is an admin
  IF NOT EXISTS (
    SELECT 1 FROM admins a 
    WHERE a.user_email = (
      SELECT email FROM auth.users WHERE id = NEW.actor_id
    )
  ) THEN
    RAISE EXCEPTION 'Only admins can create admin actions';
  END IF;
  
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."admin_actions" to "anon";

grant insert on table "public"."admin_actions" to "anon";

grant references on table "public"."admin_actions" to "anon";

grant select on table "public"."admin_actions" to "anon";

grant trigger on table "public"."admin_actions" to "anon";

grant truncate on table "public"."admin_actions" to "anon";

grant update on table "public"."admin_actions" to "anon";

grant delete on table "public"."admin_actions" to "authenticated";

grant insert on table "public"."admin_actions" to "authenticated";

grant references on table "public"."admin_actions" to "authenticated";

grant select on table "public"."admin_actions" to "authenticated";

grant trigger on table "public"."admin_actions" to "authenticated";

grant truncate on table "public"."admin_actions" to "authenticated";

grant update on table "public"."admin_actions" to "authenticated";

grant delete on table "public"."admin_actions" to "service_role";

grant insert on table "public"."admin_actions" to "service_role";

grant references on table "public"."admin_actions" to "service_role";

grant select on table "public"."admin_actions" to "service_role";

grant trigger on table "public"."admin_actions" to "service_role";

grant truncate on table "public"."admin_actions" to "service_role";

grant update on table "public"."admin_actions" to "service_role";

grant delete on table "public"."admins" to "anon";

grant insert on table "public"."admins" to "anon";

grant references on table "public"."admins" to "anon";

grant select on table "public"."admins" to "anon";

grant trigger on table "public"."admins" to "anon";

grant truncate on table "public"."admins" to "anon";

grant update on table "public"."admins" to "anon";

grant delete on table "public"."admins" to "authenticated";

grant insert on table "public"."admins" to "authenticated";

grant references on table "public"."admins" to "authenticated";

grant select on table "public"."admins" to "authenticated";

grant trigger on table "public"."admins" to "authenticated";

grant truncate on table "public"."admins" to "authenticated";

grant update on table "public"."admins" to "authenticated";

grant delete on table "public"."admins" to "service_role";

grant insert on table "public"."admins" to "service_role";

grant references on table "public"."admins" to "service_role";

grant select on table "public"."admins" to "service_role";

grant trigger on table "public"."admins" to "service_role";

grant truncate on table "public"."admins" to "service_role";

grant update on table "public"."admins" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."provider_photos" to "anon";

grant insert on table "public"."provider_photos" to "anon";

grant references on table "public"."provider_photos" to "anon";

grant select on table "public"."provider_photos" to "anon";

grant trigger on table "public"."provider_photos" to "anon";

grant truncate on table "public"."provider_photos" to "anon";

grant update on table "public"."provider_photos" to "anon";

grant delete on table "public"."provider_photos" to "authenticated";

grant insert on table "public"."provider_photos" to "authenticated";

grant references on table "public"."provider_photos" to "authenticated";

grant select on table "public"."provider_photos" to "authenticated";

grant trigger on table "public"."provider_photos" to "authenticated";

grant truncate on table "public"."provider_photos" to "authenticated";

grant update on table "public"."provider_photos" to "authenticated";

grant delete on table "public"."provider_photos" to "service_role";

grant insert on table "public"."provider_photos" to "service_role";

grant references on table "public"."provider_photos" to "service_role";

grant select on table "public"."provider_photos" to "service_role";

grant trigger on table "public"."provider_photos" to "service_role";

grant truncate on table "public"."provider_photos" to "service_role";

grant update on table "public"."provider_photos" to "service_role";

grant delete on table "public"."provider_rituals" to "anon";

grant insert on table "public"."provider_rituals" to "anon";

grant references on table "public"."provider_rituals" to "anon";

grant select on table "public"."provider_rituals" to "anon";

grant trigger on table "public"."provider_rituals" to "anon";

grant truncate on table "public"."provider_rituals" to "anon";

grant update on table "public"."provider_rituals" to "anon";

grant delete on table "public"."provider_rituals" to "authenticated";

grant insert on table "public"."provider_rituals" to "authenticated";

grant references on table "public"."provider_rituals" to "authenticated";

grant select on table "public"."provider_rituals" to "authenticated";

grant trigger on table "public"."provider_rituals" to "authenticated";

grant truncate on table "public"."provider_rituals" to "authenticated";

grant update on table "public"."provider_rituals" to "authenticated";

grant delete on table "public"."provider_rituals" to "service_role";

grant insert on table "public"."provider_rituals" to "service_role";

grant references on table "public"."provider_rituals" to "service_role";

grant select on table "public"."provider_rituals" to "service_role";

grant trigger on table "public"."provider_rituals" to "service_role";

grant truncate on table "public"."provider_rituals" to "service_role";

grant update on table "public"."provider_rituals" to "service_role";

grant delete on table "public"."providers" to "anon";

grant insert on table "public"."providers" to "anon";

grant references on table "public"."providers" to "anon";

grant select on table "public"."providers" to "anon";

grant trigger on table "public"."providers" to "anon";

grant truncate on table "public"."providers" to "anon";

grant update on table "public"."providers" to "anon";

grant delete on table "public"."providers" to "authenticated";

grant insert on table "public"."providers" to "authenticated";

grant references on table "public"."providers" to "authenticated";

grant select on table "public"."providers" to "authenticated";

grant trigger on table "public"."providers" to "authenticated";

grant truncate on table "public"."providers" to "authenticated";

grant update on table "public"."providers" to "authenticated";

grant delete on table "public"."providers" to "service_role";

grant insert on table "public"."providers" to "service_role";

grant references on table "public"."providers" to "service_role";

grant select on table "public"."providers" to "service_role";

grant trigger on table "public"."providers" to "service_role";

grant truncate on table "public"."providers" to "service_role";

grant update on table "public"."providers" to "service_role";

grant delete on table "public"."sampradayas" to "anon";

grant insert on table "public"."sampradayas" to "anon";

grant references on table "public"."sampradayas" to "anon";

grant select on table "public"."sampradayas" to "anon";

grant trigger on table "public"."sampradayas" to "anon";

grant truncate on table "public"."sampradayas" to "anon";

grant update on table "public"."sampradayas" to "anon";

grant delete on table "public"."sampradayas" to "authenticated";

grant insert on table "public"."sampradayas" to "authenticated";

grant references on table "public"."sampradayas" to "authenticated";

grant select on table "public"."sampradayas" to "authenticated";

grant trigger on table "public"."sampradayas" to "authenticated";

grant truncate on table "public"."sampradayas" to "authenticated";

grant update on table "public"."sampradayas" to "authenticated";

grant delete on table "public"."sampradayas" to "service_role";

grant insert on table "public"."sampradayas" to "service_role";

grant references on table "public"."sampradayas" to "service_role";

grant select on table "public"."sampradayas" to "service_role";

grant trigger on table "public"."sampradayas" to "service_role";

grant truncate on table "public"."sampradayas" to "service_role";

grant update on table "public"."sampradayas" to "service_role";

grant delete on table "public"."spatial_ref_sys" to "anon";

grant insert on table "public"."spatial_ref_sys" to "anon";

grant references on table "public"."spatial_ref_sys" to "anon";

grant select on table "public"."spatial_ref_sys" to "anon";

grant trigger on table "public"."spatial_ref_sys" to "anon";

grant truncate on table "public"."spatial_ref_sys" to "anon";

grant update on table "public"."spatial_ref_sys" to "anon";

grant delete on table "public"."spatial_ref_sys" to "authenticated";

grant insert on table "public"."spatial_ref_sys" to "authenticated";

grant references on table "public"."spatial_ref_sys" to "authenticated";

grant select on table "public"."spatial_ref_sys" to "authenticated";

grant trigger on table "public"."spatial_ref_sys" to "authenticated";

grant truncate on table "public"."spatial_ref_sys" to "authenticated";

grant update on table "public"."spatial_ref_sys" to "authenticated";

grant delete on table "public"."spatial_ref_sys" to "postgres";

grant insert on table "public"."spatial_ref_sys" to "postgres";

grant references on table "public"."spatial_ref_sys" to "postgres";

grant select on table "public"."spatial_ref_sys" to "postgres";

grant trigger on table "public"."spatial_ref_sys" to "postgres";

grant truncate on table "public"."spatial_ref_sys" to "postgres";

grant update on table "public"."spatial_ref_sys" to "postgres";

grant delete on table "public"."spatial_ref_sys" to "service_role";

grant insert on table "public"."spatial_ref_sys" to "service_role";

grant references on table "public"."spatial_ref_sys" to "service_role";

grant select on table "public"."spatial_ref_sys" to "service_role";

grant trigger on table "public"."spatial_ref_sys" to "service_role";

grant truncate on table "public"."spatial_ref_sys" to "service_role";

grant update on table "public"."spatial_ref_sys" to "service_role";


  create policy "admin_actions_admin_all"
  on "public"."admin_actions"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text)))));



  create policy "admins_self_read"
  on "public"."admins"
  as permissive
  for select
  to public
using ((user_email = (auth.jwt() ->> 'email'::text)));



  create policy "categories_admin_all"
  on "public"."categories"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text)))));



  create policy "categories_public_read"
  on "public"."categories"
  as permissive
  for select
  to public
using (true);



  create policy "provider_photos_admin_all"
  on "public"."provider_photos"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text)))));



  create policy "provider_photos_insert_authenticated"
  on "public"."provider_photos"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "provider_photos_public_read"
  on "public"."provider_photos"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.providers p
  WHERE ((p.id = provider_photos.provider_id) AND (p.status = 'approved'::text)))));



  create policy "provider_photos_self_delete"
  on "public"."provider_photos"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.providers p
  WHERE ((p.id = provider_photos.provider_id) AND (p.user_id = auth.uid())))));



  create policy "provider_photos_self_insert"
  on "public"."provider_photos"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.providers p
  WHERE ((p.id = provider_photos.provider_id) AND (p.user_id = auth.uid())))));



  create policy "provider_photos_self_update"
  on "public"."provider_photos"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.providers p
  WHERE ((p.id = provider_photos.provider_id) AND (p.user_id = auth.uid())))));



  create policy "provider_rituals_admin_all"
  on "public"."provider_rituals"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text)))));



  create policy "provider_rituals_public_read"
  on "public"."provider_rituals"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.providers p
  WHERE ((p.id = provider_rituals.provider_id) AND (p.status = 'approved'::text)))));



  create policy "provider_rituals_self_delete"
  on "public"."provider_rituals"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.providers p
  WHERE ((p.id = provider_rituals.provider_id) AND (p.user_id = auth.uid())))));



  create policy "provider_rituals_self_insert"
  on "public"."provider_rituals"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.providers p
  WHERE ((p.id = provider_rituals.provider_id) AND (p.user_id = auth.uid())))));



  create policy "provider_rituals_self_update"
  on "public"."provider_rituals"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.providers p
  WHERE ((p.id = provider_rituals.provider_id) AND (p.user_id = auth.uid())))));



  create policy "providers_admin_all"
  on "public"."providers"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text)))));



  create policy "providers_public_read"
  on "public"."providers"
  as permissive
  for select
  to public
using ((status = 'approved'::text));



  create policy "providers_self_insert"
  on "public"."providers"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "providers_self_read"
  on "public"."providers"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "providers_self_update"
  on "public"."providers"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "sampradayas_admin_all"
  on "public"."sampradayas"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text)))))
with check ((EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text)))));



  create policy "sampradayas_public_read"
  on "public"."sampradayas"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER validate_admin_action_trigger BEFORE INSERT ON public.admin_actions FOR EACH ROW EXECUTE FUNCTION public.validate_admin_action();

CREATE TRIGGER log_provider_status_change_trigger BEFORE UPDATE ON public.providers FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION public.log_provider_status_change();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


  create policy "admin delete provider-photos v2"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'provider-photos'::text) AND (EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text))))));



  create policy "admin update provider-photos v2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'provider-photos'::text) AND (EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text))))))
with check (((bucket_id = 'provider-photos'::text) AND (EXISTS ( SELECT 1
   FROM public.admins a
  WHERE (a.user_email = (auth.jwt() ->> 'email'::text))))));



  create policy "auth upload to provider-photos v2"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'provider-photos'::text));



  create policy "signed-url read provider-photos v2"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'provider-photos'::text));



