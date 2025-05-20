// utils/aiMock.js

const aiMock = {
    name: "Artificial Intelligence",
    level: "hard",
    description: "Understand AI concepts, machine learning, neural networks, and the rise of generative models.",
    tags: ["AI", "machine learning", "neural networks", "generative AI"],
    messages: [
        {
          type: "system",
          message: "Hello! I'm your AI tutor. Ask me anything about artificial intelligence, machine learning, neural networks, or how AI is changing the world. I'm here to help you understand the future of technology!",
          sequenceNo: 1
        }
      ],
      quizzes: [
        {
          // topic: to be set to the AI course _id when inserted into DB
          questions: [
            {
              question: "Which of the following is a subset of machine learning that uses multi-layer neural networks?",
              answer: "Deep learning",
              options: ["Supervised learning", "Unsupervised learning", "Deep learning", "Reinforcement learning"],
              hint: "It's responsible for recent advances in image and language AI."
            },
            {
              question: "Who is considered the father of artificial intelligence?",
              answer: "Alan Turing",
              options: ["Isaac Newton", "Alan Turing", "Albert Einstein", "Ada Lovelace"],
              hint: "He proposed the famous 'imitation game' test."
            },
            {
              question: "What is the main goal of supervised learning?",
              answer: "To learn a mapping from inputs to outputs using labeled data",
              options: [
                "To find patterns in unlabeled data",
                "To learn a mapping from inputs to outputs using labeled data",
                "To maximize a cumulative reward",
                "To generate new data samples"
              ],
              hint: "It requires labeled training examples."
            }
          ],
          scores: [],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      ],
      assignments: [
        {
          // course: to be set to the AI course _id when inserted into DB
          question: "Write a 300-word essay explaining the difference between supervised, unsupervised, and reinforcement learning, and give a real-world example of each.",
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          submissions: [],
          status: "Pending"
        }
      ],
    resources: [
      {
        videoLink: "https://www.youtube.com/embed/D2JY38VShxI",
        transcript: `
  My name's Mike Wooldridge. I'm a professor of artificial intelligence at the University of Oxford and director of AI at the Alan Turing Institute in London. I've been an AI researcher for more than 30 years, and I'm this year's Royal Institution Christmas lecturer, which will be on artificial intelligence.
  
  The question, "What is artificial intelligence?" is phenomenally difficult. Nobody owns AI; it's a broad field with many ideas about what it is and what it should be. For some, AI is the Hollywood dream: machines as capable as or better than humans, sometimes called general artificial intelligence. For others, like me, AI is about building tools—computers that can do very specific tasks better than humans, like diagnosing abnormalities on a heart scan or spotting tumors on an X-ray. Most work in AI is around these specific problems.
  
  We've seen genuine breakthroughs in AI in the last few years, especially around 2020, before ChatGPT. AI systems released then were markedly better than before, and that really got researchers' attention. We realized we were in a different league. ChatGPT made everyone notice, but the shift started earlier. Now, general-purpose AI technologies are reaching the mass market, and that's new. The adoption is much faster than past technologies like the web or smartphones.
  
  AI is being embedded in everything—word processors, browsers, and more. Soon, you'll be able to select a paragraph in a Word document and have AI summarize it, rewrite it for different audiences, or improve its clarity. People won't even realize that's AI.
  
  This generation will find ways to use AI that we can't even imagine. They'll create new businesses, services, and applications in work and leisure. AI will make people more productive and take away drudgery, freeing them for tasks that require human intelligence and emotional insight. But for every beneficial use, there are ways it can be abused or misused. It's important to understand these risks and use the technology with open eyes, especially regarding data privacy.
  
  AI is changing science. Experimental sciences are exploring what they can do with AI, especially with vast amounts of data. AI helps analyze data, spot patterns, and form hypotheses. Some scientists worry about machines forming hypotheses instead of humans, but everyone is looking to see what AI can do.
  
  AI is transforming fields like astronomy, where neural networks can classify galaxies from images. Rather than writing explicit programs, you show examples, and the system learns. This is machine learning and neural networks in action.
  
  What's exciting is that tools that seemed distant at the start of my career—like conversing with computers in ordinary language—are now real. Large language models have turned philosophical questions about AI into practical ones. We're reinventing AI as a field to explore what these models can and can't do, and that's enormously exciting.
        `
      },
      {
        videoLink: "https://www.youtube.com/embed/2IK3DFHRFfw",
        transcript: `
  Ever since computers were invented, they've been glorified calculators, executing instructions given by programmers. But now, computers are gaining the ability to learn, think, and communicate like humans. They can do creative, intellectual work that previously only humans could do. This is generative AI, which you may have encountered in products like GPT.
  
  Intelligence is now available as a service—a giant brain in the sky anyone can talk to. It's not perfect, but it's surprisingly capable and improving exponentially. This will affect every person and company, positively or negatively.
  
  Generative AI is AI that generates new, original content, not just classifying or finding existing content. Large language models (LLMs) like GPT communicate in human language. ChatGPT is an advanced chatbot using the Transformer architecture, making it fluent and accessible to everyone.
  
  LLMs are neural networks—numbers connected like neurons in the brain. Content, like text or images, is represented as numbers, processed, and converted back to text. The model predicts the next word, sentence, or even paragraph, continuing indefinitely as you prompt it.
  
  These models are trained on massive amounts of text from the internet, learning patterns through "guess the next word" games. Human feedback is used to reinforce good behavior and discourage harmful responses. Once trained, the model is mostly frozen, with some fine-tuning possible.
  
  There are many generative AI models, varying in speed, capability, and cost. Some run locally, some are online, some are open source, some commercial. They generate text, images, audio, and even video. Multimodal AI products combine these capabilities.
  
  Prompt engineering—communicating effectively with AI—is now a crucial skill. The more you interact with AI, the more you discover surprising and powerful ways it can help. AI's biggest limitation is your imagination and your ability to prompt it well.
  
  Generative AI is a tool that can make you, your team, and your company incredibly productive. The best way to thrive is to experiment, practice prompt engineering, and integrate AI into your daily life. The combination of human plus AI is where the magic happens.
        `
      },
      {
        videoLink: "https://www.youtube.com/embed/qYNweeDHiyU",
        transcript: `
  Everybody's talking about artificial intelligence (AI) these days. Machine learning is another hot topic—are they the same? And what about deep learning? AI is about simulating with computers something that matches or exceeds human intelligence: the ability to learn, infer, and reason.
  
  AI started as a research project decades ago, with early technologies like expert systems, which used programming languages like Lisp and Prolog. These systems became popular in the 1980s and '90s. Then came machine learning—where the machine learns from data rather than being explicitly programmed. Machine learning algorithms are good at finding patterns, making predictions, and spotting outliers, which is useful in fields like cybersecurity.
  
  Deep learning is a subset of machine learning using neural networks—computer simulations of the human brain with multiple layers. Deep learning can be unpredictable and hard to interpret, but it's a major advancement and underlies much of modern AI.
  
  The most recent advancements are in generative AI, powered by foundation models like large language models. These models predict not just the next word, but the next sentence, paragraph, or document, generating new content. Some argue generative AI just recombines existing information, but like music, new content is created from existing elements.
  
  Generative AI includes audio, video, and text models, enabling technologies like chatbots and deepfakes. These models can summarize content, create bite-sized information, and generate new material. Adoption of AI has accelerated rapidly, with foundation models changing the curve.
  
  Understanding where AI fits in and how to benefit from it is crucial. AI is now everywhere, and it's important to reap its benefits while being mindful of its limitations and the potential for misuse.
        `
      }
    ]
  };
  
  module.exports = aiMock;
  