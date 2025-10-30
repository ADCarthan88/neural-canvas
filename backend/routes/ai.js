const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const AIService = require('../ai/AIService');
const Canvas = require('../models/Canvas');

const router = express.Router();
const aiService = new AIService();

// Generate AI image
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { canvasId, prompt, style, model } = req.body;
    
    // Validate canvas access
    const canvas = await Canvas.findById(canvasId);
    if (!canvas || canvas.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await aiService.generateImage({
      userId: req.user.id,
      canvasId,
      prompt,
      style,
      model
    });

    res.json({
      success: true,
      generationId: result.generationId,
      imageUrl: result.imageUrl,
      generationTime: result.generationTime
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'AI_GENERATION_FAILED'
    });
  }
});

// Get generation history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const history = await aiService.getGenerationHistory(req.user.id);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available models
router.get('/models', authenticateToken, (req, res) => {
  res.json({
    models: [
      { id: 'dall-e-3', name: 'DALL-E 3', cost: 10, quality: 'highest' },
      { id: 'dall-e-2', name: 'DALL-E 2', cost: 5, quality: 'high' },
      { id: 'stable-diffusion', name: 'Stable Diffusion', cost: 3, quality: 'good' }
    ]
  });
});

module.exports = router;
