// utils/mathMock.js

const mathMock = {
    name: "Mathematics",
    level: "hard",
    description: "Dive into advanced mathematical concepts including trigonometry, calculus, and the fundamental theorem of calculus.",
    tags: ["math", "algebra", "calculus", "trigonometry"],
    messages: [],
    quizzes: [],
    assignments: [],
    resources: [
      {
        videoLink: "https://www.youtube.com/embed/PUB0TaZ7bhA",
        transcript: `
  Have you ever heard of the expression SOHCAHTOA? In this lesson we're going to focus on right triangle trigonometry. Let's say this is the angle theta. There are three sides of this triangle you need to be familiar with: opposite to theta is the opposite side, next to theta is the adjacent side, and across the box or right angle is the hypotenuse, the longest side of the triangle.
  
  Recall the Pythagorean theorem applies to right triangles: a² + b² = c². Now let's talk about the six trig functions in terms of sine, cosine, tangent, opposite, adjacent, hypotenuse. Sine theta, according to SOHCAHTOA, is opposite over hypotenuse. Cosine theta is adjacent over hypotenuse. Tangent theta is opposite over adjacent.
  
  There are also the reciprocal functions: cosecant is 1/sine (hypotenuse/opposite), secant is 1/cosine (hypotenuse/adjacent), and cotangent is 1/tangent (adjacent/opposite).
  
  Let's solve a triangle. Suppose the sides are 3 and 4, and the angle is theta. Find the missing side and the values of all six trigonometric functions. By the Pythagorean theorem, the hypotenuse is 5. So, sine theta = 4/5, cosine theta = 3/5, tangent theta = 4/3, cosecant = 5/4, secant = 5/3, and cotangent = 3/4.
  
  Special right triangles include the 3-4-5, 5-12-13, 8-15-17, and 7-24-25 triangles. Multiples of these numbers also work.
  
  Let's try another problem: a triangle with sides 8 and 17. The missing side is 15. Sine theta = 15/17, cosine theta = 8/17, tangent theta = 15/8, and their reciprocals are cosecant = 17/15, secant = 17/8, cotangent = 8/15.
  
  You can use SOHCAHTOA to find missing sides and angles, and to solve real-world problems involving right triangles. The video also covers how to use calculators for trigonometric functions and how to find angles using inverse trig functions.
  
  Trigonometry is essential for understanding angles, the unit circle, graphing trig functions, and solving problems involving real-world applications like elevation, depression, and navigation. The course also covers verifying trig identities, sum and difference formulas, double angle, half angle, and power reducing formulas, as well as solving trig equations and using the law of sines and cosines.
  
  Trigonometry is a foundational topic in mathematics, connecting geometry and algebra, and is widely used in science, engineering, and everyday problem-solving.
        `
      },
      {
        videoLink: "https://www.youtube.com/embed/1bH_ukYn81c",
        transcript: `
  Let us talk about calculus. You all are familiar with the equation of a line, y = x, where at every point on the line, the value of y depends on x. For example, if x = 2, then y = 2. This relationship is easy to visualize because it's a straight line—constant and predictable.
  
  Now imagine you're a curious thinker in the 1600s, when the world was just beginning to explore the motion of planets and how things move and change over time. Straight lines didn't cut it anymore. Things in nature didn't always behave predictably or move in straight lines. Think of a ball rolling down a hill or water flowing into a basin. How do we describe such motion mathematically?
  
  A straight line has a constant slope, which tells us how fast y is changing compared to x. But what about curves, like y = x²? The slope isn't constant anymore. This was a huge problem in the 1600s. Newton and Leibniz realized that to find the slope of a curve at a specific point, you could look at two points getting closer and closer together, leading to the concept of the derivative.
  
  For example, for y = x², the derivative is 2x. This simple idea of zooming in on a curve and finding its slope transformed how we understand and solve problems in the world around us. Derivatives became a universal language for describing change, used in measuring speed, predicting stock prices, tracking heart rate changes, weather forecasting, studying population growth, and calculating marginal costs in economics.
  
  The video also explains how to generalize this process for any function using limits and how mathematicians have already calculated derivatives for many famous functions.
  
  Calculus is a powerful tool that helps us understand and model change in the world, from physics and biology to economics and engineering.
        `
      },
      {
        videoLink: "https://www.youtube.com/embed/rfG8ce4nNh0",
        transcript: `
  This video discusses integrals and the fundamental theorem of calculus. Imagine you're sitting in a car and you can only see the speedometer. The car starts moving, speeds up, then slows to a stop over 8 seconds. Can you figure out how far you've traveled just by looking at the speedometer?
  
  If velocity is constant, you multiply velocity by time to get distance. But if velocity changes, you approximate the motion as constant over small intervals and sum the distances. This approximation improves as the intervals get smaller, leading to the concept of the integral.
  
  The area under the velocity-time graph represents the distance traveled. The sum of the areas of thin rectangles (velocity × time interval) approaches the exact area as the intervals shrink, which is the integral.
  
  The integral is the inverse of the derivative. If you know the velocity function v(t), the distance function s(t) is the antiderivative of v(t). The fundamental theorem of calculus states that the integral of a function over an interval is the difference between the values of its antiderivative at the endpoints.
  
  Integrals are a powerful tool for solving problems involving accumulation, such as finding areas, distances, and total quantities. The video also discusses negative areas (when velocity is negative) and how integrals measure signed areas.
  
  The fundamental theorem of calculus connects the process of differentiation and integration, showing that they are inverse operations. This insight is central to much of mathematics, physics, and engineering.
        `
      }
    ]
  };
  
  module.exports = mathMock;
  