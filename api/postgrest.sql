CREATE SCHEMA postgrest_views;

ALTER SCHEMA postgrest_views OWNER TO postgres;

CREATE VIEW postgrest_views.unfaelle_raw AS SELECT
    id as id,
    vu_ort as vu_ort,
    vu_hoehe as vu_hoehe,
    tag as tag,
    datum as datum,
    uhrzeit as uhrzeit,
    kat as kat,
    flucht as flucht,
    row_t as row_t,
    sv as sv,
    lv as lv,
    anzahl_beteiligte as anzahl_beteiligte,
    fg as fg,
    rf as rf,
    mofa as mofa,
    kkr as kkr,
    krad as kkrad,
    pkw as pkw,
    lkw as lkw,
    kom as kom,
    sonstige as sonstige,
    "1" as "1",
    "2" as "2",
    alkohol as alkohol,
    typ as typ,
    "1_urs" as "1_urs",
    "2_urs" as "2_urs",
    "3_urs" as "3_urs",
    sonst_urs as sonst_urs,
    lichtverhaeltnisse as lichtverhaeltnisse,
    strassenzustand as strassenzustand,
    "01_alter_in_jahren" as "01_alter_in_jahren",
    kinder as kinder,
    "18_24" as "18_24",
    senioren as senioren
FROM public.unfalldaten_raw;

CREATE VIEW postgrest_views.unfaelle AS
    SELECT
      ST_X(g.the_geom) as lon,
      ST_Y(g.the_geom) as lat,
      concat_ws(' ', trim(u.vu_ort), nullif(trim(u.vu_hoehe), '')) as description,
      g.source as source,
      u.id as unfall_id
    FROM
        public.unfalldaten_geometries g JOIN public.unfalldaten_raw u ON g.unfall_id = u.id;


CREATE FUNCTION create_location()
RETURNS trigger
LANGUAGE plpgsql
AS $$
--DECLARE
--  vcompany_id int;
BEGIN
  INSERT INTO public.unfalldaten_geometries (unfall_id, created_at, the_geom, source) VALUES (new.unfall_id, NOW(), ST_GeomFromText('POINT(' || concat_ws(' ', new.lon::text, new.lat::text) || ')', 4326), 'human');
RETURN new;
END;
$$;

CREATE TRIGGER create_location
INSTEAD OF INSERT ON postgrest_views.unfaelle
FOR EACH ROW
EXECUTE PROCEDURE create_location();
