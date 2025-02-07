from fastapi import Query, HTTPException
from typing import Tuple, Optional
from enum import Enum
import logging
import sys

# Set up logging to output to console
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create console handler with a higher debug level
ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.DEBUG)

# Create formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)

# Add the handler to the logger
logger.addHandler(ch)

class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"

def get_pagination_params(
    start: Optional[int] = Query(None, alias="_start", ge=0, description="Start index"),
    end: Optional[int] = Query(None, alias="_end", ge=1, description="End index"),
    page: Optional[int] = Query(None, alias="_page", ge=1, description="Page number"),
    limit: Optional[int] = Query(None, alias="_limit", ge=1, le=100, description="Items per page"),
    sort: Optional[str] = Query(None, alias="_sort", description="Sort field(s)"),
    order: Optional[SortOrder] = Query(None, alias="_order", description="Sort order (asc/desc)")
) -> dict:
    """
    Reusable pagination parameters supporting both index-based and page-based pagination
    
    Supports two pagination styles:
    1. start/end: Using _start and _end parameters
    2. page/limit: Using _page and _limit parameters
    
    Returns:
        dict: Contains 'skip', 'limit', and 'order_by' values
    """
    logger.info(f"Received pagination request - page: {page}, limit: {limit}, sort: {sort}, order: {order}")
    
    # Initialize default values
    skip = 0
    items_limit = 10

    # Handle page-based pagination
    if page is not None and limit is not None:
        skip = (page - 1) * limit
        items_limit = limit
        logger.debug(f"Using page-based pagination: page={page}, limit={limit}")
    # Handle start/end pagination
    elif start is not None and end is not None:
        if end <= start:
            raise HTTPException(
                status_code=422,
                detail="End index must be greater than start index"
            )
        skip = start
        items_limit = end - start
        logger.debug(f"Using start/end pagination: start={start}, end={end}")

    # Handle sorting
    order_by = None
    if sort and order:
        # For SQL Alchemy: field_name DESC/ASC
        order_direction = "DESC" if order == SortOrder.DESC else "ASC"
        order_by = f"{sort} {order_direction}"
        logger.info(f"Sorting parameters - Field: {sort}, Direction: {order_direction}")
        logger.info(f"Generated order_by clause: {order_by}")

    result = {
        "skip": skip,
        "limit": items_limit,
        "order_by": order_by
    }
    logger.info(f"Final pagination parameters: {result}")
    return result

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