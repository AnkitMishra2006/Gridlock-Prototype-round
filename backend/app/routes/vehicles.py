from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..database import get_database

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.get("/{license_plate}", response_model=dict)
async def get_vehicle_history(
    license_plate: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get vehicle history by license plate number
    
    Shows all violations and whether vehicle is a repeat offender
    """
    offenders = db.offenders
    offender = await offenders.find_one({"license_plate": license_plate})
    
    if not offender:
        raise HTTPException(status_code=404, detail="No records found for this vehicle")
    
    offender["_id"] = str(offender["_id"])
    
    # Get associated incidents
    incidents = db.incidents
    cursor = incidents.find(
        {"license_plates": license_plate}
    ).sort("timestamp", -1).limit(50)
    
    incident_list = await cursor.to_list(length=50)
    for inc in incident_list:
        inc["_id"] = str(inc["_id"])
    
    offender["incidents"] = incident_list
    
    return offender


@router.get("/", response_model=List[dict])
async def get_repeat_offenders(
    min_violations: int = Query(3, ge=1),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get repeat offenders
    
    - **min_violations**: Minimum number of violations to be considered repeat offender
    - **limit**: Maximum number of records to return
    """
    offenders = db.offenders
    cursor = offenders.find(
        {"total_violations": {"$gte": min_violations}}
    ).sort("total_violations", -1).limit(limit)
    
    offender_list = await cursor.to_list(length=limit)
    
    for offender in offender_list:
        offender["_id"] = str(offender["_id"])
    
    return offender_list
