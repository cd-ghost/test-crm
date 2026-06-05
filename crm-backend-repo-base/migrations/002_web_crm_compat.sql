-- Persist the fields already submitted by the static CRM page.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS value NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS close_date DATE,
  ADD COLUMN IF NOT EXISTS owner TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- The webpage creates free-standing deals, while the original API required a
-- lead_id. Keep lead-linked deals supported, but allow direct deal creation too.
ALTER TABLE deals
  ALTER COLUMN lead_id DROP NOT NULL;

INSERT INTO tenants (id, company_name)
VALUES ('77777777-7777-7777-7777-777777777777', 'RTAV CRM')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, tenant_id, email, password_hash, role)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '77777777-7777-7777-7777-777777777777',
  'demo@rtav.local',
  'api-key-auth-user',
  'ADMIN'
)
ON CONFLICT (id) DO NOTHING;
