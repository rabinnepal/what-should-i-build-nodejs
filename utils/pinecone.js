const { Pinecone } = require('@pinecone-database/pinecone');
const { env } = require('../config');

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: env.pinecone.apiKey
});

// Get the index
const getIndex = () => {
  return pinecone.index(env.pinecone.index);
};

// Store vector in Pinecone
const storeVector = async (id, vector, metadata = {}) => {
  try {
    const index = getIndex();
    await index.upsert([{
      id,
      values: vector,
      metadata
    }]);
  } catch (error) {
    console.error('Error storing vector:', error);
    throw new Error('Failed to store vector');
  }
};

// Query similar vectors
const querySimilar = async (vector, topK = 5, filter = {}) => {
  try {
    const index = getIndex();
    const results = await index.query({
      vector,
      topK,
      filter,
      includeMetadata: true
    });

    return results.matches;
  } catch (error) {
    console.error('Error querying vectors:', error);
    throw new Error('Failed to query vectors');
  }
};

module.exports = {
  storeVector,
  querySimilar
}; 