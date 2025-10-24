const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// GET /api/prompts - List all prompts with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, search, favorites, userId } = req.query;

    let where = {
      is_active: true
    };

    // Filter by category
    if (category && category !== 'all') {
      where.category = category;
    }

    // Search filter
    if (search) {
      where.OR = [
        { catchy_name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { prompt_type: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get prompts
    let prompts = await prisma.prompt_library.findMany({
      where,
      orderBy: [
        { usage_count: 'desc' },
        { catchy_name: 'asc' }
      ]
    });

    // If favorites filter is enabled and userId provided
    if (favorites === 'true' && userId) {
      const userFavorites = await prisma.user_prompt_favorites.findMany({
        where: { user_id: userId },
        select: { prompt_id: true }
      });
      
      const favoriteIds = new Set(userFavorites.map(f => f.prompt_id));
      prompts = prompts.filter(p => favoriteIds.has(p.id));
    }

    // Add favorite status if userId provided
    if (userId) {
      const userFavorites = await prisma.user_prompt_favorites.findMany({
        where: { user_id: userId },
        select: { prompt_id: true }
      });
      
      const favoriteIds = new Set(userFavorites.map(f => f.prompt_id));
      prompts = prompts.map(p => ({
        ...p,
        is_favorited: favoriteIds.has(p.id)
      }));
    }

    res.json({
      success: true,
      count: prompts.length,
      prompts
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prompts'
    });
  }
});

// GET /api/prompts/categories - Get all unique categories with counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.prompt_library.groupBy({
      by: ['category'],
      where: { is_active: true },
      _count: {
        id: true
      },
      orderBy: {
        category: 'asc'
      }
    });

    res.json({
      success: true,
      categories: categories.map(c => ({
        name: c.category,
        count: c._count.id
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// GET /api/prompts/:id - Get single prompt by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const prompt = await prisma.prompt_library.findUnique({
      where: { id }
    });

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt not found'
      });
    }

    // Check if favorited
    if (userId) {
      const favorite = await prisma.user_prompt_favorites.findUnique({
        where: {
          user_id_prompt_id: {
            user_id: userId,
            prompt_id: id
          }
        }
      });
      prompt.is_favorited = !!favorite;
    }

    res.json({
      success: true,
      prompt
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prompt'
    });
  }
});

// POST /api/prompts/:id/execute - Execute a prompt with user input
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { userInput, userId } = req.body;

    if (!userInput) {
      return res.status(400).json({
        success: false,
        error: 'User input is required'
      });
    }

    // Get the prompt
    const prompt = await prisma.prompt_library.findUnique({
      where: { id }
    });

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt not found'
      });
    }

    // Execute with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: prompt.refined_instructions
        },
        {
          role: 'user',
          content: userInput
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0].message.content;

    // Increment usage count
    await prisma.prompt_library.update({
      where: { id },
      data: {
        usage_count: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      response,
      prompt: {
        id: prompt.id,
        catchy_name: prompt.catchy_name,
        category: prompt.category
      }
    });
  } catch (error) {
    console.error('Error executing prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute prompt',
      details: error.message
    });
  }
});

// POST /api/prompts/:id/favorite - Toggle favorite status
router.post('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Check if already favorited
    const existing = await prisma.user_prompt_favorites.findUnique({
      where: {
        user_id_prompt_id: {
          user_id: userId,
          prompt_id: id
        }
      }
    });

    if (existing) {
      // Remove favorite
      await prisma.user_prompt_favorites.delete({
        where: {
          user_id_prompt_id: {
            user_id: userId,
            prompt_id: id
          }
        }
      });

      res.json({
        success: true,
        is_favorited: false,
        message: 'Removed from favorites'
      });
    } else {
      // Add favorite
      await prisma.user_prompt_favorites.create({
        data: {
          id: uuidv4(),
          user_id: userId,
          prompt_id: id
        }
      });

      res.json({
        success: true,
        is_favorited: true,
        message: 'Added to favorites'
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle favorite'
    });
  }
});

module.exports = router;

