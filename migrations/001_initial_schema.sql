-- Initial Schema Migration for Echo Safety Database
-- Enables PostGIS, creates all application tables, indexes, and enables Row Level Security (RLS)

-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    avatar_url TEXT,
    has_completed_emergency_setup BOOLEAN DEFAULT FALSE,
    is_silent_sos_enabled BOOLEAN DEFAULT FALSE,
    fcm_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on user_id for emergency contact lookups
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);

-- Enable RLS on emergency_contacts table
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- 3. SOS Alerts Table
CREATE TABLE IF NOT EXISTS sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL, -- 'active', 'resolved', 'cancelled'
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,
    is_silent BOOLEAN DEFAULT FALSE,
    sent_via_sms_fallback BOOLEAN DEFAULT FALSE,
    audio_record_url TEXT,
    contacts_notified_count INT DEFAULT 0,
    nearby_responders_notified_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Spatial GIST Index for Fast Radius Search
CREATE INDEX IF NOT EXISTS idx_sos_alerts_location ON sos_alerts USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_user_id ON sos_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts(status);

-- Enable RLS on sos_alerts table
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;

-- 4. Live Tracking Sessions Table
CREATE TABLE IF NOT EXISTS tracking_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    share_code VARCHAR(16) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tracking_sessions_user_id ON tracking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_share_code ON tracking_sessions(share_code);

-- Enable RLS on tracking_sessions table
ALTER TABLE tracking_sessions ENABLE ROW LEVEL SECURITY;
