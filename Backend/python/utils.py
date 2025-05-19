from groq import Groq
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

# Initialize Groq client
client = Groq(api_key=api_key)


def generate_quiz(topic: str, model="mixtral-8x7b-32768") -> list:
    """
    Generate a list of 5 multiple-choice questions on the given topic.
    """
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
            {"role": "system", "content": "You are an expert quiz generator that returns structured JSON for educational apps."},
            {"role": "user", "content": prompt}
        ]
    )

    content = response.choices[0].message.content.strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        print("Could not parse JSON. Raw output:")
        print(content)
        return []


def generate_assignment(topic: str, model="mixtral-8x7b-32768") -> str:
    """
    Generate 5 descriptive assignment-style questions on the given topic.
    """
    prompt = f"""
    Generate 5 descriptive assignment-style questions on the topic: "{topic}".
    The questions should encourage critical thinking and explanation.
    """

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are an educational assistant creating assignment questions."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content.strip()
