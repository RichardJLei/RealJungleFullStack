# Backend API Specification

This document outlines the API requirements for compatibility with Refine's `simple-rest` data provider using FastAPI and MongoDB.

## Base Requirements
- **Pagination**: Offset-based pagination
- **Filtering**: Standardized query parameters
- **Sorting**: Multi-field sorting support
- **Response Format**: Consistent JSON structure
- **Error Handling**: Standard HTTP status codes

## Endpoint Structure

### Resource Endpoints
| Method | Endpoint              | Description                     |
|--------|-----------------------|---------------------------------|
| GET    | `/resources`          | Get paginated/filtered resources|
| GET    | `/resources/{id}`     | Get single resource             |
| POST   | `/resources`          | Create new resource             |
| PUT    | `/resources/{id}`     | Full resource update            |
| PATCH  | `/resources/{id}`     | Partial resource update         |
| DELETE | `/resources/{id}`     | Delete resource                 |

## Request Parameters

### Pagination
http
GET /blog-posts?start=0&_end=10
| Parameter | Type   | Description                      |
|-----------|--------|----------------------------------|
| `_start`  | integer| Offset index (0-based)          |
| `_end`    | integer| End index (exclusive)            |

### Sorting
http
GET /blog-posts?sort=createdAt,title&_order=desc,asc

| Parameter | Type   | Description                      |
|-----------|--------|----------------------------------|
| `_sort`   | string | Comma-separated sort fields      |
| `_order`  | string | Comma-separated sort directions  |

### Filtering
http
GET /blog-posts?title_like=refine&status=published&views_gte=100

Supported filter operators:

| Operator | Example              | MongoDB Equivalent           |
|----------|----------------------|------------------------------|
| (none)   | `status=published`   | `{ status: "published" }`    |
| `_ne`    | `status_ne=draft`    | `{ status: { $ne: "draft" }}`|
| `_lt`    | `views_lt=100`       | `{ views: { $lt: 100 }}`     |
| `_gt`    | `views_gt=50`        | `{ views: { $gt: 50 }}`      |
| `_lte`   | `views_lte=100`      | `{ views: { $lte: 100 }}`    |
| `_gte`   | `views_gte=50`       | `{ views: { $gte: 50 }}`     |
| `_in`    | `status_in=pub,draft`| `{ status: { $in: [...] }}`   |
| `_nin`   | `status_nin=archived`| `{ status: { $nin: [...] }}`  |
| `_like`  | `title_like=ref`     | `{ title: { $regex: /ref/i }}`|
| `_nlike` | `title_nlike=test`   | `{ title: { $not: /test/i }}` |




## Response Formats

### Successful Response (GET /resources)

Get List:
{
  "data": [
    {
      "id": 1,
      "title": "First Post",
      "status": "published",
      "createdAt": "2023-01-01"
    }
  ],
  "total": 100,
  "pageInfo": {
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}

Get One:
{
  "data": {
    "id": 1,
    "title": "First Post",
    "status": "published",
    "createdAt": "2023-01-01"
  }
}

Error Response:
{
  "error": {
    "message": "Resource not found",
    "statusCode": 404,
    "errors": {
      "title": "Title is required"
    }
  }
}

### Relationship Handling
For nested resources (e.g., blog posts with categories):
GET /blog-posts?_expand=category
Response:

{
  "data": [
    {
      "id": 1,
      "title": "Post 1",
      "category": {
        "id": 1,
        "name": "Technology"
      }
    }
  ],
  "total": 10
}

###  Recommended Endpoints
Implement these endpoints for full compatibility:
| Endpoint | Method | Description |
|-------------------------|--------|-------------------------------------------------|
| /resources | GET | Get paginated/filtered resources |
| /resources | POST | Create new resource |
| /resources/:id | GET | Get single resource |
| /resources/:id | PUT | Full update |
| /resources/:id | PATCH | Partial update |
| /resources/:id | DELETE | Delete resource |
| /resources/many | GET | Get multiple resources by ID |
| /resources/many | POST | Create multiple resources |
| /resources/many/delete| POST | Delete multiple resources |


###  Recommended HTTP Status Codes
| Status | Usage |
|--------|----------------------------------------|
| 200 | Successful GET/PUT/PATCH |
| 201 | Successful POST |
| 204 | Successful DELETE |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource not found |
| 500 | Internal server error |