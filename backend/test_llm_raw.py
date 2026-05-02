import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

load_dotenv(".env.development")

from app.services.llm_feedback import generate_ai_feedback

test_resume = """
John Doe
Software Engineer
john@example.com

EXPERIENCE:
Full Stack Developer at TechCorp (2020-2023)
- Built several websites.

PROJECTS:
1. E-commerce Website: Developed a web app for selling clothes using React and Node.js. It had a cart and login.
2. Blockchain App: Created a decentralized app for voting on Ethereum. It was very secure.

SKILLS: Python, JavaScript, SQL.
"""

test_jd = """
Senior Full Stack Engineer
We need someone with 5+ years of experience in React, Node.js, and Cloud infrastructure.
Must have experience scaling projects to 10k+ users and implementing robust security.
"""

def test():
    print("Testing LLM Project Granularity...")
    feedback = generate_ai_feedback(test_resume, test_jd)
    if feedback:
        import json
        print(json.dumps(feedback["project_review"], indent=2))
        print("\nSuggested Resume Changes:")
        print(json.dumps(feedback["suggested_resume_changes"], indent=2))
    else:
        print("Failed to get feedback.")

if __name__ == "__main__":
    test()
