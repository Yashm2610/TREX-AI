import os
import json
import re
from typing import Optional, List, Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from app.schemas.builder import ResumeData, Experience, Project

def get_groq_api_key():
    return os.getenv("GROQ_API_KEY", "")

class ResumeBuilder:
    def __init__(self, provider: str = "groq"):
        self.api_key = get_groq_api_key()
        self.model = "llama-3.1-8b-instant"
        self.temperature = 0.3

    def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        if not self.api_key:
            return "API Key missing."
        
        llm = ChatGroq(
            api_key=self.api_key,
            model=self.model,
            temperature=self.temperature,
            max_tokens=2000,
        )
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]
        
        response = llm.invoke(messages)
        return response.content.strip()

    def generate_summary(self, data: ResumeData) -> str:
        system_prompt = "You are a professional resume writer. Generate a compelling 2-3 sentence professional summary based on the provided user data. Focus on impact and key strengths. Return ONLY the summary text."
        user_prompt = f"User Data: {data.json()}"
        return self._call_llm(system_prompt, user_prompt)

    def polish_experience(self, exp: Experience) -> List[str]:
        system_prompt = "You are an expert at writing ATS-friendly resume bullet points. Transform the raw experience details into 3-5 high-impact bullet points using action verbs and quantifiable results. Return the bullets as a JSON list of strings. DO NOT return anything else."
        user_prompt = f"Experience: {exp.json()}"
        raw = self._call_llm(system_prompt, user_prompt)
        try:
            # Clean JSON
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)
        except:
            return exp.bullets if exp.bullets else ["Successfully managed projects", "Improved efficiency"]

    def polish_project(self, proj: Project) -> Dict[str, Any]:
        system_prompt = "You are a technical resume expert. Refine this project description to be more technical and impact-oriented. Also suggest a concise tech stack if missing. Return a JSON object with 'description' (string) and 'tech_stack' (list of strings). DO NOT return anything else."
        user_prompt = f"Project: {proj.json()}"
        raw = self._call_llm(system_prompt, user_prompt)
        try:
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)
        except:
            return {"description": proj.description, "tech_stack": proj.tech_stack}

    def group_skills(self, skills: List[str]) -> Dict[str, List[str]]:
        system_prompt = "Group these technical skills into logical categories (e.g., Languages, Frameworks, Tools, Cloud). Return a JSON object where keys are categories and values are lists of skills. DO NOT return anything else."
        user_prompt = f"Skills: {', '.join(skills)}"
        raw = self._call_llm(system_prompt, user_prompt)
        try:
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)
        except:
            return {"Skills": skills}

    def refine_section(self, section_type: str, current_content: Any, instruction: str) -> Any:
        system_prompt = f"You are a professional resume editor. Your task is to refine the following '{section_type}' section based on the user's instruction: '{instruction}'. Maintain the same data structure as the input. Return ONLY the refined content as a JSON object/list. No markdown formatting."
        user_prompt = f"Current Content: {json.dumps(current_content)}"
        raw = self._call_llm(system_prompt, user_prompt)
        try:
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)
        except:
            return current_content
