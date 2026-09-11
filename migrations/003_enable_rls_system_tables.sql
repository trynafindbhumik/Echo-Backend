-- Migration: Enable Row Level Security (RLS) on system & metadata tables
-- Secures schema_migrations tracking table and PostGIS spatial_ref_sys catalog table

ALTER TABLE IF EXISTS schema_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS spatial_ref_sys ENABLE ROW LEVEL SECURITY;
