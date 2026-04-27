from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from app.schemas.builder import ResumeData
from app.services.resume_builder import ResumeBuilder
from app.services.github_enricher import GitHubEnricher
import json
import asyncio
import uuid

router = APIRouter()
builder = ResumeBuilder()
enricher = GitHubEnricher()

# In-memory store for session data (simplified for now)
sessions = {}

@router.post("/generate")
async def start_generation(data: ResumeData):
    session_id = str(uuid.uuid4())
    sessions[session_id] = data
    return {"session_id": session_id}

@router.get("/stream/{session_id}")
async def stream_generation(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    data = sessions[session_id]
    
    async def event_generator():
        try:
            # 1. Heading (Personal Info)
            yield f"data: {json.dumps({'section': 'heading', 'data': data.personal_info})}\n\n"
            await asyncio.sleep(0.5)

            # 2. Summary
            summary = builder.generate_summary(data)
            yield f"data: {json.dumps({'section': 'summary', 'data': summary})}\n\n"
            await asyncio.sleep(0.5)

            # 3. Education
            yield f"data: {json.dumps({'section': 'education', 'data': [e.dict() for e in data.education]})}\n\n"
            await asyncio.sleep(0.5)

            # 4. Experience (Polished bullets)
            polished_exp = []
            for exp in data.experience:
                bullets = builder.polish_experience(exp)
                exp_dict = exp.dict()
                exp_dict['bullets'] = bullets
                polished_exp.append(exp_dict)
                yield f"data: {json.dumps({'section': 'experience_item', 'data': exp_dict})}\n\n"
                await asyncio.sleep(0.3)

            # 5. Projects
            for proj in data.projects:
                # GitHub Enrichment
                if proj.link and "github.com" in proj.link:
                    enriched_data = await enricher.enrich_project(proj.link)
                    if enriched_data:
                        if not proj.description or len(proj.description) < 10:
                            proj.description = enriched_data.get("description") or proj.description
                        if not proj.tech_stack:
                            proj.tech_stack = enriched_data.get("tech_stack", [])
                
                polished = builder.polish_project(proj)
                proj_dict = proj.dict()
                proj_dict.update(polished)
                yield f"data: {json.dumps({'section': 'project_item', 'data': proj_dict})}\n\n"
                await asyncio.sleep(0.3)

            # 6. Skills (Grouped)
            grouped_skills = builder.group_skills(data.skills)
            yield f"data: {json.dumps({'section': 'skills', 'data': grouped_skills})}\n\n"
            await asyncio.sleep(0.5)

            # 7. Final Polish
            yield f"data: {json.dumps({'section': 'status', 'data': 'complete'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/ai-edit")
async def ai_edit_section(section_type: str, content: Any, instruction: str):
    try:
        refined = builder.refine_section(section_type, content, instruction)
        return {"data": refined}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
