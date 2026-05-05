from fastapi import APIRouter, HTTPException
from models.agent_response import AgentResponse
from models.iris_request import IrisRequest
from services.iris_service import run_iris_agent

router = APIRouter(prefix='/api')

@router.post('/iris', response_model=AgentResponse)
async def invoke_iris(payload: IrisRequest):
    """
    Triggers the Iris Education Agent to research pollutants.
    """
    try:
        result = await run_iris_agent(
            region=payload.region, 
            forecast_data=payload.forecast_data
        )
        
        return AgentResponse(
            status="success",
            data={
                "agent": "iris",
                "markdown_report": result
            }
        )
        
    except Exception as e:
        #Scenario of agent failure
        raise HTTPException(status_code=500, detail=str(e))