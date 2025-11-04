/**
 * 🤖 AI IMAGE GENERATOR
 * Connects to DALL-E and other AI services for image generation
 */

export class AIImageGenerator {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://api.openai.com/v1';
    this.backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    this.fallbackServices = {
      huggingface: 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      replicate: 'https://api.replicate.com/v1/predictions'
    };
    
    this.stylePresets = {
      neural: 'digital art, neural network visualization, synapses, brain-like patterns, electric blue and pink colors, high-tech, futuristic',
      quantum: 'quantum physics visualization, atomic particles, energy fields, scientific illustration, glowing orbs, particle physics',
      cosmic: 'cosmic space art, galaxy, nebula, stars, deep space, astronomical, celestial bodies, universe, cosmic dust',
      plasma: 'plasma energy, electric storm, lightning, energy discharge, high voltage, electric blue and white, power surge',
      abstract: 'abstract digital art, geometric patterns, flowing shapes, vibrant colors, modern art, contemporary design',
      cyberpunk: 'cyberpunk style, neon lights, futuristic city, digital matrix, cyber aesthetic, dark background with bright accents',
      organic: 'organic flowing forms, natural patterns, biomimetic design, fluid dynamics, nature-inspired, smooth curves',
      crystalline: 'crystal formations, geometric crystals, prismatic effects, refractive surfaces, mineral structures'
    };
    
