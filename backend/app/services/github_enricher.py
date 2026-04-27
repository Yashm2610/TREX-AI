import httpx
import re
from typing import Optional, Dict, Any

class GitHubEnricher:
    def __init__(self):
        self.api_base = "https://api.github.com/repos"

    async def enrich_project(self, github_url: str) -> Optional[Dict[str, Any]]:
        """
        Extracts repository details from a GitHub URL.
        Expected format: https://github.com/owner/repo
        """
        match = re.search(r"github\.com/([^/]+)/([^/]+)", github_url)
        if not match:
            return None

        owner, repo = match.groups()
        # Clean up repo name (remove .git if present)
        repo = repo.replace(".git", "")
        
        api_url = f"{self.api_base}/{owner}/{repo}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(api_url, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "name": data.get("name"),
                        "description": data.get("description"),
                        "tech_stack": [data.get("language")] if data.get("language") else [],
                        "stars": data.get("stargazers_count"),
                        "topics": data.get("topics", [])
                    }
            except Exception as e:
                print(f"[GITHUB] Enrichment error: {e}")
        
        return None
