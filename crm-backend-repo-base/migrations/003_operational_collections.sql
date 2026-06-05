-- Rebuild the seven frontend-backed operational CRM collections for pgAdmin.

DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  notes TEXT,
  tenant_id TEXT,
  owner_id TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  title TEXT,
  status TEXT,
  tenant_id TEXT,
  owner_id TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT,
  industry TEXT,
  city TEXT,
  revenue TEXT,
  employees INT,
  website TEXT,
  tenant_id TEXT,
  owner_id TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE deals (
  id TEXT PRIMARY KEY,
  name TEXT,
  company TEXT,
  value NUMERIC,
  stage TEXT,
  owner TEXT,
  close_date TEXT,
  tenant_id TEXT,
  owner_id TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE quotes (
  id TEXT PRIMARY KEY,
  number TEXT,
  customer TEXT,
  amount NUMERIC,
  status TEXT,
  tenant_id TEXT,
  owner_id TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT,
  related TEXT,
  due_date TEXT,
  priority TEXT,
  status TEXT,
  tenant_id TEXT,
  owner_id TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT,
  meta TEXT,
  tenant_id TEXT,
  owner_id TEXT,
  created_at TIMESTAMPTZ
);

GRANT SELECT, INSERT, UPDATE, DELETE ON
  leads,
  contacts,
  companies,
  deals,
  quotes,
  tasks,
  activities
TO crm_app;
