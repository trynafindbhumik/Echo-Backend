# 🚨 Echo Safety Backend API & Real-Time Engine

High-reliability Emergency SOS, Live Spatial Location Tracking, and Geofenced Bystander Response API built with **Node.js (ES Modules)**, **Express**, **Socket.io**, **PostgreSQL + PostGIS**, **Redis Geo**, **Firebase Admin SDK**, and **Cloudinary**.

---

## 📌 Architecture Overview

```
                                  +-----------------------+
                                  | Flutter Mobile Client |
                                  +-----------+-----------+
                                              |
                      +------------------------+------------------------+
                      | (Primary - Online)                              | (Fallback - Offline)
                      v                                                 v
       +------------------------------+                     +------------------------+
       | HTTPS REST & WebSocket APIs  |                     |  Native SMS Gateway    |
       +--------------+---------------+                     |  (Direct Device SMS)   |
                      |                                     +------------------------+
         +------------+------------+
         |                         |
         v                         v
 +---------------+       +------------------+
 | API Gateway / |       |  Real-Time WS    |
 | Auth Guard    |       |  Socket Cluster  |
 +-------+-------+       +--------+---------+
         |                        |
         v                        v
 +------------------------------------------+
 |            Backend Services              |
 | - Auth & User Management                 |
 | - SOS Alert Orchestrator                 |
 | - Spatial Geofencing Service             |
 | - Live Track Session Manager             |
 +-------+------------------------+---------+
         |                        |
         v                        v
 +------------------+    +------------------+    +------------------------+
 | PostgreSQL +     |    | Redis Geo        |    | External Services      |
 | PostGIS Spatial  |    | (Active Track &  |    | - FCM / APNs Push      |
 | Database         |    | Pub/Sub Broker)  |    | - Firebase SMS Auth    |
 +------------------+    +------------------+    | - Cloudinary Media     |
                                                 +------------------------+
```

---

## 🛠️ Technology Stack

- **Runtime & Language**: Node.js (ES Modules `"type": "module"`)
- **Package Manager**: `pnpm`
- **HTTP Server**: Express.js
- **Real-Time Protocol**: Socket.io (WebSockets)
- **Primary Database**: PostgreSQL 16 + PostGIS extension (Spatial Queries)
- **Cache & Location Pub/Sub**: Redis Geo (`ioredis`)
- **Push Notifications & SMS**: Firebase Admin SDK (`firebase-admin` - FCM Push & Phone Auth)
- **Media & Audio Storage**: Cloudinary (`cloudinary` - Audio snippets & Avatar images)
- **File Upload Middleware**: `multer`
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Security & Logging**: `helmet`, `cors`, `winston`, `morgan`

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your environment:
- **Node.js**: v18.0.0 or higher
- **pnpm**: `npm install -g pnpm`
- **PostgreSQL**: With `postgis` extension enabled
- **Redis**: v6.0 or higher

---

### Installation & Environment Setup

1. **Clone the repository & enter the backend folder**:
   ```bash
   cd Echo-backend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` variables with your local or cloud database and service keys:
   ```env
   PORT=5000
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/echo_safety
   REDIS_URL=redis://127.0.0.1:6379
   JWT_SECRET=your_jwt_secret_key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY="your_firebase_private_key"
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

### Database Initialization (PostgreSQL + PostGIS)

Run the following SQL commands in your PostgreSQL database instance to enable PostGIS and create the required tables:

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20),
    avatar_url TEXT,
    has_completed_emergency_setup BOOLEAN DEFAULT FALSE,
    is_silent_sos_enabled BOOLEAN DEFAULT FALSE,
    fcm_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Emergency Contacts Table
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SOS Alerts Table
CREATE TABLE sos_alerts (
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
CREATE INDEX idx_sos_alerts_location ON sos_alerts USING GIST (location);

-- 4. Live Tracking Sessions Table
CREATE TABLE tracking_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    share_code VARCHAR(16) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🏃 Running the Server

### Development Mode (Hot-Reloading with Nodemon)
```bash
pnpm dev
```

### Production Mode
```bash
pnpm start
```

### Interactive Swagger API Documentation

Once the server is running, open your browser to access the interactive Swagger UI API documentation and test endpoints directly:
👉 **[http://localhost:5000/docs](http://localhost:5000/docs)**

---

## 🌐 REST API Specifications (`/api/v1`)

### 🔑 Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/verify-otp` | Verify Firebase ID Token / OTP and issue JWT access tokens | ❌ |

### 👤 User Profile (`/api/v1/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/users/me` | Fetch authenticated user profile | 🔒 |
| `PATCH` | `/api/v1/users/me` | Update profile details and emergency settings | 🔒 |

### 👥 Emergency Contacts (`/api/v1/contacts`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/contacts` | Retrieve user's trusted emergency contacts | 🔒 |
| `POST` | `/api/v1/contacts` | Add new trusted contact | 🔒 |
| `DELETE` | `/api/v1/contacts/:contactId` | Delete contact | 🔒 |

### 🚨 Emergency SOS Lifecycle (`/api/v1/sos`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/sos/trigger` | Trigger active SOS alert, push FCM alarms | 🔒 |
| `POST` | `/api/v1/sos/:alertId/audio` | Upload recorded emergency audio snippet to Cloudinary | 🔒 |
| `POST` | `/api/v1/sos/:alertId/resolve` | Mark victim safe & close incident | 🔒 |
| `POST` | `/api/v1/sos/:alertId/cancel-false-alarm` | Cancel accidental alert trigger & notify stand-down | 🔒 |

### 📍 Bystander Feed & Nearby Alerts (`/api/v1/alerts`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/alerts/nearby?latitude=...&longitude=...` | PostGIS spatial query for active alerts within radius | 🔒 |
| `POST` | `/api/v1/alerts/:alertId/respond` | Mark bystander "En Route" to assist | 🔒 |
| `POST` | `/api/v1/alerts/:alertId/report-fake` | Report malicious fake alert for moderation | 🔒 |

### 🗺️ Live Web Location Tracking (`/api/v1/track`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/track/start` | Generate temporary web tracking link | 🔒 |
| `GET` | `/api/v1/track/:sessionId` | Public web tracking session status | ❌ |

---

## ⚡ Real-Time Protocol Specification (WebSockets)

- **WebSocket Endpoint**: `ws://localhost:5000`
- **Authentication**: `auth: { token: "<JWT_TOKEN>" }` or query param `?token=<JWT_TOKEN>`

### Client Event Emitters
- `sos:location_update`: Stream live GPS position during active SOS session.
- `bystander:location_update`: Update bystander location in Redis spatial index.

### Server Event Broadcasters
- `track:position_changed`: Real-time position broadcast to emergency contacts & web map.
- `sos:new_nearby_incident`: Geofenced emergency alert to nearby community responders.

---

## 📁 Directory Structure

```
Echo-backend/
├── src/
│   ├── config/          # Database (PG, Redis), Firebase Admin, Cloudinary
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # JWT Guard, Multer, Error & Validation handlers
│   ├── models/          # PostGIS & PostgreSQL data access layer
│   ├── routes/          # Express route definitions
│   ├── services/        # FCM Push, SMS, Cloudinary Upload, Redis Geo logic
│   ├── sockets/         # Socket.io listeners & room event handling
│   ├── utils/           # Winston logger & API response helpers
│   └── app.js           # Express app setup
├── server.js            # Entry point for HTTP & Socket.io server
├── .env.example         # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## 📄 License

This project is licensed under the ISC License.
