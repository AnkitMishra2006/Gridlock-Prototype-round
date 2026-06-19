from fastapi import APIRouter, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..database import get_database
from ..services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=dict)
async def get_dashboard_stats(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get comprehensive dashboard statistics
    
    Returns:
    - Violations today
    - Active accidents
    - High severity alerts
    - Pending responses (police/hospital)
    - Camera stats
    - Average response time
    - City safety score
    - Violation trend (last 24h)
    - Top violation types
    - Severity distribution
    """
    service = DashboardService(db)
    stats = await service.get_dashboard_stats()
    return stats


@router.get("/heatmap", response_model=List[dict])
async def get_heatmap_data(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get violation heatmap data
    
    Returns geographic points with violation counts for map visualization
    """
    service = DashboardService(db)
    heatmap = await service.get_heatmap_data()
    return heatmap
