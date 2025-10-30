const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Canvas = require('../models/Canvas');

const router = express.Router();

// Create new canvas
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const canvas = await Canvas.create({
      title,
      description,
      ownerId: req.user.id
    });
    
    res.status(201).json(canvas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's canvases
router.get('/', authenticateToken, async (req, res) => {
  try {
    const canvases = await Canvas.getUserCanvases(req.user.id);
    res.json({ canvases });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific canvas
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const canvas = await Canvas.findById(req.params.id);
    if (!canvas) {
      return res.status(404).json({ error: 'Canvas not found' });
    }
    
    res.json(canvas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save canvas data
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { canvasData } = req.body;
    const canvas = await Canvas.updateCanvasData(req.params.id, canvasData);
    
    // Save version for undo/redo
    await Canvas.saveVersion(req.params.id, canvasData, req.user.id);
    
    res.json(canvas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
