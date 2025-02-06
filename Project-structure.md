# Project Structure Overview

## Root Directory
├── load-test.js - Artillery performance testing configuration
├── Project-structure.md - Architecture documentation
├── Spec-Pagination-Parameters.md - API pagination/filtering specification

## Backend Structure
backend/
├── api/
│   ├── dependencies/
│   │   ├── access_control.py - Role-based access control
│   │   ├── pagination.py - Pagination & filter parameter handling
│   │   └── blog_post_sql.py - Blog post CRUD operations
│   └── main.py - FastAPI app configuration and routes
│
├── database/
│   ├── models.py - SQLAlchemy data models
│   └── core.py - Database connection management

## Frontend Structure
frontend/src/
├── providers/
│   └── dataProvider.ts - React-Admin data provider implementation
│
└── pages/
    └── blog-post-sql/
        └── list.tsx - Blog post listing UI with filtering/pagination

## Documentation
docs/
└── Spec-*.md - Technical specifications for API consumers

## Key Implementation Details
1. **Pagination** - Uses `_start`/`_end` parameters with `X-Total-Count` header
2. **Filtering** - Supports 12 operators via `filter[field]` query params
3. **CORS** - Configured in main.py with exposed headers
4. **Error Handling** - Standardized error responses for client parsing
5. **Testing** - Artillery load tests and React component tests

## Critical Dependencies
- `pagination.py`: Central parameter validation
- `dataProvider.ts`: Frontend API communication layer
- `Spec-Pagination-Parameters.md`: Frontend/backend contract
