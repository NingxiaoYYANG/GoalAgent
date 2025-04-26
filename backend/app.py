from flask import Flask, jsonify, request
from flask_cors import CORS
from ai_service import AIService
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Enable CORS with specific configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],  # Frontend URL
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize AI service
ai_service = AIService()

# Data structure to store user selections
user_selections = {
    'questionnaire': {
        'answers': {},  # {question_id: score}
        'category_scores': {},  # {category: score}
        'top_category': None
    },
    'category_selection': {
        'selected_category': None
    },
    'career_selection': {
        'career_path': None,
        'specialization': None
    },
    'input': {
        'timeline': None,
        'skills': []
    }
}

def validate_user_data(data):
    """
    Validate the structure of incoming user data
    """
    required_fields = {
        'questionnaire': ['answers', 'category_scores', 'top_category'],
        'category_selection': ['selected_category'],
        'career_selection': ['career_path', 'specialization'],
        'input': ['timeline', 'skills']
    }
    
    if not isinstance(data, dict):
        return False, "Data must be a JSON object"
        
    for section, fields in required_fields.items():
        if section not in data:
            return False, f"Missing section: {section}"
        if not isinstance(data[section], dict):
            return False, f"Section {section} must be an object"
        for field in fields:
            if field not in data[section]:
                return False, f"Missing field: {field} in section {section}"
                
    return True, "Valid"

# Basic health check route
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/generate', methods=['POST', 'OPTIONS'])
def generate_career_path():
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        return response

    try:
        logger.info("Received request to /generate")
        user_data = request.json
        logger.info(f"User data: {user_data}")
        
        career_plan = ai_service.generate_career_path(user_data)
        logger.info("Successfully generated career plan")
        
        response = jsonify(career_plan)
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response
    except Exception as e:
        logger.error(f"Error in generate_career_path: {str(e)}")
        error_response = jsonify({'error': str(e)})
        error_response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return error_response, 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)