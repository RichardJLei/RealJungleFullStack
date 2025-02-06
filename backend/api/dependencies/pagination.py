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

def pagination_params(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    return {"skip": skip, "limit": limit}

from fastapi import Query as FilterQuery

def refine_filter_parser(
    filter_field: Optional[str] = Query(None, alias="filter[field]"),
    filter_operator: Optional[str] = Query(None, alias="filter[operator]"),
    filter_value: Optional[str] = Query(None, alias="filter[value]")
):
    """Parse Refine-style filter parameters according to official spec"""
    if filter_field and filter_operator and filter_value:
        return [{
            "field": filter_field,
            "operator": filter_operator,
            "value": filter_value
        }]
    return [] 