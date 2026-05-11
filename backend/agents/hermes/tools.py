from langchain_community.tools import DuckDuckGoSearchResults
from langchain_core.tools import tool
import re

ddg_search = DuckDuckGoSearchResults(num_results=10, output_format="list")

POLLUTANT_QUERIES = {
    "NO2": ["καθαριστής αέρα ενεργός άνθρακας site:skroutz.gr", "air purifier carbon filter site:skroutz.gr"],
    "SO2": ["καθαριστής αέρα ενεργός άνθρακας site:skroutz.gr", "φίλτρο άνθρακα καθαριστής site:skroutz.gr"],
    "O3":  ["καθαριστής αέρα site:skroutz.gr", "air purifier O3 site:skroutz.gr"],
    "CO":  ["ανιχνευτής μονοξειδίου του άνθρακα site:skroutz.gr", "CO detector site:skroutz.gr"],
}

ALLOWED_DOMAIN = {"skroutz.gr"}
BLOCKED_PATTERNS = re.compile(r"blog|guide|news|article|review|beauty|cosmetic|skoop", re.IGNORECASE)


def is_valid_product_url(url: str) -> bool:
    domain_ok = any(d in url for d in ALLOWED_DOMAIN)

    #Blocks the homepage and generic search endpoints.
    is_item_page = "/s/" in url
    
    not_editorial = not BLOCKED_PATTERNS.search(url)
    
    return domain_ok and is_item_page and not_editorial


@tool
def search_greek_marketplaces(pollutant: str) -> str:
    """
    Searches Skroutz for products that mitigate the given pollutant.
    Args:
        pollutant: One of NO2, SO2, O3, CO
    """
    queries = POLLUTANT_QUERIES.get(pollutant.upper(), [f"air purifier carbon {pollutant}"])

    all_results = []
    for query in queries:
        try:
            results = ddg_search.invoke(query)  #returns a list of dictionaries, with key names of: title, snippet, link
            for r in results:
                url = r.get("link", "")

                if is_valid_product_url(url):
                    all_results.append(f"Title: {r['title']} | URL: {url} | Snippet: {r['snippet']}")

                    if len(all_results) >= 2:  #early exit if enough results are fetched
                        break
        
        except Exception as e:
            print(f"Search error for '{query}': {e}")

        if len(all_results) >= 2:  #early exit if enough results are fetched
            break

    if not all_results:
        return f"No valid Skroutz products found for {pollutant}."

    return "\n".join(all_results)


hermes_tools_list = [search_greek_marketplaces]