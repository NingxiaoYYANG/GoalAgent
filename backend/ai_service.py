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
Please expand the following milestone into a list of 3–5 specific skills, 3–5 learning resources, and 2–3 tangible achievements.

Milestone: {milestone_name}
Career Path: {context.get('career_path')}
Specialization: {context.get('specialization')}
Year: {context.get('year')}

Output format:
{{
  "skills": [...],
  "resources": [...],
  "achievements": [...]
}}
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
                return {"error": "Invalid response format", "skills": [], "resources": [], "achievements": []}
        except Exception as e:
            print(f"[ERROR expand_milestone] {e}")
            return {"error": str(e), "skills": [], "resources": [], "achievements": []}
