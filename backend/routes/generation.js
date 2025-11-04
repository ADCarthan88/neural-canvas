import express from 'express';
import ImageGenerator from '../../ai-services/generation/index.js';

const router = express.Router();
const imageGenerator = new ImageGenerator();

const disallowedTerms = ['illegal', 'exploit', 'abuse'];

router.post('/generate', async (req, res) => {
  const { prompt, style, quality, size } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const loweredPrompt = prompt.toLowerCase();
  if (disallowedTerms.some(term => loweredPrompt.includes(term))) {
    return res.status(400).json({ error: 'Prompt violates content policy' });
  }

  const options = {
    style,
    quality: ['standard', 'hd'].includes(quality) ? quality : 'standard',
    size: ['1024x1024', '1792x1024', '1024x1792', '512x512'].includes(size) ? size : '1024x1024',
  };

  try {
    const result = await imageGenerator.generationImage(prompt, options);
    res.json({ imageUrl: result.url, revisedPrompt: result.revisedPrompt, size: result.size, quality: result.quality });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

export default router;
