# Project Structure Overview

## Root Directory
├── load-test.js - Artillery load testing script for API performance testing
├── Project-structure.md - This architecture documentation file

## Backend Structure
backend/
├── api/
│   ├── dependencies/
│   │   ├── access_control.py - Role-based access control middleware
│   │   ├── pagination.py - Pagination logic for API endpoints
│   │   └── blog_post_sql.py - SQL operations for blog post CRUD
│   └── (other API route files)
│
├── database/
│   ├── models.py - SQLAlchemy model definitions
│   └── core.py - Database connection and session management

## Frontend Structure
frontend/src/
├── providers/
│   └── dataProvider.ts - Data provider for React-Admin API communication
│
└── pages/
    └── blog-post-sql/
        └── list.tsx - React component for blog post listing UI
