import traceback
from fastapi import APIRouter, HTTPException
from models.agent_response import AgentResponse
from models.iris_request import IrisRequest
from models.hermes_request import HermesRequest
from services.iris_service import run_iris_agent
from services.hermes_service import run_hermes_agent

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
    

@router.post("/hermes", response_model=AgentResponse)
async def invoke_hermes(payload: HermesRequest):
    """
    Triggers the Hermes Agent to search products on Skroutz/BestPrice.
    """
    try:
        products_list = await run_hermes_agent(
            region=payload.region, 
            forecast_data=payload.forecast_data
        )
        
        return AgentResponse(
            status="success",
            data={
                "agent": "hermes",
                "products": products_list
            }
        )
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))