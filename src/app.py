from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import logging
import base64
import os
import requests
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/api/pronounce', methods=['POST'])
def pronounce():
    # Get the word from the request
    data = request.json
    word = data.get('word', '').strip()

    if not word:
        logger.debug("Received empty word for pronunciation.")
        return jsonify({'error': 'Missing or empty word in request'}), 400

    try:
        # Step 1: Translate the word to Spanish if necessary
        translation_prompt = [
            {"role": "system", "content": "You are a translator proficient in Spanish."},
            {"role": "user", "content": f"Translate the word '{word}' to Spanish. If it's already Spanish, return it unchanged."}
        ]
        translation_response = openai.ChatCompletion.create(
            model="gpt-4",  # Updated to use correct model name
            messages=translation_prompt,
            max_tokens=200, 
            temperature=0.7
        )
        translated_word = translation_response.choices[0].message['content'].strip()

        logger.debug(f"Translated word: {translated_word}")

        # Step 2: Generate the Spanish pronunciation using OpenAI TTS
        # Create a temporary file to store the audio
        temp_file = Path("temp_speech.mp3")
        
        # Create the speech using direct API call
        headers = {
            "Authorization": f"Bearer {openai.api_key}",
            "Content-Type": "application/json"
        }
        
        # Add a pause and slow down the speech
        tts_data = {
            "model": "tts-1",
            "voice": "nova",
            "input": f"... {translated_word}",  # Simple pause using dots
            "speed": 0.85  # Slightly slower (0.25 to 4.0, where 1.0 is normal speed)
        }
        
        response = requests.post(
            "https://api.openai.com/v1/audio/speech",
            headers=headers,
            json=tts_data,
            stream=True
        )
        
        if response.status_code != 200:
            raise Exception(f"TTS API error: {response.text}")
            
        # Stream to file
        with open(temp_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    f.write(chunk)
        
        # Read the file and convert to base64
        with open(temp_file, "rb") as audio_file:
            audio_content = base64.b64encode(audio_file.read()).decode('utf-8')
            
        # Clean up the temporary file
        temp_file.unlink()

        logger.debug("Generated audio content successfully.")

        # Return the original word, translation, and audio as a response
        return jsonify({
            "original_word": word,
            "translated_word": translated_word,
            "audio": audio_content
        })
    except Exception as e:
        logger.error(f"Error generating text-to-speech: {str(e)}")
        return jsonify({'error': 'Failed to generate pronunciation', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
