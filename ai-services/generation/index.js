import OpenAI from 'openai';
import sharp from 'sharp';

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here') {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

class ImageGenerator {
    async generationImage(prompt, options = {}) {
        const {
            style = 'digital art',
            quality = 'standard',
            size = '1024x1024',
        } = options;

        if (!openai) {
            throw new Error('OpenAI API key not configured');
        }
        try {
            const sanitizedPrompt = prompt.trim();

            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: `${sanitizedPrompt}, ${style}, high quality, detailed`,
                size,
                quality,
                n: 1,
            });

            const [image] = response.data;

            return {
                url: image.url,
                revisedPrompt: image.revised_prompt,
                size,
                quality,
            };
        } catch (error) {
            throw new Error(`Image generation failed: ${error.message}`);
        }
    }

    async processImage(imageBuffer) {
        return await sharp(imageBuffer)
        .resize(512, 512)
        .jpeg({ quality: 90 })
        .toBuffer();
    }
}

export default ImageGenerator;
