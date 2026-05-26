import os
from langchain_core.tools import tool
from langchain_community.utilities import WikipediaAPIWrapper
from googleapiclient.discovery import build

wiki_wrapper = WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=800)
youtube = build('youtube', 'v3', developerKey=os.getenv("YOUTUBE_API_KEY"))

#Maps code inputs to specific search queries
POLLUTANT_SEARCH_MAP = {
    "O3": "Ozone",
    "NO2": "Nitrogen dioxide",
    "CO": "Carbon monoxide",
    "SO2": "Sulfur dioxide"
}

@tool
def search_web_for_health_effects(pollutant: str) -> str:
    """Searches Wikipedia for the health effects of a specific air pollutant (e.g., 'O3', 'NO2')."""
    search_term = POLLUTANT_SEARCH_MAP.get(pollutant.strip().upper(), pollutant)
    fallback_url = f"https://en.wikipedia.org/wiki/{search_term.replace(' ', '_')}"
    
    try:
        docs = wiki_wrapper.load(search_term)
        if docs:
            content = docs[0].page_content
            url = docs[0].metadata.get("source", fallback_url)
            return f"{content}\n\nSource URL: {url}"
        
        #If Wikipedia wrapper returns nothing, provides the fallback link directly
        return f"Summary unavailable. Source URL: {fallback_url}"
            
    except Exception as e:
        return f"Summary unavailable. Source URL: {fallback_url}"

@tool
def search_youtube_for_lesson(pollutant: str) -> str:
    """Searches YouTube for an educational video about an air pollutant (e.g., 'O3', 'NO2')."""
    search_term = POLLUTANT_SEARCH_MAP.get(pollutant.strip().upper(), pollutant)
    query = f"{search_term} effects on human lives"
    fallback_url = f"https://www.youtube.com/watch?v=g4QeC008erc"

    try:
        request = youtube.search().list(
            q=query, part="snippet", type="video", maxResults=1, relevanceLanguage="en"
        )
        response = request.execute()

        if response.get('items'):
            video_id = response['items'][0]['id']['videoId']
            return f"https://www.youtube.com/watch?v={video_id}"
        
        return fallback_url
    
    except Exception as e:
        return fallback_url

iris_tools_list = [search_web_for_health_effects, search_youtube_for_lesson]