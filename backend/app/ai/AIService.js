const OpenAI = require('openai');
const { pool } = require('../database/connection');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.models = {
      'dall-e-3': { cost: 10, maxSize: '1024x1024' },
      'dall-e-2': { cost: 5, maxSize: '512x512' },
      'stable-diffusion': { cost: 3, maxSize: '768x768' }
    };
  }

  async generateImage({ userId, canvasId, prompt, style = 'digital art', model = 'dall-e-3' }) {
    // Create generation record
    const generationId = await this.createGenerationRecord({
      userId, canvasId, prompt, style, model
    });

    try {
      const startTime = Date.now();
      
      // Check user credits
      const user = await this.checkUserCredits(userId, this.models[model].cost);
      if (!user.hasCredits) {
        throw new Error('Insufficient credits');
      }

      let imageUrl;
      
      if (model.startsWith('dall-e')) {
        imageUrl = await this.generateWithDALLE(prompt, style, model);
      } else if (model === 'stable-diffusion') {
        imageUrl = await this.generateWithStableDiffusion(prompt, style);
      }

      const generationTime = Date.now() - startTime;

      // Update generation record
      await this.updateGenerationRecord(generationId, {
        status: 'completed',
        imageUrl,
        generationTime,
        cost: this.models[model].cost
      });

      // Deduct credits
      await this.deductCredits(userId, this.models[model].cost);

      return { generationId, imageUrl, generationTime };

    } catch (error) {
      await this.updateGenerationRecord(generationId, {
        status: 'failed',
        errorMessage: error.message
      });
      throw error;
    }
  }

  async generateWithDALLE(prompt, style, model) {
    const enhancedPrompt = `${prompt}, ${style}, high quality, detailed, masterpiece`;
    
    const response = await this.openai.images.generate({
      model: model,
      prompt: enhancedPrompt,
      size: this.models[model].maxSize,
      quality: model === 'dall-e-3' ? 'hd' : 'standard',
      n: 1,
    });

    return response.data[0].url;
  }

  async generateWithStableDiffusion(prompt, style) {
    // Placeholder for Stable Diffusion API integration
    // You'd integrate with Stability AI API or run locally
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: `${prompt}, ${style}` }],
        cfg_scale: 7,
        steps: 30,
        samples: 1,
      }),
    });

    const result = await response.json();
    return result.artifacts[0].base64; // Convert to URL
  }

  async createGenerationRecord({ userId, canvasId, prompt, style, model }) {
    const query = `
      INSERT INTO ai_generations (user_id, canvas_id, prompt, style, model_used, status)
      VALUES ($1, $2, $3, $4, $5, 'processing')
      RETURNING id
    `;
    
    const result = await pool.query(query, [userId, canvasId, prompt, style, model]);
    return result.rows[0].id;
  }

  async updateGenerationRecord(id, updates) {
    const fields = Object.keys(updates).map((key, index) => 
      `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${index + 2}`
    ).join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const query = `UPDATE ai_generations SET ${fields} WHERE id = $1`;
    await pool.query(query, values);
  }

  async checkUserCredits(userId, requiredCredits) {
    const query = 'SELECT subscription_tier FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    
    const user = result.rows[0];
    const creditLimits = {
      'free': 10,
      'pro': 100,
      'premium': 1000
    };
    
    // In a real app, you'd track actual credit usage
    return {
      hasCredits: creditLimits[user.subscription_tier] >= requiredCredits,
      tier: user.subscription_tier
    };
  }

  async deductCredits(userId, amount) {
    // Placeholder - implement actual credit tracking
    console.log(`Deducted ${amount} credits from user ${userId}`);
  }

  async getGenerationHistory(userId, limit = 20) {
    const query = `
      SELECT id, prompt, style, model_used, image_url, status, created_at
      FROM ai_generations
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }
}

module.exports = AIService;
