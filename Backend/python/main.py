from utils import generate_quiz, generate_assignment
import json

def main():
    topic = input("Enter the topic: ").strip()
    choice = input("Generate (1) Quiz or (2) Assignment? Enter 1 or 2: ").strip()

    if choice == "1":
        quiz = generate_quiz(topic)
        if quiz:
            print("📚 Quiz Questions:\n")
            print(json.dumps(quiz, indent=2))
    elif choice == "2":
        assignment = generate_assignment(topic)
        print("📝 Assignment Questions:\n")
        print(assignment)
    else:
        print("❗ Invalid option. Please choose 1 or 2.")

if __name__ == "__main__":
    main()
