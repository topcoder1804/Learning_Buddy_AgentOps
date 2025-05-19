from groq import Groq
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

# Initialize Groq client
client = Groq(api_key=api_key)

def generate_assignment(topic: str, model="meta-llama/llama-4-maverick-17b-128e-instruct"):
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

    print("📝 Assignment Questions:\n")
    print(response.choices[0].message.content)

if __name__ == "__main__":
    topic = input("Enter a topic for assignment generation: ")
    generate_assignment(topic)
