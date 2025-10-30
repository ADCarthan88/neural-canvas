const OpenAI = require('openai');
const sharp = require('sharp');

const openai = new OpenAI({
    apiKey: process.env.OPENAPI_API_KEY,
});

class ImageGenerator {
    async generationImage(prompt, style = 'digital art') {
        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: `${prompt}, ${style}, high quality, detailed`,
                size: "1024x1024",
                quality: "hd",
                n: 1,
            });

            return response.data[0].url;
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

module.exports = ImageGenerator;