const { GoogleGenerativeAI } = require('@google/generative-ai');
const { env } = require('../config');

// Initialize Gemini client if API key is available
let gemini = null;
if (env.geminiApiKey) {
  gemini = new GoogleGenerativeAI(env.geminiApiKey);
}

// Generate creative project description
const generateProjectDescription = async (title, tags) => {
  if (!gemini) {
    return null;
  }

  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate a creative and engaging description for a project with the following details:
Title: ${title}
Tags: ${tags.join(', ')}

The description should be concise (2-3 sentences) and highlight the key features and benefits of the project.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating description:', error);
    return null;
  }
};

// Generate project ideas based on quiz answers
const generateProjectIdeas = async (answers, filters) => {
  if (!gemini) {
    return null;
  }

  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Based on the following quiz answers and filters, suggest 3 creative project ideas:

Quiz Answers:
${Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join('\n')}

Filters:
${Object.entries(filters).map(([key, value]) => `${key}: ${value}`).join('\n')}

For each idea, provide:
1. A catchy title
2. A brief description
3. Relevant tags

Format the response as JSON with an array of ideas, each containing title, description, and tags.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error generating project ideas:', error);
    return null;
  }
};

module.exports = {
  generateProjectDescription,
  generateProjectIdeas
}; 