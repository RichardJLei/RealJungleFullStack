from fastapi import Query, HTTPException
from typing import Tuple, Optional

def get_pagination_params(
    start: int = Query(0, alias="_start", ge=0, description="Start index"),
    end: int = Query(10, alias="_end", ge=1, description="End index"),
    sort: Optional[str] = Query(None, alias="_sort", description="Sort field(s)"),
    order: Optional[str] = Query(None, alias="_order", description="Sort order (asc/desc)")
) -> dict:
    """
    Reusable pagination parameters for Refine-compatible endpoints
    
    Returns:
        dict: Contains 'skip', 'limit', and 'order_by' values
    """
    if end <= start:
        raise HTTPException(
            status_code=422,
            detail="End index must be greater than start index"
        )
    
    return {
        "skip": start,
        "limit": end - start,  # Calculate actual page size
        "order_by": f"{sort} {order.lower()}" if sort and order else None
    } 