from groq import Groq
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

# Initialize Groq client
client = Groq(api_key=api_key)

def generate_quiz(topic: str, model="mixtral-8x7b-32768"):
    prompt = f"""
    Generate 5 multiple-choice questions (MCQs) on the topic: "{topic}".
    Each question should have 4 options (a-d), and the correct answer should be clearly marked.
    Format like this:

    Q1. Question text
        a) Option A
        b) Option B
        c) Option C
        d) Option D
        Answer: b
    """

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are an expert quiz maker for educational content."},
            {"role": "user", "content": prompt}
        ]
    )

    print(" Quiz Questions:\n")
    print(response.choices[0].message.content)

if __name__ == "__main__":
    topic = input("Enter a topic for quiz generation: ")
    generate_quiz(topic)
