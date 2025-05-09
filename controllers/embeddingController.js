const { generateEmbedding } = require('../utils/embed');
const { querySimilar } = require('../utils/pinecone');

// Search ideas by vector similarity
const searchByVector = async (req, res) => {
  try {
    const { answersVector, filters } = req.body;

    if (!Array.isArray(answersVector) || !answersVector.every(num => typeof num === 'number')) {
      return res.status(400).json({ message: 'Invalid vector format' });
    }

    // Query similar ideas from Pinecone
    const similarIdeas = await querySimilar(answersVector, 5, filters);

    res.json({
      matches: similarIdeas.map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata
      }))
    });
  } catch (error) {
    console.error('Vector search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  searchByVector
}; 