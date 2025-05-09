const { prisma } = require('../config');
const { generateEmbedding } = require('../utils/embed');
const { generateProjectIdeas } = require('../utils/gemini');
const { querySimilar } = require('../utils/pinecone');
const { validationResult } = require('express-validator');

// Submit quiz response and get suggestions
const submitQuiz = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { answers, filters } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ errors: [{ msg: 'Invalid answers format' }] });
    }

    // Generate embedding from answers
    const answersText = Object.values(answers).flat().join(' ');
    const embedding = await generateEmbedding(answersText);

    // Store quiz response if user is logged in
    if (req.user) {
      await prisma.quizResponse.create({
        data: {
          answers,
          filters,
          userId: req.user.id
        }
      });
    }

    // Generate new ideas using Gemini
    const generatedIdeas = await generateProjectIdeas(answers, filters);

    // Query similar ideas from Pinecone
    const similarIdeas = await querySimilar(embedding, 5, filters);

    // Get full idea details from database
    const ideaIds = similarIdeas.map(match => match.id);
    const ideas = await prisma.idea.findMany({
      where: {
        id: {
          in: ideaIds
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        },
        votes: true
      }
    });

    // Sort ideas by similarity score
    const sortedIdeas = ideaIds.map(id => 
      ideas.find(idea => idea.id === id)
    ).filter(Boolean);

    res.json({
      ideas: sortedIdeas,
      generatedIdeas,
      similarity: similarIdeas.map(match => ({
        id: match.id,
        score: match.score
      }))
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitQuiz
}; 