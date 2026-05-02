from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Education(BaseModel):
    institution: str
    degree: str
    field: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None

class Experience(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    bullets: List[str] = []

class Project(BaseModel):
    name: str
    link: Optional[str] = None
    description: str
    tech_stack: List[str] = []

class Certification(BaseModel):
    name: str
    issuer: str
    date: Optional[str] = None

class ResumeData(BaseModel):
    personal_info: Dict[str, str] = Field(default_factory=dict)
    summary: Optional[str] = None
    education: List[Education] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    certifications: List[Certification] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)

class BuildSession(BaseModel):
    session_id: str
    status: str
    current_section: Optional[str] = None
    progress: int = 0
