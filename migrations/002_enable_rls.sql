-- Migration: Enable Row Level Security (RLS) on public tables
-- Secures database tables from unauthorized direct access via Supabase Data API

ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tracking_sessions ENABLE ROW LEVEL SECURITY;
