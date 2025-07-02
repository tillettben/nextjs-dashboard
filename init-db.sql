-- Initialize the database with required extensions if needed
-- This file is run when the PostgreSQL container starts for the first time

-- Enable UUID extension (if you plan to use UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create separate test database for isolated testing
CREATE DATABASE nextjs_dashboard_test OWNER dev_user;

-- Connect to test database and enable extensions there too
\c nextjs_dashboard_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";