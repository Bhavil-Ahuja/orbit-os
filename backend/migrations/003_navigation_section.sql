-- Data-driven navigation sections (reorder, hide, CMS-controlled)
CREATE TABLE IF NOT EXISTS navigation_section (
  id          SERIAL PRIMARY KEY,
  label       VARCHAR(80) NOT NULL,
  path        VARCHAR(255) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  visible     BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_navigation_section_visible_order ON navigation_section(visible, sort_order);

-- Seed default sections (admin can reorder/hide later)
INSERT INTO navigation_section (label, path, sort_order, visible)
SELECT v.label, v.path, v.sort_order, v.visible
FROM (VALUES
  ('About', '/about', 0::int, true),
  ('Experience', '/experience', 1, true),
  ('Projects', '/projects', 2, true),
  ('Publications', '/publications', 3, true)
) AS v(label, path, sort_order, visible)
WHERE NOT EXISTS (SELECT 1 FROM navigation_section LIMIT 1);
