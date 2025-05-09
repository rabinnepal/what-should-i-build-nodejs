const { prisma } = require('../config');
const { generateIdeaEmbedding } = require('../utils/embed');
const { generateProjectDescription } = require('../utils/gemini');
const { storeVector } = require('../utils/pinecone');
const { validationResult } = require('express-validator');

// Create new idea
const createIdea = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description: userDescription, tags } = req.body;

    // Generate AI description if not provided
    let description = userDescription;
    if (!description) {
      description = await generateProjectDescription(title, tags);
    }

    // Generate embedding
    const embedding = await generateIdeaEmbedding(title, description, tags);

    // Create idea
    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        tags,
        authorId: req.user.id,
        embedding
      },
      include: {
        author: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    // Store vector in Pinecone
    await storeVector(idea.id, embedding, {
      title,
      description,
      tags
    });

    res.status(201).json(idea);
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get ideas with pagination and sorting
const getIdeas = async (req, res) => {
  try {
    const { sort = 'date', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orderBy = sort === 'votes' 
      ? { votes: { _count: 'desc' } }
      : { createdAt: 'desc' };

    const ideas = await prisma.idea.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy,
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

    const total = await prisma.idea.count();

    res.json({
      ideas,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single idea
const getIdea = async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await prisma.idea.findUnique({
      where: { id },
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

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.json(idea);
  } catch (error) {
    console.error('Get idea error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vote on idea
const voteIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body;

    if (![-1, 1].includes(vote)) {
      return res.status(400).json({ message: 'Invalid vote value' });
    }

    // Upsert vote
    const voteRecord = await prisma.vote.upsert({
      where: {
        userId_ideaId: {
          userId: req.user.id,
          ideaId: id
        }
      },
      update: {
        value: vote
      },
      create: {
        userId: req.user.id,
        ideaId: id,
        value: vote
      }
    });

    // Get updated vote counts
    const votes = await prisma.vote.groupBy({
      by: ['value'],
      where: { ideaId: id },
      _count: true
    });

    const upvotes = votes.find(v => v.value === 1)?._count || 0;
    const downvotes = votes.find(v => v.value === -1)?._count || 0;

    res.json({
      upvotes,
      downvotes,
      score: upvotes - downvotes
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createIdea,
  getIdeas,
  getIdea,
  voteIdea
}; 