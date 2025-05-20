
const webDevMock = {
    name: "Web Development",
    level: "medium",
    description: "Learn to build modern web applications using HTML, CSS, JavaScript, and frameworks. Covers front-end, back-end, databases, and deployment.",
    tags: ["web", "development", "javascript", "frontend", "backend"],
    messages: [
        {
          type: "system",
          message: "Hi! I'm your Web Development tutor. Ask me anything about HTML, CSS, JavaScript, front-end and back-end frameworks, or how to build and deploy modern web applications. Let's code together!",
          sequenceNo: 1
        }
      ],
      quizzes: [
        {
          // topic: to be set to the Web Development course _id when inserted into DB
          questions: [
            {
              question: "Which HTML tag is used to create a hyperlink?",
              answer: "<a>",
              options: ["<link>", "<a>", "<href>", "<hyperlink>"],
              hint: "It's a one-letter tag."
            },
            {
              question: "Which language is primarily used for styling web pages?",
              answer: "CSS",
              options: ["HTML", "JavaScript", "CSS", "Python"],
              hint: "It stands for Cascading Style Sheets."
            },
            {
              question: "What does 'API' stand for in web development?",
              answer: "Application Programming Interface",
              options: [
                "Advanced Programming Integration",
                "Application Programming Interface",
                "Automated Page Index",
                "Active Protocol Interface"
              ],
              hint: "It's how different software components communicate."
            }
          ],
          scores: [],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      ],
      assignments: [
        {
          // course: to be set to the Web Development course _id when inserted into DB
          question: "Build a simple personal portfolio website using HTML, CSS, and JavaScript. Include your name, a short bio, and links to your social profiles. Submit the code and a live deployment link.",
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          submissions: [],
          status: "Pending"
        }
      ],
    resources: [
      {
        videoLink: "https://www.youtube.com/embed/erEgovG9WBs",
        transcript: `
  Web development is the best job in the world. You build on a platform with nearly 5 billion daily active users all connected together like the neurons of a global super intelligent brain—a system that can cure disease, eliminate poverty, advance science, and stuff like that. But mostly, it's used to share memes, create parasocial relationships, amplify drama, and most importantly, make tons and tons of money.
  
  If you want to get into it, you're going to need to know some stuff—a lot of stuff. In Web Development 101, we'll take a look at 101 different concepts that you'll need to know when building full stack web apps.
  
  This is the internet: a network of billions of machines connected together. The internet protocol is used to identify different computers on the network by assigning each one a unique IP address. These computers can then send data back and forth with the transmission control protocol, which breaks data into small packets sent through physical components like fiber optic cables and modems before being reassembled by the receiving computer.
  
  The internet is hardware, but the World Wide Web is like software that sits on top of the internet, where people access web pages with the hypertext transfer protocol (HTTP). Every page of content gets a uniform resource locator (URL). Humans use web browsers to access a URL, where it can be rendered visually. The browser is called the client because it's consuming information, but on the other end of that URL is a server, which receives an HTTP request from the client and sends a response containing the web page content—these are HTTP messages.
  
  Every web page has a unique domain name like fireship.io or example.com, registered via a registrar accredited by ICANN. When you navigate to a domain, it gets routed through the domain name system (DNS), mapping names to actual IP addresses. DNS is like the phone book of the internet.
  
  The content you see is represented by HTML. Browsers have devtools to inspect the structure of the HTML. To build your own web page, you'll want a text editor like VS Code. An HTML document is a collection of elements—tags with content in the middle, like paragraphs and headings. There are also elements for user input, such as select and input elements for forms. Elements can have attributes to change their behavior, like input type. The anchor tag (<a>) is a link that allows navigation to a different page.
  
  Elements are nested in a hierarchy to form the Document Object Model (DOM). A web page is split into the head (invisible content like metadata and title) and the body (main content). Tags give browsers and bots hints about the semantic meaning of the page, helping with search engines and accessibility.
  
  The most common element is <div> to define a section. To make a website look cool, you'll need to learn CSS, which allows you to change the appearance of HTML elements. CSS can be inline, in a style tag, or in an external stylesheet. CSS handles layout, positioning, and responsiveness, with tools like flexbox and grid. Media queries help make layouts responsive for different screens.
  
  JavaScript is the third essential language, making the UI interactive. JavaScript code can be in a script tag or an external file. JavaScript is dynamically typed, but many developers use TypeScript for static typing. JavaScript handles events, like clicks and form inputs, and uses data structures like arrays and objects. Prototypal inheritance and classes are both supported.
  
  Modern web development often uses frameworks like React, Vue, Svelte, and Angular to represent the UI as a tree of components, encapsulating HTML, CSS, and JavaScript. On the backend, Node.js is popular for server-side JavaScript, using the same V8 engine as Chromium browsers. Node.js runs code in a single-threaded, non-blocking event loop and uses the node package manager (npm) for modules.
  
  Websites can be rendered server-side, as single-page applications, or as static sites. Full stack frameworks like Next.js, Ruby on Rails, and Laravel handle many tedious tasks. Module bundlers like webpack and Vite package code for browsers. Databases are needed to store user data, with options like MySQL, PostgreSQL, and MongoDB. User authentication and deployment to cloud providers like AWS are also covered.
  
  Web development is vast, but with practice and Google, anyone can learn it. Congratulations, you just passed Web Development 101!
        `
      },
      {
        videoLink: "https://www.youtube.com/embed/ysEN5RaKOlA",
        transcript: `
  If you want to learn web development, where do you even start? It's hard to find the right advice without suffering from information overload. That's why I've created this beginner's roadmap! It lays out all the basics you need to learn web development. We'll go through each step so by the end of this guide you'll have an understanding of the basics of web development and what skills you need to learn.
  
  Start by understanding how websites work, the difference between front-end and back-end, and using a code editor. All websites are just files stored on a server connected to the Internet. You load a website through a browser (the client), which requests data from the server and submits data back.
  
  Web developer roles fall into three categories: front end, back end, and full stack. Front end is what you see in the browser; back end is the logic and functionality you don't see. Think of front-end as the front-of-house in a restaurant, and back-end as the kitchen and behind-the-scenes.
  
  The essential tool is your code editor or IDE—VS Code is the most popular. The front end of a website is made up of HTML, CSS, and JavaScript. HTML is the foundation, containing all the content and using tags for structure. CSS styles the content, adding colors, fonts, layouts, and even animations. JavaScript makes websites interactive, responding to user input and events.
  
  You'll also want to learn about package managers like npm, build tools like gulp and webpack, and version control with git and GitHub. These tools help manage code, dependencies, and automate tasks.
  
  After front-end basics, learn about responsive design (using media queries and flexible layouts), and JavaScript frameworks like React, Angular, or Vue. Each framework has strengths, and your choice may depend on job requirements or personal preference.
  
  Back-end web development involves the server, a server-side language (like PHP, Python, Ruby, C#, Java, or Node.js), and a database. Databases can be SQL (structured) or NoSQL (like MongoDB). Understanding CRUD operations (create, read, update, delete) is key.
  
  You may use serverless architectures or traditional servers, and cloud providers like AWS or Netlify. Version control with git helps manage code changes, and databases store user and application data.
  
  This roadmap helps you get started in web development, and there are many resources available to deepen your knowledge at every stage. The most important thing is to start building, practicing, and learning as you go.
        `
      },
      {
        videoLink: "https://www.youtube.com/embed/5YDVJaItmaY",
        transcript: `
  Here's web development explained in ten minutes. We'll cover six critical areas of web development that together form a complete stack: user interfaces and front-end code, APIs and data transfer, backends, databases, security, hardware/servers, and cloud computing.
  
  Web development has evolved from static web pages (Web 1.0) to dynamic web apps (Web 2.0), and now to AI-driven experiences (Web 3.0). The front end is what the user sees and interacts with, built with HTML, CSS, and JavaScript. HTML provides structure, CSS handles layout and style, and JavaScript adds interactivity.
  
  Browsers request HTML files from servers, which may also send CSS and JavaScript files. JavaScript handles user events and can update the page dynamically. AJAX allows communication with the server without reloading the page. Most front-end developers use frameworks like React or Angular, which require a build step to convert framework code to standard JavaScript.
  
  APIs allow the front end to talk to the back end, commonly using REST conventions (GET, POST, PATCH, DELETE). Data is transferred using formats like JSON or XML. The back end can be written in languages like Python, JavaScript, PHP, or C#. Frameworks simplify back-end development.
  
  Backends may be split into services for scalability. Databases are either SQL (structured, with strict rules) or NoSQL (flexible, object-based). Popular databases include MySQL, PostgreSQL, and MongoDB.
  
  Web security involves authentication (verifying user identity) and authorization (defining user roles). Infrastructure and networking involve data centers, servers, and cloud providers like AWS and DigitalOcean. Cloud computing allows renting server space and running functions on demand.
  
  Modern web development may use back-end as a service, where everything from the database to security is managed by a provider (e.g., Firebase). This allows rapid app development.
  
  Web development is a broad field, but by understanding these core areas, you can start building and deploying web applications. Practice, experiment, and use the many resources available to keep learning and improving.
        `
      }
    ]
  };
  
  module.exports = webDevMock;
  