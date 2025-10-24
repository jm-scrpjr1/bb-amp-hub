const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to clean up excessive markdown formatting and convert tables to HTML
function cleanMarkdownResponse(text) {
  if (!text) return text;

  let cleaned = text
    // Convert all markdown headers (####, ###, ##, #) to bold text without the hashes
    .replace(/^#{1,6}\s+(.+)$/gm, '**$1**')
    // Remove excessive asterisks (more than 2)
    .replace(/\*{3,}/g, '**');

  // Convert markdown tables to HTML tables for proper rendering
  cleaned = convertMarkdownTablesToHTML(cleaned);

  return cleaned;
}

// Function to convert markdown tables to HTML tables
function convertMarkdownTablesToHTML(text) {
  if (!text) return text;

  // Regex to match markdown tables
  const tableRegex = /(\|.+\|[\r\n]+\|[-:\s|]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/g;

  return text.replace(tableRegex, (match) => {
    const lines = match.trim().split(/[\r\n]+/);

    if (lines.length < 3) return match; // Not a valid table

    // Extract header row
    const headerRow = lines[0].split('|').map(cell => cell.trim()).filter(cell => cell);

    // Skip separator row (lines[1])

    // Extract data rows
    const dataRows = lines.slice(2).map(line =>
      line.split('|').map(cell => cell.trim()).filter(cell => cell)
    );

    // Build HTML table
    let html = '<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">\n';

    // Header
    html += '  <thead>\n    <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">\n';
    headerRow.forEach(cell => {
      html += `      <th style="padding: 12px; text-align: left; font-weight: 600; border: 1px solid #e5e7eb;">${cell}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';

    // Body
    html += '  <tbody>\n';
    dataRows.forEach((row, idx) => {
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
      html += `    <tr style="background-color: ${bgColor};">\n`;
      row.forEach(cell => {
        html += `      <td style="padding: 12px; border: 1px solid #e5e7eb;">${cell}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n';
    html += '</table>';

    return html;
  });
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, DOCX, DOC, TXT, CSV, XLS, XLSX, JPG, PNG, GIF'));
    }
  }
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

// POST /api/prompts/:id/execute - Execute a prompt with user input and optional file
router.post('/:id/execute', upload.single('file'), async (req, res) => {
  let uploadedFilePath = null;

  try {
    const { id } = req.params;
    const { userInput, userId } = req.body;
    const file = req.file;

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

    let fileContent = '';

    // If file is uploaded, read its content
    if (file) {
      uploadedFilePath = file.path;

      try {
        // Read file content based on type
        if (file.mimetype === 'text/plain' || file.mimetype === 'text/csv') {
          fileContent = await fs.readFile(file.path, 'utf-8');
        } else if (file.mimetype.includes('image')) {
          // For images, we'll use vision API
          const imageBuffer = await fs.readFile(file.path);
          const base64Image = imageBuffer.toString('base64');

          // Use GPT-4 Vision for image analysis
          const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const systemPrompt = `${prompt.refined_instructions}\n\nIMPORTANT: Today's date is ${currentDate}. Always use current dates (2025 and beyond) in your responses. Never use outdated dates like 2023 or 2024 unless specifically referencing historical events.`;

          const visionCompletion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: userInput },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${file.mimetype};base64,${base64Image}`
                    }
                  }
                ]
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          });

          // Clean up the response to remove excessive markdown
          const rawResponse = visionCompletion.choices[0].message.content;
          const response = cleanMarkdownResponse(rawResponse);

          // Increment usage count
          await prisma.prompt_library.update({
            where: { id },
            data: { usage_count: { increment: 1 } }
          });

          // Clean up uploaded file
          await fs.unlink(file.path);

          return res.json({
            success: true,
            response,
            prompt: {
              id: prompt.id,
              catchy_name: prompt.catchy_name,
              category: prompt.category
            }
          });
        } else {
          // For other file types, just mention the file was uploaded
          fileContent = `\n\n[File uploaded: ${file.originalname} (${file.mimetype})]`;
        }
      } catch (fileError) {
        console.error('Error reading file:', fileError);
        fileContent = `\n\n[File uploaded but could not be read: ${file.originalname}]`;
      }
    }

    // Combine user input with file content
    const fullUserInput = fileContent ? `${userInput}\n\nFile Content:\n${fileContent}` : userInput;

    // Add current date context to system prompt
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const systemPrompt = `${prompt.refined_instructions}\n\nIMPORTANT: Today's date is ${currentDate}. Always use current dates (2025 and beyond) in your responses. Never use outdated dates like 2023 or 2024 unless specifically referencing historical events.`;

    // Execute with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: fullUserInput
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Clean up the response to remove excessive markdown
    const rawResponse = completion.choices[0].message.content;
    const response = cleanMarkdownResponse(rawResponse);

    // Increment usage count
    await prisma.prompt_library.update({
      where: { id },
      data: {
        usage_count: {
          increment: 1
        }
      }
    });

    // Clean up uploaded file if exists
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

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

    // Clean up uploaded file on error
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
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

