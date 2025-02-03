from flask import Flask, jsonify
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret')

# Example route
@app.route('/')
def home():
    return jsonify(message="Welcome to BruinStreetMap API")

if __name__ == '__main__':
    app.run(debug=True)
