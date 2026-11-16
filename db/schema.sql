CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL UNIQUE,
  is_academic BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'BOOKER' CHECK (role IN ('VIEWER', 'BOOKER', 'CUSTODIAN', 'ADMIN')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  penalty_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('SPORTS', 'AUDITORIUM', 'LECTURE_THEATRE', 'LAB')),
  capacity INT NOT NULL CHECK (capacity > 0),
  location VARCHAR(255) NOT NULL,
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  setup_buffer_mins INT NOT NULL DEFAULT 0 CHECK (setup_buffer_mins >= 0),
  strike_buffer_mins INT NOT NULL DEFAULT 0 CHECK (strike_buffer_mins >= 0),
  is_under_maintenance BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  effective_start TIMESTAMPTZ NOT NULL,
  effective_end TIMESTAMPTZ NOT NULL,
  title VARCHAR(200) NOT NULL,
  purpose TEXT,
  priority_tier SMALLINT NOT NULL DEFAULT 2 CHECK (priority_tier IN (1, 2)),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED', 'CHECKED_IN', 'NO_SHOW')
  ),
  attendee_count INT NOT NULL CHECK (attendee_count > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_booking_range CHECK (end_time > start_time),
  CONSTRAINT valid_effective_range CHECK (effective_end > effective_start),
  CONSTRAINT no_overlapping_active_bookings EXCLUDE USING gist (
    facility_id WITH =,
    tstzrange(effective_start, effective_end, '[)') WITH &&
  ) WHERE (status IN ('PENDING', 'APPROVED', 'CHECKED_IN'))
);

CREATE TABLE IF NOT EXISTS resource_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  equipment_type VARCHAR(40) NOT NULL CHECK (
    equipment_type IN ('PROJECTOR', 'PA_SYSTEM', 'STAGE_LIGHTING', 'GOALPOSTS')
  ),
  quantity INT NOT NULL CHECK (quantity > 0)
);
