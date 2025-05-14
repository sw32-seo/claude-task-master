/**
 * vertex-claude.js
 * Custom implementation for Anthropic Claude models via Google Cloud Platform's Vertex AI.
 */

import { log } from '../../scripts/modules/utils.js';
import { exec } from 'child_process';
import { promisify } from 'util';
// Using built-in fetch API instead of node-fetch

const execAsync = promisify(exec);

// Default values
const DEFAULT_MODEL = 'claude-3-7-sonnet@20250219';
const DEFAULT_TEMPERATURE = 0.2;

/**
 * Get an access token using gcloud CLI
 * @returns {Promise<string>} The access token
 */
async function getAccessToken() {
  try {
    const { stdout } = await execAsync('gcloud auth print-access-token');
    return stdout.trim();
  } catch (error) {
    throw new Error(`Failed to get access token: ${error.message}`);
  }
}

/**
 * Generates text using a Claude model via Vertex AI.
 *
 * @param {object} params - Parameters for the generation.
 * @param {string} [params.apiKey] - Optional API key (not used, uses ADC instead).
 * @param {string} params.modelId - Specific model ID to use (overrides default).
 * @param {number} params.temperature - Generation temperature.
 * @param {Array<object>} params.messages - The conversation history (system/user prompts).
 * @param {number} [params.maxTokens] - Optional max tokens.
 * @returns {Promise<string>} The generated text content.
 * @throws {Error} If API call fails.
 */
async function generateVertexClaudeText({
  apiKey, // Not used, uses ADC instead
  modelId = DEFAULT_MODEL,
  temperature = DEFAULT_TEMPERATURE,
  messages,
  maxTokens = 1024
}) {
  log('info', `Generating text with Vertex AI Claude model: ${modelId}`);

  try {
    // Get project ID and location from environment variables
    const projectId = process.env.VERTEX_PROJECT_ID;
    const location = process.env.VERTEX_LOCATION;

    if (!projectId || !location) {
      throw new Error('VERTEX_PROJECT_ID and VERTEX_LOCATION environment variables must be set');
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Convert messages to Claude format
    let systemPrompt = '';
    let userMessages = [];

    for (const message of messages) {
      if (message.role === 'system') {
        systemPrompt = message.content;
      } else if (message.role === 'user') {
        userMessages.push(message.content);
      }
    }

    // Combine all user messages
    const userPrompt = userMessages.join('\n\n');

    // Prepare request payload according to Vertex AI Claude API format
    const payload = {
      anthropic_version: "vertex-2023-10-16",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${systemPrompt ? `${systemPrompt}\n\n` : ''}${userPrompt}`
            }
          ]
        }
      ],
      // Ensure max_tokens doesn't exceed Claude's limit of 64000
      max_tokens: Math.min(maxTokens, 64000),
      temperature: temperature,
      top_p: 0.95,
      top_k: 40
    };

    // Make API request using the streamRawPredict endpoint
    const response = await fetch(
      `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/anthropic/models/${modelId}:streamRawPredict`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vertex AI API error (${response.status}): ${errorText}`);
    }

    // For streamRawPredict, we need to handle the streaming response
    // But since we're not implementing true streaming, we'll collect all chunks
    const responseText = await response.text();
    
    try {
      // The response might be a series of JSON objects separated by newlines
      // We'll try to parse the last complete JSON object which should contain the final response
      const lines = responseText.trim().split('\n');
      let lastValidJson = null;
      
      // Process each line, keeping track of the last valid JSON
      for (const line of lines) {
        if (line.trim()) {
          try {
            const jsonData = JSON.parse(line);
            lastValidJson = jsonData;
          } catch (e) {
            // Skip invalid JSON lines
            console.log('Skipping invalid JSON line:', line);
          }
        }
      }
      
      if (lastValidJson) {
        // Extract the content from the response based on Claude's response format
        if (lastValidJson.delta && lastValidJson.delta.text) {
          return lastValidJson.delta.text;
        } else if (lastValidJson.content && lastValidJson.content.text) {
          return lastValidJson.content.text;
        } else if (lastValidJson.content && Array.isArray(lastValidJson.content) && 
                  lastValidJson.content.length > 0 && lastValidJson.content[0].text) {
          return lastValidJson.content[0].text;
        } else if (lastValidJson.message && lastValidJson.message.content) {
          return lastValidJson.message.content;
        } else if (lastValidJson.message && lastValidJson.message.content && 
                  Array.isArray(lastValidJson.message.content) && 
                  lastValidJson.message.content.length > 0 && 
                  lastValidJson.message.content[0].text) {
          return lastValidJson.message.content[0].text;
        } else if (lastValidJson.text) {
          return lastValidJson.text;
        } else {
          // If we can't find the text in expected locations, try to extract it from the full object
          const jsonStr = JSON.stringify(lastValidJson);
          console.log('Attempting to extract text from response:', jsonStr);
          
          // Look for text field in the JSON structure
          const textMatch = jsonStr.match(/"text":"([^"]+)"/);
          if (textMatch && textMatch[1]) {
            return textMatch[1];
          }
          
          // Return the whole object as a fallback
          return jsonStr;
        }
      } else {
        // If we couldn't parse any valid JSON, return the raw response
        console.log('Could not parse any valid JSON from response:', responseText);
        return responseText;
      }
    } catch (error) {
      console.log('Error processing response:', error.message);
      console.log('Raw response:', responseText);
      return responseText; // Return the raw response as a fallback
    }
  } catch (error) {
    log(
      'error',
      `Error generating text with Vertex AI Claude (${modelId}): ${error.message}`
    );
    throw error;
  }
}

/**
 * Streams text using a Claude model via Vertex AI.
 * Note: This is a placeholder. Streaming is not implemented for Claude models via Vertex AI yet.
 */
async function streamVertexClaudeText(params) {
  log('info', `Streaming not implemented for Vertex AI Claude models. Using non-streaming version.`);
  return generateVertexClaudeText(params);
}

/**
 * Generates a structured object using a Claude model via Vertex AI.
 * Note: This is a placeholder. Object generation is not implemented for Claude models via Vertex AI yet.
 */
async function generateVertexClaudeObject(params) {
  log('info', `Object generation not implemented for Vertex AI Claude models. Using text generation.`);
  const text = await generateVertexClaudeText(params);
  
  try {
    // Attempt to parse the response as JSON
    return JSON.parse(text);
  } catch (error) {
    log('error', `Failed to parse Claude response as JSON: ${error.message}`);
    throw new Error(`Failed to generate object: ${error.message}`);
  }
}

export { generateVertexClaudeText, streamVertexClaudeText, generateVertexClaudeObject };
