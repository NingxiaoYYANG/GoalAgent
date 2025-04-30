import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

class AIService:
    def __init__(self):
        # Configure Google API
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is not set")

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel("gemini-pro")

    def generate_career_path(self, user_data):
        """
        Generate career path recommendations based on user data
        """
        prompt = self._prepare_prompt(user_data)

        try:
            response = self.model.generate_content(prompt)
            generated_text = response.text

            json_start = generated_text.find('{')
            json_end = generated_text.rfind('}') + 1

            if json_start >= 0 and json_end > json_start:
                json_str = generated_text[json_start:json_end]
                career_path = json.loads(json_str)
                return self._validate_and_enhance_career_path(career_path, user_data)
            else:
                return self._create_default_career_path(user_data)

        except Exception as e:
            print(f"Error in Gemini API call or response parsing: {e}")
            return self._create_default_career_path(user_data)

    def _validate_and_enhance_career_path(self, career_path, user_data):
        """
        Validate and enhance the career path to ensure it has the required structure
        """
        # Ensure the career path has the required structure
        if not isinstance(career_path, dict):
            return self._create_default_career_path(user_data)
        
        # Ensure the career path has the required fields
        if 'id' not in career_path or 'name' not in career_path or 'description' not in career_path:
            career_path['id'] = "ultimate_goal"
            career_path['name'] = self._get_career_goal_name(user_data)
            career_path['description'] = self._get_career_goal_description(user_data)
        
        # Ensure the career path has children
        if 'children' not in career_path or not career_path['children']:
            career_path['children'] = self._create_default_years(user_data)
        else:
            # Ensure each year has milestones
            for year in career_path['children']:
                if 'milestones' not in year or not year['milestones']:
                    year['milestones'] = self._create_default_milestones(year.get('id', ''), user_data)
                else:
                    # Ensure each milestone has the required fields and skill children
                    for milestone in year['milestones']:
                        if 'skills' not in milestone or not milestone['skills']:
                            milestone['skills'] = ["Skill 1", "Skill 2"]
                        
                        # Add skill children to each milestone
                        if 'children' not in milestone:
                            milestone['children'] = []
                        
                        # Add each skill as a child node
                        for skill in milestone['skills']:
                            skill_id = f"{milestone['id']}_skill_{len(milestone['children']) + 1}"
                            milestone['children'].append({
                                "id": skill_id,
                                "name": skill,
                                "description": f"Learn {skill}"
                            })
                        
                        if 'resources' not in milestone or not milestone['resources']:
                            milestone['resources'] = ["Resource 1", "Resource 2"]
                        if 'achievements' not in milestone or not milestone['achievements']:
                            milestone['achievements'] = ["Achievement 1", "Achievement 2"]
        
        return career_path

    def _create_default_career_path(self, user_data):
        """
        Create a default career path structure when the model fails
        """
        career = user_data.get('career_selection', {}).get('career', {})
        specialization = user_data.get('career_selection', {}).get('specialization', {})
        
        return {
            "id": "ultimate_goal",
            "name": f"Senior {specialization.get('name', 'Professional')} in {career.get('name', 'IT')}",
            "description": f"Become an expert in {specialization.get('name', 'your field')} within the {career.get('name', 'IT')} industry",
            "children": self._create_default_years(user_data)
        }
    
    def _create_default_years(self, user_data):
        """
        Create default year nodes based on user data
        """
        # Get timeline from user data
        timeline = user_data.get('input', {}).get('timeline', '')
        years = 3  # default value
        if '1-2' in timeline:
            years = 2
        elif '3-5' in timeline:
            years = 3
        elif '5-10' in timeline:
            years = 5
        elif '10' in timeline:
            years = 10
        
        # Create year nodes
        year_nodes = []
        for i in range(1, years + 1):
            year_nodes.append({
                "id": f"year_{i}",
                "name": f"Year {i}",
                "description": self._get_year_description(i, user_data),
                "milestones": self._create_default_milestones(f"year_{i}", user_data)
            })
        
        return year_nodes
    
    def _create_default_milestones(self, year_id, user_data):
        """
        Create default milestone nodes for a year
        """
        # Get career and specialization from user data
        career = user_data.get('career_selection', {}).get('career', {}).get('name', 'IT')
        specialization = user_data.get('career_selection', {}).get('specialization', {}).get('name', 'Development')
        year_num = int(year_id.split('_')[1]) if '_' in year_id else 1
        
        # Create milestone nodes based on the year
        if year_num == 1:
            return [
                {
                    "id": f"milestone_{year_num}_1",
                    "name": "Foundation Skills",
                    "description": f"Master fundamental skills in {specialization}",
                    "skills": ["Basic technical skills", "Communication", "Problem solving"],
                    "resources": ["Online courses", "Documentation", "Practice projects"],
                    "achievements": ["Complete certification", "Build portfolio project"],
                    "children": [
                        {"id": f"milestone_{year_num}_1_skill_1", "name": "Basic technical skills", "description": "Learn basic technical skills"},
                        {"id": f"milestone_{year_num}_1_skill_2", "name": "Communication", "description": "Improve communication skills"},
                        {"id": f"milestone_{year_num}_1_skill_3", "name": "Problem solving", "description": "Develop problem solving abilities"}
                    ]
                },
                {
                    "id": f"milestone_{year_num}_2",
                    "name": "Industry Basics",
                    "description": f"Understand {career} industry fundamentals",
                    "skills": ["Industry terminology", "Basic tools", "Workflow processes"],
                    "resources": ["Industry guides", "Tutorial videos", "Practice exercises"],
                    "achievements": ["Complete industry certification", "Create basic project"],
                    "children": [
                        {"id": f"milestone_{year_num}_2_skill_1", "name": "Industry terminology", "description": "Learn industry terminology"},
                        {"id": f"milestone_{year_num}_2_skill_2", "name": "Basic tools", "description": "Master basic industry tools"},
                        {"id": f"milestone_{year_num}_2_skill_3", "name": "Workflow processes", "description": "Understand workflow processes"}
                    ]
                }
            ]
        elif year_num == 2:
            return [
                {
                    "id": f"milestone_{year_num}_1",
                    "name": "Specialization Focus",
                    "description": f"Deep dive into {specialization} specialized areas",
                    "skills": ["Advanced technical skills", "Industry knowledge", "Project management"],
                    "resources": ["Advanced courses", "Industry conferences", "Mentorship"],
                    "achievements": ["Complete advanced certification", "Lead a team project"],
                    "children": [
                        {"id": f"milestone_{year_num}_1_skill_1", "name": "Advanced technical skills", "description": "Master advanced technical skills"},
                        {"id": f"milestone_{year_num}_1_skill_2", "name": "Industry knowledge", "description": "Gain deep industry knowledge"},
                        {"id": f"milestone_{year_num}_1_skill_3", "name": "Project management", "description": "Learn project management skills"}
                    ]
                },
                {
                    "id": f"milestone_{year_num}_2",
                    "name": "Professional Development",
                    "description": "Build professional presence and network",
                    "skills": ["Networking", "Public speaking", "Professional writing"],
                    "resources": ["Networking events", "Public speaking courses", "Writing workshops"],
                    "achievements": ["Build professional network", "Present at industry event"],
                    "children": [
                        {"id": f"milestone_{year_num}_2_skill_1", "name": "Networking", "description": "Develop networking skills"},
                        {"id": f"milestone_{year_num}_2_skill_2", "name": "Public speaking", "description": "Improve public speaking abilities"},
                        {"id": f"milestone_{year_num}_2_skill_3", "name": "Professional writing", "description": "Enhance professional writing skills"}
                    ]
                }
            ]
        elif year_num == 3:
            return [
                {
                    "id": f"milestone_{year_num}_1",
                    "name": "Leadership and Innovation",
                    "description": "Develop leadership skills and drive innovation",
                    "skills": ["Leadership", "Innovation", "Strategic thinking"],
                    "resources": ["Leadership training", "Industry networking", "Research papers"],
                    "achievements": ["Lead major project", "Contribute to industry innovation"],
                    "children": [
                        {"id": f"milestone_{year_num}_1_skill_1", "name": "Leadership", "description": "Develop leadership abilities"},
                        {"id": f"milestone_{year_num}_1_skill_2", "name": "Innovation", "description": "Foster innovation skills"},
                        {"id": f"milestone_{year_num}_1_skill_3", "name": "Strategic thinking", "description": "Enhance strategic thinking capabilities"}
                    ]
                },
                {
                    "id": f"milestone_{year_num}_2",
                    "name": "Industry Recognition",
                    "description": "Establish yourself as an industry expert",
                    "skills": ["Thought leadership", "Industry speaking", "Publication"],
                    "resources": ["Speaking engagements", "Industry publications", "Expert panels"],
                    "achievements": ["Publish industry article", "Speak at major conference"],
                    "children": [
                        {"id": f"milestone_{year_num}_2_skill_1", "name": "Thought leadership", "description": "Develop thought leadership skills"},
                        {"id": f"milestone_{year_num}_2_skill_2", "name": "Industry speaking", "description": "Master industry speaking abilities"},
                        {"id": f"milestone_{year_num}_2_skill_3", "name": "Publication", "description": "Learn publication skills"}
                    ]
                }
            ]
        else:
            # For years beyond 3, create generic milestones
            return [
                {
                    "id": f"milestone_{year_num}_1",
                    "name": f"Year {year_num} Advanced Skills",
                    "description": f"Master advanced skills in {specialization}",
                    "skills": ["Advanced technical skills", "Industry expertise", "Leadership"],
                    "resources": ["Advanced training", "Industry events", "Mentorship"],
                    "achievements": ["Complete advanced certification", "Lead major project"],
                    "children": [
                        {"id": f"milestone_{year_num}_1_skill_1", "name": "Advanced technical skills", "description": "Master advanced technical skills"},
                        {"id": f"milestone_{year_num}_1_skill_2", "name": "Industry expertise", "description": "Gain industry expertise"},
                        {"id": f"milestone_{year_num}_1_skill_3", "name": "Leadership", "description": "Develop leadership abilities"}
                    ]
                },
                {
                    "id": f"milestone_{year_num}_2",
                    "name": f"Year {year_num} Industry Impact",
                    "description": "Make significant impact in the industry",
                    "skills": ["Industry leadership", "Innovation", "Strategic thinking"],
                    "resources": ["Leadership programs", "Industry conferences", "Research"],
                    "achievements": ["Industry recognition", "Innovation award"],
                    "children": [
                        {"id": f"milestone_{year_num}_2_skill_1", "name": "Industry leadership", "description": "Develop industry leadership skills"},
                        {"id": f"milestone_{year_num}_2_skill_2", "name": "Innovation", "description": "Foster innovation abilities"},
                        {"id": f"milestone_{year_num}_2_skill_3", "name": "Strategic thinking", "description": "Enhance strategic thinking capabilities"}
                    ]
                }
            ]

    def _get_career_goal_name(self, user_data):
        """
        Get the career goal name based on user data
        """
        career = user_data.get('career_selection', {}).get('career', {})
        specialization = user_data.get('career_selection', {}).get('specialization', {})
        
        return f"Senior {specialization.get('name', 'Professional')} in {career.get('name', 'IT')}"
    
    def _get_career_goal_description(self, user_data):
        """
        Get the career goal description based on user data
        """
        career = user_data.get('career_selection', {}).get('career', {})
        specialization = user_data.get('career_selection', {}).get('specialization', {})
        
        return f"Become an expert in {specialization.get('name', 'your field')} within the {career.get('name', 'IT')} industry"
    
    def _get_year_description(self, year_num, user_data):
        """
        Get the year description based on the year number and user data
        """
        if year_num == 1:
            return "Foundation and skill building"
        elif year_num == 2:
            return "Advanced concepts and specialization"
        elif year_num == 3:
            return "Expert level and leadership"
        else:
            return f"Year {year_num} advanced development and industry impact"

    def _prepare_prompt(self, user_data):
        """
        Prepare the prompt for the AI model based on user data
        """
        questionnaire = user_data.get('questionnaire', {})
        category = user_data.get('category_selection', {})
        career = user_data.get('career_selection', {})
        input_data = user_data.get('input', {})

        # Extract timeline years
        timeline = input_data.get('timeline', '')
        years = 3  # default value
        if '1-2' in timeline:
            years = 2
        elif '3-5' in timeline:
            years = 3
        elif '5-10' in timeline:
            years = 5
        elif '10' in timeline:
            years = 10

        prompt = f"""Create a detailed and personalized career development roadmap in JSON format based on the user's profile and preferences.

        User Profile:
        - Top Category: {questionnaire.get('top_category')}
        - Category Scores: {questionnaire.get('category_scores')}
        - Selected Category: {category.get('selected_category')}
        - Career Path: {career.get('career_path')}
        - Specialization: {career.get('specialization')}
        - Timeline: {timeline}
        - Skills to Improve: {input_data.get('skills')}

        Required JSON Structure:
        {{
            "id": "ultimate_goal",
            "name": "Ultimate Career Goal",
            "description": "Detailed goal description",
            "children": [
                {{
                    "id": "year_1",
                    "name": "Year 1",
                    "description": "Year 1 focus and objectives",
                    "milestones": [
                        {{
                            "id": "milestone_1_1",
                            "name": "First Milestone Name",
                            "description": "Detailed milestone description",
                            "skills": ["Specific Skill 1", "Specific Skill 2", "Specific Skill 3"],
                            "resources": ["Specific Resource 1", "Specific Resource 2", "Specific Resource 3"],
                            "achievements": ["Specific Achievement 1", "Specific Achievement 2"],
                            "children": [
                                {{
                                    "id": "milestone_1_1_skill_1",
                                    "name": "Specific Skill 1",
                                    "description": "Learn Specific Skill 1"
                                }},
                                {{
                                    "id": "milestone_1_1_skill_2",
                                    "name": "Specific Skill 2",
                                    "description": "Learn Specific Skill 2"
                                }},
                                {{
                                    "id": "milestone_1_1_skill_3",
                                    "name": "Specific Skill 3",
                                    "description": "Learn Specific Skill 3"
                                }}
                            ]
                        }},
                        {{
                            "id": "milestone_1_2",
                            "name": "Second Milestone Name",
                            "description": "Detailed milestone description",
                            "skills": ["Specific Skill 4", "Specific Skill 5", "Specific Skill 6"],
                            "resources": ["Specific Resource 4", "Specific Resource 5", "Specific Resource 6"],
                            "achievements": ["Specific Achievement 3", "Specific Achievement 4"],
                            "children": [
                                {{
                                    "id": "milestone_1_2_skill_1",
                                    "name": "Specific Skill 4",
                                    "description": "Learn Specific Skill 4"
                                }},
                                {{
                                    "id": "milestone_1_2_skill_2",
                                    "name": "Specific Skill 5",
                                    "description": "Learn Specific Skill 5"
                                }},
                                {{
                                    "id": "milestone_1_2_skill_3",
                                    "name": "Specific Skill 6",
                                    "description": "Learn Specific Skill 6"
                                }}
                            ]
                        }}
                    ]
                }}
            ]
        }}

        Create a detailed {years}-year roadmap with at least 2 specific milestones per year. Each milestone should include:
        1. A clear, descriptive name
        2. A detailed description of what the milestone entails
        3. 3-5 specific skills that need to be developed
        4. 3-5 specific resources (courses, books, tools, etc.) to help achieve the milestone
        5. 2-3 specific achievements that indicate completion of the milestone
        6. A "children" array containing leaf nodes for each skill, with each skill node having:
           - A unique ID (format: milestone_id_skill_number)
           - The skill name as the "name" field
           - A simple description like "Learn [Skill Name]"

        The roadmap should be tailored to the user's selected career path, specialization, and timeline. Consider the user's top category and category scores to provide relevant skills and resources.

        Return only the JSON object with no additional text."""

        return prompt 