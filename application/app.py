from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "application": "Session 21 Final DevOps Project",
        "status": "running"
    })

@app.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200

@app.route("/config")
def config():
    return jsonify({
        "environment": os.getenv("APP_ENV", "development")
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
