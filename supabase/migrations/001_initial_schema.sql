-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- Create custom types
create type file_status as enum ('pending', 'processing', 'completed', 'failed');
create type analysis_status as enum ('pending', 'processing', 'completed', 'failed');
create type integration_status as enum ('connected', 'disconnected', 'error');

-- Enable Row Level Security
alter database postgres set row_security = on;

