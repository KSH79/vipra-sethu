
create or replace function search_providers(
  p_text text default null,
  p_category text default null,
  p_languages text[] default null,
  p_sampradaya text default null,
  p_lat double precision default null,
  p_lon double precision default null,
  p_radius_km double precision default 15,
  p_limit int default 50,
  p_offset int default 0
) returns table (
  providers providers,
  total_count bigint,
  distance_km double precision
) language sql stable as $$
  select 
    p.*::providers,
    count(*) over() as total_count,
    case 
      when p_lat is not null and p_lon is not null and p.location is not null 
      then ST_Distance(p.location::geography, ST_MakePoint(p_lon,p_lat)::geography) / 1000
      else null
    end as distance_km
  from providers p
  where p.status='approved'
    and (p_category is null or p.category=p_category)
    and (p_sampradaya is null or p.sampradaya=p_sampradaya)
    and (p_languages is null or p.languages && p_languages)
    and (p_text is null or p.name ilike '%'||p_text||'%')
    and (p_lat is null or p_lon is null or (p.location is not null and ST_DWithin(p.location, ST_MakePoint(p_lon,p_lat)::geography, p_radius_km*1000)))
  order by 
    case when p_text is not null and p.name ilike '%'||p_text||'%' then 1 else 2 end,
    case when p_lat is not null and p_lon is not null and p.location is not null then ST_Distance(p.location::geography, ST_MakePoint(p_lon,p_lat)::geography) else 0 end,
    p.created_at desc
  limit p_limit offset p_offset;
$$;
