/**
 * 🤖 AI GENERATION PANEL
 * UI for DALL-E and AI image generation
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import AIImageGenerator from '../lib/AIImageGenerator';

export default function AIGenerationPanel({ 
  canvasState,
  isVisible, 
  onClose,
  onApplyToCanvas 
}) {
  const [aiGenerator] = useState(() => new AIImageGenerator());
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('neural');
  const [selectedQuality, setSelectedQuality] = useState('standard');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(false);

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      aiGenerator.setAPIKey(savedKey);
      validateApiKey(savedKey);
    }
  }, []);

  // Validate API key
  const validateApiKey = useCallback(async (key) => {
    if (!key) return;
    
    setGenerationProgress('Validating API key...');
    try {
      aiGenerator.setAPIKey(key);
      const result = await aiGenerator.validateAPIKey();
      setApiKeyValid(result.valid);
      
      if (result.valid) {
        localStorage.setItem('openai_api_key', key);
        setGenerationProgress('✅ API key validated!');
      } else {
        setGenerationProgress(`❌ ${result.error}`);
      }
    } catch (error) {
      setApiKeyValid(false);
      setGenerationProgress(`❌ Validation failed: ${error.message}`);
    }
    
    setTimeout(() => setGenerationProgress(''), 3000);
  }, [aiGenerator]);

  // Generate from canvas state
  const generateFromCanvas = useCallback(async () => {
    setIsGenerating(true);
    setGenerationProgress('🎨 Generating AI art from your canvas...');

    try {
      let prompt;
      if (customPrompt) {
        prompt = customPrompt;
      } else {
        prompt = aiGenerator.generatePromptFromCanvas(canvasState);
      }

      const result = await aiGenerator.generateImage(prompt, {
        style: selectedStyle,
        quality: selectedQuality,
        service: 'backend'
      });

      if (result.success) {
        setGeneratedImages(prev => [result, ...prev]);
        setGenerationProgress('✅ AI art generated successfully!');
      } else {
        throw new Error('Generation failed');
      }

    } catch (error) {
      console.error('Generation failed:', error);
      setGenerationProgress(`❌ Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(''), 5000);
    }
  }, [aiGenerator, canvasState, customPrompt, selectedStyle, selectedQuality]);

  // Generate variations
  const generateVariations = useCallback(async () => {
    setIsGenerating(true);
    setGenerationProgress('🎨 Generating 3 variations...');

    try {
      const variations = await aiGenerator.generateCanvasVariations(canvasState, 3, {
        service: 'backend',
        style: selectedStyle,
      });
      
      const successfulVariations = variations.filter(v => v.success);
      if (successfulVariations.length > 0) {
        setGeneratedImages(prev => [...successfulVariations, ...prev]);
        setGenerationProgress(`✅ Generated ${successfulVariations.length} variations!`);
      } else {
        throw new Error('All variations failed');
      }

    } catch (error) {
      console.error('Variations failed:', error);
      setGenerationProgress(`❌ Variations failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(''), 5000);
    }
  }, [aiGenerator, canvasState, selectedStyle]);

  // Download image
  const downloadImage = useCallback(async (imageUrl, index) => {
    setGenerationProgress('📥 Downloading image...');
    
    try {
      await aiGenerator.downloadImage(imageUrl, `neural-canvas-ai-${Date.now()}-${index}.png`);
      setGenerationProgress('✅ Image downloaded!');
    } catch (error) {
      setGenerationProgress(`❌ Download failed: ${error.message}`);
    }
    
    setTimeout(() => setGenerationProgress(''), 3000);
  }, [aiGenerator]);

  if (!isVisible) return null;

  const styles = aiGenerator.getAvailableStyles();
  const qualities = aiGenerator.getQualityOptions();
  const estimatedCost = aiGenerator.estimateCost(selectedQuality, 1);

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      borderRadius: '20px',
      padding: '30px',
      border: '3px solid #ff00ff',
      boxShadow: '0 0 50px #ff00ff50',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflowY: 'auto',
      color: 'white',
      minWidth: '600px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          🤖 AI IMAGE GENERATION
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ×
        </button>
      </div>

      {/* Progress */}
      {generationProgress && (
        <div style={{
          backgroundColor: generationProgress.includes('❌') ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 0, 255, 0.2)',
          border: `2px solid ${generationProgress.includes('❌') ? '#ff0000' : '#ff00ff'}`,
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {generationProgress}
        </div>
      )}

      {/* API Key Section */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '16px', color: '#ff00ff', margin: 0 }}>🔑 OpenAI API Key</h3>
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            style={{
              padding: '5px 10px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: apiKeyValid ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {apiKeyValid ? '✅ Valid' : showApiKeyInput ? 'Hide' : 'Set Key'}
          </button>
        </div>
        
        {showApiKeyInput && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px'
              }}
            />
            <button
              onClick={() => validateApiKey(apiKey)}
              style={{
                padding: '10px 15px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: 'rgba(255, 0, 255, 0.3)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Validate
            </button>
          </div>
        )}
        
        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>
          {apiKeyValid ? 'Using your OpenAI account for direct generations' : 'Default mode uses the backend OpenAI key—adding your own key is optional.'}
        </div>
      </div>

      {/* Generation Controls */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ fontSize: '16px', color: '#ff00ff', marginBottom: '15px' }}>🎨 Generation Settings</h3>
        
        {/* Custom Prompt */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Custom Prompt (optional):</label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe what you want to generate, or leave empty to use canvas state..."
            style={{
              width: '100%',
              height: '60px',
              padding: '10px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Style and Quality */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Style:</label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px'
              }}
            >
              {styles.map(style => (
                <option key={style.key} value={style.key} style={{ backgroundColor: '#333' }}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Quality:</label>
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px'
              }}
            >
              {qualities.map(quality => (
                <option key={quality.key} value={quality.key} style={{ backgroundColor: '#333' }}>
                  {quality.name} ({quality.size})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cost Estimate */}
        {apiKeyValid && (
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '15px' }}>
            💰 Estimated cost: ${estimatedCost.toFixed(3)} per image
          </div>
        )}

        {/* Generation Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={generateFromCanvas}
            disabled={isGenerating}
            style={{
              padding: '15px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(255, 0, 255, 0.3)',
              color: 'white',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            {isGenerating ? '🎨 Generating...' : '🎨 Generate from Canvas'}
          </button>
          
          <button
            onClick={generateVariations}
            disabled={isGenerating}
            style={{
              padding: '15px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(0, 255, 255, 0.3)',
              color: 'white',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            {isGenerating ? '🔄 Generating...' : '🔄 Generate 3 Variations'}
          </button>
        </div>
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div>
          <h3 style={{ fontSize: '16px', color: '#ff00ff', marginBottom: '15px' }}>
            🖼️ Generated Images ({generatedImages.length})
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {generatedImages.map((result, index) => (
              <div key={index} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '10px',
                padding: '10px',
                border: '1px solid rgba(255, 0, 255, 0.3)'
              }}>
                {result.success ? (
                  <>
                    <img
                      src={result.images[0].url}
                      alt={`Generated ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '5px',
                        marginBottom: '10px'
                      }}
                    />
                    
                    <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
                      Style: {result.style} | Quality: {result.quality}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => downloadImage(result.images[0].url, index)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '5px',
                          border: 'none',
                          backgroundColor: 'rgba(0, 255, 0, 0.3)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        📥 Download
                      </button>
                      
                      <button
                        onClick={() => onApplyToCanvas?.(result)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '5px',
                          border: 'none',
                          backgroundColor: 'rgba(255, 0, 255, 0.3)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        🎨 Apply
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
                    <div style={{ fontSize: '12px', color: '#ff6666' }}>
                      Generation Failed
                    </div>
                    <div style={{ fontSize: '10px', color: '#aaa', marginTop: '5px' }}>
                      {result.error}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: 'rgba(255, 0, 255, 0.1)',
        borderRadius: '10px',
        fontSize: '12px',
        color: '#aaa',
        lineHeight: '1.4'
      }}>
        <strong style={{ color: 'white' }}>💡 Tips:</strong><br/>
        • Add your OpenAI API key for DALL-E 3 premium quality<br/>
        • Without API key, uses free Hugging Face Stable Diffusion<br/>
        • Custom prompts override canvas-generated descriptions<br/>
        • Variations require DALL-E 3 (API key needed)<br/>
        • Generated images can be downloaded or applied to canvas
      </div>
    </div>
  );
}