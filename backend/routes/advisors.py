from fastapi import APIRouter, HTTPException, Request
from models.agent_response import AgentResponse
from models.agent_request import AgentRequest
from models.lucy_request import LucyRequest
from services.iris_service import run_iris_agent
from services.hermes_service import run_hermes_agent
from services.lucy_service import run_lucy_agent
from config.rate_limiter import limiter

router = APIRouter(prefix='/api')

@router.post('/iris', response_model=AgentResponse)
@limiter.limit("5/minute")
async def invoke_iris(request: Request,payload: AgentRequest):
    """
    Triggers the Iris Education Agent to research pollutants.
    """
    try:
        result = await run_iris_agent(
            region=payload.region, 
            forecast_data=payload.forecast_data,
            language=payload.language,
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
@limiter.limit("5/minute")
async def invoke_hermes(request: Request, payload: AgentRequest):
    """
    Triggers the Hermes Agent to search products on Skroutz/BestPrice.
    """
    try:
        products_list = await run_hermes_agent(
            region=payload.region, 
            forecast_data=payload.forecast_data,
            language=payload.language,
        )
        
        return AgentResponse(
            status="success",
            data={
                "agent": "hermes",
                "products": products_list
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/lucy", response_model=AgentResponse)
@limiter.limit("5/minute")
async def invoke_lucy(request: Request, payload: LucyRequest):
    """
    Triggers the Lucy Agent to chat with the user
    """
    try:
        result = await run_lucy_agent(
            base_messages=payload.messages,
            region=payload.region
        )
        return AgentResponse(
            status='success',
            data={
                'agent': 'lucy',
                'response': result
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))