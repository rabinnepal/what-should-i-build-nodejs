const { CohereClient } = require('cohere-ai');
const { env } = require('../config');

// Initialize Cohere client
const cohere = new CohereClient({
  token: env.cohereApiKey
});

// Generate embedding for text
const generateEmbedding = async (text) => {
  try {
    const response = await cohere.embed({
      texts: [text],
      model: 'embed-english-v3.0',
      input_type: 'search_document'
    });

    return response.embeddings[0];
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
};

// Generate embedding for idea
const generateIdeaEmbedding = async (title, description, tags) => {
  const text = `${title} ${description} ${tags.join(' ')}`;
  return generateEmbedding(text);
};

// Generate embeddings for multiple texts
const generateEmbeddings = async (texts) => {
  try {
    const response = await cohere.embed({
      texts,
      model: 'embed-english-v3.0',
      input_type: 'search_document'
    });

    return response.embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
};

module.exports = {
  generateEmbedding,
  generateIdeaEmbedding,
  generateEmbeddings
}; 