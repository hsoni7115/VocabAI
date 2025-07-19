# from flask import Flask, request, jsonify, render_template
# from flask_cors import CORS
# import requests
# import openai
# import os
# from dotenv import load_dotenv
# import json
# import logging

# # Load environment variables
# load_dotenv()

# app = Flask(__name__)
# CORS(app)

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # API Keys (set these in your .env file)
# OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
# print("OPENAI_API_KEY Loaded:", OPENAI_API_KEY is not None)

# # Configure OpenAI
# if OPENAI_API_KEY:
#     openai.api_key = OPENAI_API_KEY

# class VocabularyService:
#     def __init__(self):
#         self.free_dict_base_url = "https://api.dictionaryapi.dev/api/v2/entries/en"
    
#     def get_word_definition(self, word):
#         """Get word definition from Free Dictionary API"""
#         try:
#             url = f"{self.free_dict_base_url}/{word}"
#             response = requests.get(url, timeout=10)
            
#             if response.status_code == 200:
#                 data = response.json()
#                 if data and len(data) > 0:
#                     entry = data[0]
                    
#                     # Extract definitions from all meanings
#                     definitions = []
#                     part_of_speech = ""
#                     synonyms = set()
#                     antonyms = set()
                    
#                     for meaning in entry.get('meanings', []):
#                         if not part_of_speech:
#                             part_of_speech = meaning.get('partOfSpeech', '')
                        
#                         synonyms.update(meaning.get('synonyms', []))
#                         antonyms.update(meaning.get('antonyms', []))

#                         # ✅ Still check definitions-level synonyms/antonyms too
#                         for definition in meaning.get('definitions', []):
#                             if definition.get('definition'):
#                                 definitions.append(definition['definition'])

#                             synonyms.update(definition.get('synonyms', []))
#                             antonyms.update(definition.get('antonyms', []))

                    
#                     # Extract pronunciation
#                     pronunciation = ""
#                     phonetics = entry.get('phonetics', [])
#                     for phonetic in phonetics:
#                         if phonetic.get('text'):
#                             pronunciation = phonetic['text']
#                             break
                    
#                     return {
#                         'word': word,
#                         'definitions': definitions[:3],  # Limit to 3 definitions
#                         'pronunciation': pronunciation,
#                         'part_of_speech': part_of_speech,
#                         'synonyms': list(synonyms)[:8],
#                         'antonyms': list(antonyms)[:8],
#                         'found': True
#                     }
            
#             return {'word': word, 'found': False, 'error': 'Word not found'}
            
#         except Exception as e:
#             logger.error(f"Error fetching word definition: {str(e)}")
#             return {'word': word, 'found': False, 'error': 'Service temporarily unavailable'}
    
#     def generate_context_examples(self, word, context="general", definition=""):
#         """Generate context-aware examples using GPT-4 or fallback examples"""
#         try:
#             if not OPENAI_API_KEY:
#                 # Fallback to predefined examples
#                 return self.get_fallback_examples(word)
            
#             context_prompt = f" in the context of {context}" if context and context != "general" else ""
#             definition_info = f" (Definition: {definition})" if definition else ""
            
#             prompt = f"""
#             Generate 3 diverse, context-aware example sentences for the word "{word}"{context_prompt}{definition_info}.
            
#             Requirements:
#             - Each sentence should clearly demonstrate the word's meaning
#             - Use different contexts (formal, casual, professional, etc.)
#             - Make sentences engaging and memorable
#             - Keep sentences concise (10-20 words)
            
#             Return only a JSON array of 3 strings, nothing else.
#             """
            
#             response = openai.ChatCompletion.create(
#                 model="gpt-3.5-turbo",
#                 messages=[{"role": "user", "content": prompt}],
#                 max_tokens=200,
#                 temperature=0.7
#             )
            
#             examples_text = response.choices[0].message.content.strip()
#             print("RAW GPT RESPONSE:", examples_text)
#             examples = json.loads(examples_text)
            
#             return {
#                 'word': word,
#                 'examples': examples,
#                 'context': context,
#                 'success': True
#             }
            
#         except Exception as e:
#             logger.error(f"Error generating examples: {str(e)}")
#             return self.get_fallback_examples(word)
    
#     def get_fallback_examples(self, word):
#         """Provide fallback examples when GPT-4 is unavailable"""
#         fallback_examples = {
#             'ubiquitous': [
#                 "Smartphones have become ubiquitous in modern society.",
#                 "The ubiquitous presence of cameras makes privacy a concern.",
#                 "Coffee shops are ubiquitous in urban areas."
#             ],
#             'serendipity': [
#                 "Finding that book was pure serendipity.",
#                 "Their meeting was a moment of serendipity.",
#                 "Scientific discoveries often involve serendipity."
#             ],
#             'ephemeral': [
#                 "The beauty of cherry blossoms is ephemeral.",
#                 "Social media trends are often ephemeral.",
#                 "Morning mist creates an ephemeral landscape."
#             ]
#         }
        
#         examples = fallback_examples.get(word.lower(), [
#             f"The word '{word}' can be used in various contexts.",
#             f"Understanding '{word}' improves your vocabulary.",
#             f"Practice using '{word}' in your daily conversations."
#         ])
        
#         return {
#             'word': word,
#             'examples': examples,
#             'context': 'general',
#             'success': True,
#             'fallback': True
#         }

# # Initialize service
# vocab_service = VocabularyService()

# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/api/word/<word>')
# def get_word_info(word):
#     """Get complete word information"""
#     if not word or len(word.strip()) == 0:
#         return jsonify({'error': 'Word parameter is required'}), 400
    
