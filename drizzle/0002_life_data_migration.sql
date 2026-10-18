-- Umbau zur Ein-Personen-App (Alain).
--
-- 1. Bereiche seeden.
-- 2. Den bisherigen JSON-Block unverändert archivieren.
-- 3. Todos aus dem Block in die Tabelle "todos" übernehmen.
-- 4. Den Block auf Alains Daten reduzieren: Items mit scope "A"
--    (Ambar privat), Zyklusdaten und Todos fliegen raus.
--
-- Gelöscht wird hier nichts endgültig: Die Kopie in
-- legacy_workspace_state bleibt, bis Alain sie freigibt.

INSERT INTO "areas" ("key", "name", "world", "sort") VALUES
  ('spinnerei-booking', 'Booking', 'spinnerei', 10),
  ('spinnerei-ticketing', 'Ticketing', 'spinnerei', 20),
  ('spinnerei-kommunikation', 'Kommunikation', 'spinnerei', 30),
  ('spinnerei-finanzen', 'Finanzen Spinnerei', 'spinnerei', 40),
  ('spinnerei-technik', 'Technik', 'spinnerei', 50),
  ('spinnerei-verein', 'Verein', 'spinnerei', 60),
  ('privat-admin', 'Admin', 'privat', 110),
  ('privat-finanzen', 'Finanzen', 'privat', 120),
  ('privat-gesundheit', 'Gesundheit', 'privat', 130),
  ('privat-reisen', 'Reisen', 'privat', 140),
  ('privat-haushalt', 'Haushalt', 'privat', 150),
  ('privat-lernen', 'Lernen', 'privat', 160),
  ('privat-projekte', 'Projekte', 'privat', 170)
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "legacy_workspace_state" ("workspace_id", "data", "version")
SELECT "workspace_id", "data", "version" FROM "workspace_state"
ON CONFLICT ("workspace_id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "todos" (
  "text", "note", "area_key", "due", "prio", "status", "done_at",
  "tags", "source", "created_by", "created_at"
)
SELECT
  e->>'text',
  COALESCE(e->>'note', ''),
  CASE
    WHEN tags @> ARRAY['gesundheit'] THEN 'privat-gesundheit'
    WHEN tags @> ARRAY['finanzen'] THEN 'privat-finanzen'
    WHEN tags @> ARRAY['reise'] THEN 'privat-reisen'
    WHEN tags @> ARRAY['lernen'] THEN 'privat-lernen'
    WHEN tags @> ARRAY['haushalt'] THEN 'privat-haushalt'
  END,
  CASE WHEN e->>'due' ~ '^\d{4}-\d{2}-\d{2}$' THEN (e->>'due')::date END,
  CASE WHEN e->>'prio' IN ('hoch', 'normal', 'tief') THEN e->>'prio' ELSE 'normal' END,
  CASE WHEN e->'done' = 'true'::jsonb THEN 'erledigt' ELSE 'offen' END,
  -- Wann etwas erledigt wurde, kennt die alte App nicht: Erstellzeit nehmen,
  -- damit alte Todos nicht als "heute erledigt" erscheinen.
  CASE WHEN e->'done' = 'true'::jsonb THEN added_at END,
  tags,
  'migration',
  'alain',
  added_at
FROM (
  SELECT
    e,
    CASE
      WHEN e->>'addedAt' ~ '^\d+(\.\d+)?$' THEN to_timestamp((e->>'addedAt')::double precision / 1000)
      ELSE now() - interval '1 day'
    END AS added_at,
    CASE
      WHEN jsonb_typeof(e->'tags') = 'array'
        THEN ARRAY(SELECT jsonb_array_elements_text(e->'tags'))
      ELSE '{}'::text[]
    END AS tags
  FROM "workspace_state" ws,
    jsonb_array_elements(
      CASE WHEN jsonb_typeof(ws."data"->'todos') = 'array' THEN ws."data"->'todos' ELSE '[]'::jsonb END
    ) e
  WHERE jsonb_typeof(e) = 'object'
    AND COALESCE(e->>'scope', 'geteilt') <> 'A'
    AND COALESCE(btrim(e->>'text'), '') <> ''
) src;
--> statement-breakpoint
UPDATE "workspace_state" ws SET
  "data" = jsonb_build_object(
    'shopping', (
      SELECT COALESCE(jsonb_agg(e ORDER BY i), '[]'::jsonb)
      FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(ws."data"->'shopping') = 'array' THEN ws."data"->'shopping' ELSE '[]'::jsonb END
      ) WITH ORDINALITY AS t(e, i)
      WHERE COALESCE(e->>'scope', 'geteilt') <> 'A'
    ),
    'goals', (
      SELECT COALESCE(jsonb_agg(e ORDER BY i), '[]'::jsonb)
      FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(ws."data"->'goals') = 'array' THEN ws."data"->'goals' ELSE '[]'::jsonb END
      ) WITH ORDINALITY AS t(e, i)
      WHERE COALESCE(e->>'scope', 'geteilt') <> 'A'
    ),
    'packlistTemplates', (
      SELECT COALESCE(jsonb_agg(
        e || jsonb_build_object('items', (
          SELECT COALESCE(jsonb_agg(it ORDER BY j), '[]'::jsonb)
          FROM jsonb_array_elements(
            CASE WHEN jsonb_typeof(e->'items') = 'array' THEN e->'items' ELSE '[]'::jsonb END
          ) WITH ORDINALITY AS u(it, j)
          WHERE COALESCE(it->>'scope', 'geteilt') <> 'A'
        ))
        ORDER BY i
      ), '[]'::jsonb)
      FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(ws."data"->'packlistTemplates') = 'array' THEN ws."data"->'packlistTemplates' ELSE '[]'::jsonb END
      ) WITH ORDINALITY AS t(e, i)
      WHERE jsonb_typeof(e) = 'object'
        AND COALESCE(e->>'scope', 'geteilt') <> 'A'
    ),
    'activities', (
      SELECT COALESCE(jsonb_agg(
        e || jsonb_build_object(
          'packlist', (
            SELECT COALESCE(jsonb_agg(p ORDER BY j), '[]'::jsonb)
            FROM jsonb_array_elements(
              CASE WHEN jsonb_typeof(e->'packlist') = 'array' THEN e->'packlist' ELSE '[]'::jsonb END
            ) WITH ORDINALITY AS u(p, j)
            WHERE COALESCE(p->>'scope', 'geteilt') <> 'A'
          ),
          'preTripShopping', (
            SELECT COALESCE(jsonb_agg(p ORDER BY j), '[]'::jsonb)
            FROM jsonb_array_elements(
              CASE WHEN jsonb_typeof(e->'preTripShopping') = 'array' THEN e->'preTripShopping' ELSE '[]'::jsonb END
            ) WITH ORDINALITY AS u(p, j)
            WHERE COALESCE(p->>'scope', 'geteilt') <> 'A'
          )
        )
        ORDER BY i
      ), '[]'::jsonb)
      FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(ws."data"->'activities') = 'array' THEN ws."data"->'activities' ELSE '[]'::jsonb END
      ) WITH ORDINALITY AS t(e, i)
      WHERE jsonb_typeof(e) = 'object'
        AND COALESCE(e->>'scope', 'geteilt') <> 'A'
    )
  ),
  "version" = ws."version" + 1,
  "updated_at" = now();
