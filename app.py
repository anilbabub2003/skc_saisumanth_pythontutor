#!/usr/bin/env python3
import google.generativeai as genai
from flask import Flask, render_template, request, jsonify, session
import re

app = Flask(__name__)
app.secret_key = "super_secret_key"  # For storing API key and character in session

# Define character styles with generic responses
CHARACTER_STYLES = {
    "robot": "Processing your request... 🤖 Beep boop! Here's your solution: ",
    "wizard": "Ahh, young learner! 🧙‍♂️ Let's uncover the magic of coding: ",
    "cat": "Meow! 🐱 Let's explore the world of tech: ",
    "default": "Hello! 👋 I'm a chatbot. Here's your response: "
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/set_api_key", methods=["POST"])
def set_api_key():
    session["api_key"] = request.json.get("api_key")
    return jsonify({"message": "API key set successfully!"})

@app.route("/set_character", methods=["POST"])
def set_character():
    # Set the selected character in the session
    session["character"] = request.json.get("character")
    return jsonify({"message": f"Character set to {session['character']}!"})

@app.route("/chat", methods=["POST"])
def chat():
    if "api_key" not in session:
        return jsonify({"error": "API key is missing. Set it first."})

    genai.configure(api_key=session["api_key"])
    print(session['api_key'])
    user_message = request.json.get("message")
    character = session.get("character", 'default')  # Get selected character from session
    print(character)
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Apply character-specific response style
        if character in CHARACTER_STYLES:
            response = model.generate_content(f"generate {user_message} as you are your {character}")
        else:
            response = model.generate_content(user_message)
            
        ai_reply = re.sub(r'\*\*', '', response.text)
        return jsonify({"reply": ai_reply})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    #   app.run(debug=True, host="0.0.0.0", port=5000)
    app.run(debug=False)  # Set debug to False in production
