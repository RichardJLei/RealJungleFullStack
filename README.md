# RealJungleFullStack
Modern Full-Stack Framework with Refine + FastAPI + SQLAlchemy

## Core Workflow: Blog Post Management

### 1. Accessing web page: http://localhost:3000/blog-post-sql

**Frontend Flow:**
1. React Router matches URL to `BlogPostSQLList` component
2. Component initializes table configuration:

   ```typescript
   // list.tsx
   const { tableProps } = useTable({
     resource: "blog-post-sql",
     syncWithLocation: true,
     pagination: { current: 1, pageSize: 10 }
   });
   ```
3. Data provider executes API call:
   ```
   GET /blog-post-sql?_page=1&_per_page=10&filter[status]=published
   ```

### 2. Backend Processing
**Endpoint Flow** (`blog_post_sql.py`):

# blog_post_sql.py
@router.get("/")
async def get_blog_posts(
pagination: dict = Depends(get_pagination_params), # From pagination.py
filters: list = Depends(refine_filter_parser), # From filter parser
db: AsyncSession = Depends(get_async_session)
):
query_builder = QueryBuilder(BlogPost) # Reusable query builder
query_builder.apply_filters(filters)
query_builder.apply_pagination(pagination)
results = await query_builder.execute(db)
return JSONResponse({
"data": jsonable_encoder(results.items),
"total": results.total
})


### 3. Data Display
**Frontend Rendering**:
typescript
// list.tsx
const { tableProps } = useTable({
resource: "blog-post-sql",
permanentFilter: baseFilter,
syncWithLocation: true
});
// Uses processedColumns from useTableCustomization
<Table {...tableProps}>
{processedColumns.map(column => (
<Table.Column {...column} />
))}
</Table>


## Reusability Blueprint

### To Add New Table Page (e.g. "products"):

1. **Backend** (`backend/api/products.py`)
python
router = APIRouter(prefix="/products") # Reuse existing patterns
@router.get("/")
async def get_products(
pagination=Depends(get_pagination_params), # Existing dependency
filters=Depends(refine_filter_parser), # Existing filter parser
db=Depends(get_async_session)
):
return await QueryBuilder(Product).execute(db) # Reuse QueryBuilder


2. **Frontend** (`frontend/src/pages/products/list.tsx`)
typescript
export const ProductList = () => {
const { processedColumns } = useTableCustomization([...]); // Reuse hook
return (
<List>
<Table {...useTable()} rowKey="id">
{processedColumns.map(c => (
<Table.Column {...c} />
))}
</Table>
</List>
);
};



## Key Reusable Components

| Component               | Location                          | Functionality                          |
|-------------------------|-----------------------------------|----------------------------------------|
| `QueryBuilder`          | `utils/query_builder.py`         | Dynamic SQL query construction        |
| `get_pagination_params` | `dependencies/pagination.py`     | Standard pagination handling          |
| `useTableCustomization` | `hooks/useTableCustomization.tsx`| Column management & persistence       |
| `dataProvider`          | `providers/dataProvider.ts`       | API client with error handling         |

1. `QueryBuilder` (Python)
   - Handles filter/pagination/sorting
   - Works with any SQLAlchemy model

2. `useTableCustomization` (TS)
   - Column management
   - Filter persistence
   - Render customization

3. `get_pagination_params` (Python)
   - Standardized pagination format
   - Page size validation
   - Header generation

4. `dataProvider` (JS)
   - API error handling
   - Response normalization
   - Cache management


**Development Principles:**
1. Consistent API parameters (`_page`, `_per_page`, `filter[]`)
2. Modular frontend components
3. Database-agnostic query builder
4. Configuration-driven development