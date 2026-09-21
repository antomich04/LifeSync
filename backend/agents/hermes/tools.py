from langchain_community.tools import DuckDuckGoSearchResults
from langchain_core.tools import tool
import re
from urllib.parse import urlparse

ddg_search = DuckDuckGoSearchResults(num_results=15, output_format="list")

POLLUTANT_QUERIES = {
    "NO2": [
        "καθαριστής αέρα φίλτρο ενεργού άνθρακα site:skroutz.gr",
        "air purifier carbon filter site:skroutz.gr",
        "φίλτρο hepa καθαριστής αέρα site:skroutz.gr",
    ],
    "SO2": [
        "καθαριστής αέρα ιονιστής site:skroutz.gr",
        "ιονιστής αέρα hepa site:skroutz.gr",
        "air purifier ionizer site:skroutz.gr",
    ],
    "O3":  [
        "καθαριστής αέρα smart hepa site:skroutz.gr",
        "air purifier smart wifi site:skroutz.gr",
        "smart hepa καθαριστής αέρα site:skroutz.gr",
    ],
    "CO":  [
        "ανιχνευτής μονοξειδίου του άνθρακα site:skroutz.gr",
        "CO detector site:skroutz.gr",
        "αισθητήρας μονοξειδίου site:skroutz.gr",
    ]
}

ALLOWED_DOMAIN = {"skroutz.gr"}
BLOCKED_PATTERNS = re.compile(r"blog|guide|news|article|review|beauty|cosmetic|skoop", re.IGNORECASE)
FALLBACK_PRODUCT_URL = (
    "https://www.skroutz.gr/s/51965155/Hepa-AlecoAir-P14-MINIO-P14MINIO-"
    "Katharistis-Aera-24W-gia-CHorous-15m2.html?adv_c=6Zvya%2FRp5sNb8wqdt93HfJUMkJfO--"
    "YHGeWyuESOmD0k83--IskLdfBLVGVLonMqpup7YA%3D%3D&product_id=194149310&sponsored=cpc"
)


def is_valid_product_url(url: str) -> bool:
    parsed_url = urlparse(url)
    domain_ok = any(parsed_url.netloc.endswith(d) for d in ALLOWED_DOMAIN)
    path = parsed_url.path

    lower_path = path.lower()
    
    #Filters out category pages (/c/) and discussion forums (/discussion instead of .html at the end of URL)
    is_product_page = lower_path.endswith(".html") and "/s/" in lower_path
    not_editorial = not BLOCKED_PATTERNS.search(path)

    return domain_ok and is_product_page and not_editorial


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
        return (
            f"No valid Skroutz products found for {pollutant}. "
            f"Fallback URL: {FALLBACK_PRODUCT_URL}"
        )

    return "\n".join(all_results)


hermes_tools_list = [search_greek_marketplaces]