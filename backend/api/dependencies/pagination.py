from fastapi import Query
from typing import Tuple, Optional

def get_pagination_params(
    current: int = Query(1, alias="_start", ge=1, description="Page starting index"),
    page_size: int = Query(10, alias="_end", ge=1, le=100, description="Items per page"),
    sort: Optional[str] = Query(None, alias="_sort", description="Sort field(s)"),
    order: Optional[str] = Query(None, alias="_order", description="Sort order (asc/desc)")
) -> dict:
    """
    Reusable pagination parameters for Refine-compatible endpoints
    
    Returns:
        dict: Contains 'skip', 'limit', and 'order_by' values
    """
    skip = (current - 1) * page_size
    limit = page_size
    
    # Handle sorting
    order_by = None
    if sort and order:
        order_by = f"{sort} {order.lower()}"
    
    return {
        "skip": skip,
        "limit": limit,
        "order_by": order_by
    } 