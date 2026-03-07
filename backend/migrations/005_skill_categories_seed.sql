-- Seed skill categories for dropdown and orbit rings (inner → outer order)
INSERT INTO skill_category (name, orbit_index, sort_order)
SELECT v.name, v.orbit_index, v.sort_order
FROM (VALUES
  ('Languages and Web Technologies', 0, 0),
  ('Frameworks, Libraries & Cloud', 1, 1),
  ('Databases & Tools', 2, 2),
  ('Machine Learning & AI', 3, 3),
  ('Architecture', 4, 4)
) AS v(name, orbit_index, sort_order)
ON CONFLICT (name) DO UPDATE SET
  orbit_index = EXCLUDED.orbit_index,
  sort_order = EXCLUDED.sort_order;