#     word = word.strip().lower()
#     word_info = vocab_service.get_word_definition(word)
    
#     if word_info['found']:
#         return jsonify(word_info)
#     else:
#         return jsonify(word_info), 404

# @app.route('/api/examples', methods=['POST'])
# def generate_examples():
#     """Generate context-aware examples"""
#     data = request.get_json()
    
#     if not data or 'word' not in data:
#         return jsonify({'error': 'Word is required'}), 400
    
#     word = data['word'].strip()
#     context = data.get('context', 'general')
#     definition = data.get('definition', '')
    
#     examples = vocab_service.generate_context_examples(word, context, definition)
#     return jsonify(examples)

# @app.route('/api/health')
# def health_check():
#     """Health check endpoint"""
#     return jsonify({
#         'status': 'healthy',
#         'openai_configured': bool(OPENAI_API_KEY),
#         'version': '1.0.0'
#     })

# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', port=5000)
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import json
import logging
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VocabularyService:
    def __init__(self):
        self.free_dict_base_url = "https://api.dictionaryapi.dev/api/v2/entries/en"
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel("models/gemini-1.5-flash")

    def get_word_definition(self, word):
        """Get word definition from Free Dictionary API"""
        try:
            url = f"{self.free_dict_base_url}/{word}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    entry = data[0]
                    definitions = []
                    parts_of_speech = set()
                    synonyms = set()
                    antonyms = set()
                    
                    for meaning in entry.get('meanings', []):
                        # if not part_of_speech:
                        #     part_of_speech = meaning.get('partOfSpeech', '')
                        if meaning.get('partOfSpeech'):
                            parts_of_speech.add(meaning['partOfSpeech'])
                        synonyms.update(meaning.get('synonyms', []))
                        antonyms.update(meaning.get('antonyms', []))

                        for definition in meaning.get('definitions', []):
                            if definition.get('definition'):
                                definitions.append(definition['definition'])
                            synonyms.update(definition.get('synonyms', []))
                            antonyms.update(definition.get('antonyms', []))
                    
                    pronunciation = ""
                    phonetics = entry.get('phonetics', [])
                    for phonetic in phonetics:
                        if phonetic.get('text'):
                            pronunciation = phonetic['text']
                            break
                    
                    return {
                        'word': word,
                        'definitions': definitions[:3],
                        'pronunciation': pronunciation,
                        'part_of_speech': list(parts_of_speech),
                        'synonyms': list(synonyms)[:8],
                        'antonyms': list(antonyms)[:8],
                        'found': True
                    }
            
            return {'word': word, 'found': False, 'error': 'Word not found'}
            
        except Exception as e:
            logger.error(f"Error fetching word definition: {str(e)}")
            return {'word': word, 'found': False, 'error': 'Service temporarily unavailable'}


    def generate_context_examples(self, word, context="general", definition=""):
        try:
            context_prompt = f"in the context of {context}" if context != "general" else ""
            definition_note = f"(Definition: {definition})" if definition else ""

            prompt = f"""
            Generate 3 short, distinct, clear example sentences using the word '{word}' {context_prompt} {definition_note}.
            Return only a JSON array of 3 strings.
            """

            response = self.gemini_model.generate_content(prompt)
            text = response.text.strip()
            text = text.strip('```json').strip('```').strip()

            return {
                "word": word,
                "examples": json.loads(text),
                "context": context,
                "success": True
            }

        except Exception as e:
            print(f"Gemini error: {e}")
            return {
                "word": word,
                "examples": [
                    f"The word '{word}' can be used in various contexts.",
                    f"Understanding '{word}' improves your vocabulary.",
                    f"Practice using '{word}' in your daily conversations."
                ],
                "context": context,
                "success": False
            }
   

    def get_fallback_examples(self, word):
        fallback_examples = {
            'ubiquitous': [
                "Smartphones have become ubiquitous in modern society.",
                "The ubiquitous presence of cameras makes privacy a concern.",
                "Coffee shops are ubiquitous in urban areas."
            ],
            'serendipity': [
                "Finding that book was pure serendipity.",
                "Their meeting was a moment of serendipity.",
                "Scientific discoveries often involve serendipity."
            ],
            'ephemeral': [
                "The beauty of cherry blossoms is ephemeral.",
                "Social media trends are often ephemeral.",
                "Morning mist creates an ephemeral landscape."
            ]
        }

        examples = fallback_examples.get(word.lower(), [
            f"The word '{word}' can be used in various contexts.",
            f"Understanding '{word}' improves your vocabulary.",
            f"Practice using '{word}' in your daily conversations."
        ])

        return {
            'word': word,
            'examples': examples,
            'context': 'general',
            'success': True,
            'fallback': True
        }

# Initialize service
vocab_service = VocabularyService()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/word/<word>')
def get_word_info(word):
    if not word or len(word.strip()) == 0:
        return jsonify({'error': 'Word parameter is required'}), 400

    word = word.strip().lower()
    word_info = vocab_service.get_word_definition(word)

    if word_info['found']:
        return jsonify(word_info)
    else:
        return jsonify(word_info), 404

@app.route('/api/examples', methods=['POST'])
def generate_examples():
    data = request.get_json()

    if not data or 'word' not in data:
        return jsonify({'error': 'Word is required'}), 400

    word = data['word'].strip()
    context = data.get('context', 'general')
    definition = data.get('definition', '')

    examples = vocab_service.generate_context_examples(word, context, definition)
    return jsonify(examples)

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'gemini_configured': bool(vocab_service.gemini_key),
        'version': '2.0.0'
    })

# if __name__ == '__main__':
#     app.run(debug=False, host='0.0.0.0', port=5000)
