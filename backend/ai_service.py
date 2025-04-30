import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is not set")

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(model_name="models/gemini-1.5-pro-latest")

    def extract_year_count(self, timeline_str):
        if '1-2' in timeline_str:
            return 2
        if '3-5' in timeline_str:
            return 3
        if '5-10' in timeline_str:
            return 5
        if '10' in timeline_str:
            return 10
        digits = [int(s) for s in timeline_str.split() if s.isdigit()]
        return digits[0] if digits else 3

    def generate_outline(self, user_data):
        timeline = user_data.get('input', {}).get('timeline', '3 years')
        year_count = self.extract_year_count(timeline)
        prompt = f"""
Create a {year_count}-year career development roadmap outline in JSON format.
description needs to be short and concise, no more than 10 words.
Only include the top-level structure with:
- id, name, description for the overall goal (ultimate_goal)
- a list of years (children), each with:
  - id, name, description
  - milestone names only (no skills/resources/achievements yet)

User Info:
- Category: {user_data.get('category_selection', {}).get('selected_category')}
- Career Path: {user_data.get('career_selection', {}).get('career_path')}
- Specialization: {user_data.get('career_selection', {}).get('specialization')}
- Skills: {user_data.get('input', {}).get('skills')}
"""
        try:
            response = self.model.generate_content([prompt])
            generated_text = response.text
            print(generated_text)
            json_start = generated_text.find('{')
            json_end = generated_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                return json.loads(generated_text[json_start:json_end])
        except Exception as e:
            print(f"[ERROR generate_outline] {e}")
        return {}

    def expand_milestone(self, milestone_name, context):
        print(f"[DEBUG] Expanding milestone: {milestone_name}")
        print(f"[DEBUG] Context: {context}")
        
        prompt = f"""
You are a career development AI assistant. Based on the user's complete background information below, expand the specified milestone into a multi-level tree of subtasks and skills. All content must be tailored to the user's context.

[User Context] (JSON):
{json.dumps(context, ensure_ascii=False, indent=2)}

[Milestone to expand]: {milestone_name}

[Requirements]:
1. Generate a tree structure with 2-3 levels, showing task breakdown and skill dependencies.
2. Each node must include:
   - name: concise name
   - description: short description (max 10 words)
   - difficulty: easy/medium/hard
   - skills: list of specific skills
   - children: (optional) list of subtasks
3. First level: main subtasks (2-4 items), second level: detailed steps for each subtask (2-3 items), third level: implementation details (optional).
4. Reasonable difficulty distribution, logical progression.
5. Output standard JSON, and ensure all content is highly relevant to the user's background, goals, interests, and skills.

[Output format example]:
{{
  "name": "Milestone Name",
  "description": "Brief description",
  "difficulty": "medium",
  "skills": ["skill1", "skill2"],
  "children": [
    {{
      "name": "Subtask 1",
      "description": "Brief description",
      "difficulty": "easy",
      "skills": ["subskill1"],
      "children": [
        {{
          "name": "Step 1",
          "description": "Brief description",
          "difficulty": "easy",
          "skills": ["stepskill1"]
        }}
      ]
    }}
  ]
}}

Please strictly output JSON only.
"""
        try:
            response = self.model.generate_content([prompt])
            generated_text = response.text
            print(f"[DEBUG] Generated text: {generated_text}")
            
            json_start = generated_text.find('{')
            json_end = generated_text.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                result = json.loads(generated_text[json_start:json_end])
                print(f"[DEBUG] Parsed result: {result}")
                return result
            else:
                print("[ERROR] No valid JSON found in response")
                return {
                    "error": "Invalid response format",
                    "name": milestone_name,
                    "description": "Failed to generate detailed structure",
                    "difficulty": "medium",
                    "skills": [],
                    "children": []
                }
        except Exception as e:
            print(f"[ERROR expand_milestone] {e}")
            return {
                "error": str(e),
                "name": milestone_name,
                "description": "Error generating structure",
                "difficulty": "medium",
                "skills": [],
                "children": []
            }
