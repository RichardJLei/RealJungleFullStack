from typing import List, Dict, Any
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select
from datetime import datetime
from sqlalchemy.types import String, Text
import logging

logger = logging.getLogger(__name__)

class QueryBuilder:
    def __init__(self, model_class):
        self.model_class = model_class
        self.base_query = select(model_class)
        self.query = self.base_query

    def apply_filters(self, filters: List[Dict]) -> 'QueryBuilder':
        """Apply filters to query based on filter parameters"""
        for f in filters:
            field = getattr(self.model_class, f["field"], None)
            if not field:
                continue
                
            value = self._convert_field_type(field, f["value"])
            if value is None:
                continue

            # Apply operator to both base_query and query
            condition = self._get_filter_condition(field, f["operator"], value)
            if condition is not None:
                self.base_query = self.base_query.where(condition)
                self.query = self.query.where(condition)

        return self

    def _convert_field_type(self, field, value):
        """Convert value to appropriate field type"""
        try:
            field_type = str(field.type)
            if field_type in ('INTEGER', 'BIGINT'):
                return int(value)
            elif field_type == 'FLOAT':
                return float(value)
            elif field_type == 'DATETIME':
                return datetime.fromisoformat(value)
            return value
        except (ValueError, TypeError):
            logger.warning(f"Type conversion failed for field {field} with value {value}")
            return None

    def _get_filter_condition(self, field, operator: str, value: Any):
        """Get filter condition without modifying query"""
        operators = {
            "eq": lambda f, v: f == v,
            "ne": lambda f, v: f != v,
            "lt": lambda f, v: f < v,
            "lte": lambda f, v: f <= v,
            "gt": lambda f, v: f > v,
            "gte": lambda f, v: f >= v,
        }

        string_operators = {
            "contains": lambda f, v: f.ilike(f"%{v}%"),
            "ncontains": lambda f, v: ~f.ilike(f"%{v}%"),
            "startswith": lambda f, v: f.ilike(f"{v}%"),
            "nstartswith": lambda f, v: ~f.ilike(f"{v}%"),
            "endswith": lambda f, v: f.ilike(f"%{v}"),
            "nendswith": lambda f, v: ~f.ilike(f"%{v}")
        }

        if operator in operators:
            return operators[operator](field, value)
        
        if operator in string_operators and isinstance(field.type, (String, Text)):
            return string_operators[operator](field, value)
            
        return None

    def apply_sorting(self, order_by: str) -> 'QueryBuilder':
        """Apply sorting to query"""
        if order_by:
            self.base_query = self.base_query.order_by(text(order_by))
            self.query = self.query.order_by(text(order_by))
        return self

    def apply_pagination(self, skip: int, limit: int) -> 'QueryBuilder':
        """Apply pagination to query"""
        # Only apply pagination to the working query, not the base query
        self.query = self.base_query.offset(skip).limit(limit)
        return self

    async def execute(self, db: AsyncSession) -> tuple[List, int]:
        """Execute query and return results with total count"""
        # Use base_query for count to get total without pagination
        count_result = await db.execute(
            select(func.count()).select_from(self.base_query.alias())
        )
        total = count_result.scalar()

        # Use paginated query for actual results
        result = await db.execute(self.query)
        items = result.scalars().all()

        return items, total 