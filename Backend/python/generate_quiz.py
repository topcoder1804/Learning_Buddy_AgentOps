from groq import Groq
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

# Initialize Groq client
client = Groq(api_key=api_key)

def generate_quiz(topic: str, model="meta-llama/llama-4-maverick-17b-128e-instruct"):
    prompt = f"""
    Create a JSON array of 5 multiple-choice questions (MCQs) on the topic "{topic}".
    Each object should have:
    - "question": The question text
    - "options": An array of 4 options
    - "answer": The correct answer text
    - "hint": A short hint to help solve the question

    Format strictly as valid JSON only. Do not include explanations outside the array.
    """

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "You are an expert quiz generator that returns structured JSON for educational apps."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = response.choices[0].message.content.strip()

    try:
        quiz_data = json.loads(content)
        print("Quiz in structured format:\n")
        print(json.dumps(quiz_data, indent=2))
    except json.JSONDecodeError:
        print("Could not parse JSON. Raw output:")
        print(content)

if __name__ == "__main__":
    topic = input("Enter a topic for quiz generation: ")
    generate_quiz(topic)
