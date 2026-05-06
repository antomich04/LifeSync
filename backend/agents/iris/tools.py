import os
from langchain_core.tools import tool
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from googleapiclient.discovery import build

wikipedia = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=1500))
youtube = build('youtube', 'v3', developerKey=os.getenv("YOUTUBE_API_KEY"))

@tool
def search_web_for_health_effects(pollutant: str) -> str:
    """Searches Wikipedia for the health effects of a specific air pollutant."""

    query = f"{pollutant} pollutant health effects"

    try:

        content = wikipedia.invoke({"query": query})
        wiki_url = f"https://en.wikipedia.org/w/index.php?search={query.replace(' ', '+')}"

        return f"{content}\n\nSource URL: {wiki_url}"
    
    except Exception as e:
        return f"Could not fetch data for {pollutant}. Error: {str(e)}"

@tool
def search_youtube_for_lesson(pollutant: str) -> str:
    """Searches YouTube for a short, educational video explaining the health effects of a specific air pollutant."""

    query = f"{pollutant} air pollution health effects"

    try:

        request = youtube.search().list(
            q=query, part="snippet", type="video", maxResults=1, relevanceLanguage="en"
        )

        response = request.execute()

        if response['items']:
            video_id = response['items'][0]['id']['videoId']
            return f"https://www.youtube.com/watch?v={video_id}"
        
        return "No video found."
    
    except Exception as e:
        return f"Could not fetch YouTube video. Error: {str(e)}"


iris_tools_list = [search_web_for_health_effects, search_youtube_for_lesson]