    this.qualitySettings = {
      draft: { size: '1024x1024', quality: 'standard' },
      standard: { size: '1024x1024', quality: 'standard' },
      hd: { size: '1024x1024', quality: 'hd' },
      ultra: { size: '1792x1024', quality: 'hd' }
    };
  }

  /**
   * Set OpenAI API key
   */
  setAPIKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Generate image with DALL-E
   */
  async generateWithDALLE(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set. Please add your API key.');
    }

    const {
      style = 'neural',
      quality = 'standard',
      n = 1,
      response_format = 'url'
    } = options;

    // Enhance prompt with style
    const stylePrompt = this.stylePresets[style] || this.stylePresets.neural;
    const enhancedPrompt = `${prompt}, ${stylePrompt}, high quality, detailed, professional digital art`;

    const qualityConfig = this.qualitySettings[quality];

    try {
      const response = await fetch(`${this.baseURL}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          n: n,
          size: qualityConfig.size,
          quality: qualityConfig.quality,
          response_format: response_format
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `DALL-E API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        images: data.data.map(img => ({
          url: img.url,
          revised_prompt: img.revised_prompt || enhancedPrompt
        })),
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt,
        style: style,
        quality: quality
      };

    } catch (error) {
      console.error('DALL-E generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate image via backend service
   */
  async generateViaBackend(prompt, options = {}) {
    const {
      style = 'neural',
      quality = 'standard',
    } = options;

    const stylePrompt = this.stylePresets[style] || this.stylePresets.neural;
    const enhancedPrompt = `${prompt}, ${stylePrompt}`;
    const qualityConfig = this.qualitySettings[quality] || this.qualitySettings.standard;

    const response = await fetch(`${this.backendBaseUrl}/api/generation/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        style: stylePrompt,
        size: qualityConfig.size,
        quality: qualityConfig.quality,
      })
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(errorPayload.error || `Backend generation failed (${response.status})`);
    }

    const data = await response.json();

    return {
      success: true,
      images: [{ url: data.imageUrl, revised_prompt: data.revisedPrompt || enhancedPrompt }],
      originalPrompt: prompt,
      enhancedPrompt,
      style,
      quality,
      service: 'backend'
    };
  }

  /**
   * Generate image with Hugging Face (fallback)
   */
  async generateWithHuggingFace(prompt, options = {}) {
    const { style = 'neural' } = options;
    
    // Enhance prompt with style
    const stylePrompt = this.stylePresets[style] || this.stylePresets.neural;
    const enhancedPrompt = `${prompt}, ${stylePrompt}`;

    try {
      const response = await fetch(this.fallbackServices.huggingface, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            num_inference_steps: 20,
            guidance_scale: 7.5
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      return {
        success: true,
        images: [{ url: imageUrl, revised_prompt: enhancedPrompt }],
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt,
        style: style,
        service: 'huggingface'
      };

    } catch (error) {
      console.error('Hugging Face generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate image with automatic fallback
   */
  async generateImage(prompt, options = {}) {
    const { service = 'backend' } = options;

    if (service === 'backend' || service === 'auto') {
      try {
        return await this.generateViaBackend(prompt, options);
      } catch (error) {
        if (service === 'backend') throw error;
        console.warn('Backend generation failed, trying next service:', error.message);
      }
    }

    if ((service === 'dalle' || service === 'auto') && this.apiKey) {
      try {
        return await this.generateWithDALLE(prompt, options);
      } catch (error) {
        if (service === 'dalle') throw error;
        console.warn('DALL-E failed, trying fallback:', error.message);
      }
    }

    if (service === 'huggingface' || service === 'auto') {
      return await this.generateWithHuggingFace(prompt, options);
    }

    throw new Error('No available AI image generation service');
  }

  /**
   * Generate prompt from canvas state
   */
  generatePromptFromCanvas(canvasState) {
    const { mode, intensity, primaryColor, secondaryColor, particleCount } = canvasState;
    
    let prompt = '';
    
    // Base description from mode
    switch (mode) {
      case 'neural':
        prompt = 'A neural network visualization with glowing synapses and brain-like connections';
        break;
      case 'quantum':
        prompt = 'Quantum particles and energy fields with atomic structures floating in space';
        break;
      case 'cosmic':
        prompt = 'A cosmic scene with swirling galaxies, nebulae, and celestial bodies';
        break;
      case 'plasma':
        prompt = 'Electric plasma energy with lightning bolts and energy discharges';
        break;
      default:
        prompt = 'Abstract digital art with flowing patterns and energy';
    }
    
    // Add intensity description
    if (intensity > 2) {
      prompt += ', extremely bright and intense, high energy, explosive';
    } else if (intensity > 1.5) {
      prompt += ', bright and vibrant, energetic, dynamic';
    } else if (intensity < 0.5) {
      prompt += ', soft and subtle, gentle glow, peaceful';
    } else {
      prompt += ', balanced lighting, harmonious';
    }
    
    // Add particle description
    if (particleCount > 5000) {
      prompt += ', dense particle field, many glowing points, complex patterns';
    } else if (particleCount < 1000) {
      prompt += ', sparse particles, minimalist, clean composition';
    }
    
    // Add color information
    prompt += `, dominant colors: ${primaryColor} and ${secondaryColor}`;
    
    return prompt;
  }

  /**
   * Generate variations of current canvas
   */
  async generateCanvasVariations(canvasState, count = 3, options = {}) {
  const basePrompt = this.generatePromptFromCanvas(canvasState);
  const styleOption = options.style || canvasState.mode;
    
    const variations = [
      `${basePrompt}, artistic interpretation`,
      `${basePrompt}, photorealistic style`,
      `${basePrompt}, abstract expressionist style`,
      `${basePrompt}, cyberpunk aesthetic`,
      `${basePrompt}, minimalist design`
    ];
    
    const results = [];
    
    for (let i = 0; i < Math.min(count, variations.length); i++) {
      try {
        const result = await this.generateImage(variations[i], {
          style: styleOption,
          quality: 'standard',
          ...options,
        });
        results.push({
          ...result,
          variation: i + 1,
          prompt: variations[i]
        });
      } catch (error) {
        console.error(`Variation ${i + 1} failed:`, error);
        results.push({
          success: false,
          error: error.message,
          variation: i + 1,
          prompt: variations[i]
        });
      }
    }
    
    return results;
  }

  /**
   * Get available styles
   */
  getAvailableStyles() {
    return Object.keys(this.stylePresets).map(key => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      description: this.stylePresets[key]
    }));
  }

  /**
   * Get quality options
   */
  getQualityOptions() {
    return Object.keys(this.qualitySettings).map(key => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      ...this.qualitySettings[key]
    }));
  }

  /**
   * Estimate generation cost (DALL-E pricing)
   */
  estimateCost(quality = 'standard', count = 1) {
    const pricing = {
      draft: 0.016,    // $0.016 per image (512x512)
      standard: 0.040, // $0.040 per image (1024x1024 standard)
      hd: 0.080,       // $0.080 per image (1024x1024 HD)
      ultra: 0.120     // $0.120 per image (1792x1024 HD)
    };
    
    return (pricing[quality] || pricing.standard) * count;
  }

  /**
   * Check API key validity
   */
  async validateAPIKey() {
    if (!this.apiKey) {
      return { valid: false, error: 'No API key provided' };
    }

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        return { valid: true };
      } else {
        const error = await response.json();
        return { valid: false, error: error.error?.message || 'Invalid API key' };
      }
    } catch (error) {
      return { valid: false, error: 'Network error or invalid API key' };
    }
  }

  /**
   * Download image from URL
   */
  async downloadImage(imageUrl, filename = null) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `ai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Download failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AIImageGenerator;