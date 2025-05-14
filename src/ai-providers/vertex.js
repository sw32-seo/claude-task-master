/**
 * vertex.js
 * AI provider implementation for Google Cloud Platform's Vertex AI models using Vercel AI SDK.
 */

import { createVertex } from '@ai-sdk/google-vertex';
import { generateText, streamText, generateObject } from 'ai'; // Import from main 'ai' package
import { log } from '../../scripts/modules/utils.js'; // Import logging utility

// Default values
const DEFAULT_MODEL = 'gemini-2.5-pro-preview-05-06'; // Default model ID
const DEFAULT_TEMPERATURE = 0.2; // Default temperature

/**
 * Generates text using a Vertex AI model.
 *
 * @param {object} params - Parameters for the generation.
 * @param {string} [params.apiKey] - Optional API key (not typically used with Vertex AI).
 * @param {string} params.modelId - Specific model ID to use (overrides default).
 * @param {number} params.temperature - Generation temperature.
 * @param {Array<object>} params.messages - The conversation history (system/user prompts).
 * @param {number} [params.maxTokens] - Optional max tokens.
 * @returns {Promise<string>} The generated text content.
 * @throws {Error} If API call fails.
 */
async function generateVertexText({
    apiKey, // Optional, not typically used with Vertex AI
    modelId = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    messages,
    maxTokens
}) {
    log('info', `Generating text with Vertex AI model: ${modelId}`);

    try {
        // Vertex AI uses Application Default Credentials (ADC) by default
        const vertexProvider = createVertex({ 
            // Configuration for Vertex AI
            project: process.env.VERTEX_PROJECT_ID || 'default-project',
            location: process.env.VERTEX_LOCATION || 'us-central1'
        });
        const model = vertexProvider(modelId);

        // Construct payload suitable for Vercel SDK's generateText
        const result = await generateText({
            model,
            messages,
            temperature,
            maxOutputTokens: maxTokens
        });

        return result.text;
    } catch (error) {
        log(
            'error',
            `Error generating text with Vertex AI (${modelId}): ${error.message}`
        );
        throw error; // Re-throw for unified service handler
    }
}

/**
 * Streams text using a Vertex AI model.
 *
 * @param {object} params - Parameters for the streaming.
 * @param {string} [params.apiKey] - Optional API key (not typically used with Vertex AI).
 * @param {string} params.modelId - Specific model ID to use (overrides default).
 * @param {number} params.temperature - Generation temperature.
 * @param {Array<object>} params.messages - The conversation history.
 * @param {number} [params.maxTokens] - Optional max tokens.
 * @returns {Promise<ReadableStream>} A readable stream of text deltas.
 * @throws {Error} If API call fails.
 */
async function streamVertexText({
    apiKey, // Optional, not typically used with Vertex AI
    modelId = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    messages,
    maxTokens
}) {
    log('info', `Streaming text with Vertex AI model: ${modelId}`);

    try {
        // Vertex AI uses Application Default Credentials (ADC) by default
        const vertexProvider = createVertex({ 
            project: process.env.VERTEX_PROJECT_ID || 'default-project',
            location: process.env.VERTEX_LOCATION || 'us-central1'
        });
        const model = vertexProvider(modelId);

        const stream = await streamText({
            model,
            messages,
            temperature,
            maxOutputTokens: maxTokens
        });

        return stream;
    } catch (error) {
        log(
            'error',
            `Error streaming text with Vertex AI (${modelId}): ${error.message}`
        );
        throw error;
    }
}

/**
 * Generates a structured object using a Vertex AI model.
 *
 * @param {object} params - Parameters for the object generation.
 * @param {string} [params.apiKey] - Optional API key (not typically used with Vertex AI).
 * @param {string} params.modelId - Specific model ID to use (overrides default).
 * @param {number} params.temperature - Generation temperature.
 * @param {Array<object>} params.messages - The conversation history.
 * @param {import('zod').ZodSchema} params.schema - Zod schema for the expected object.
 * @param {string} params.objectName - Name for the object generation context.
 * @param {number} [params.maxTokens] - Optional max tokens.
 * @returns {Promise<object>} The generated object matching the schema.
 * @throws {Error} If API call fails.
 */
async function generateVertexObject({
    apiKey, // Optional, not typically used with Vertex AI
    modelId = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    messages,
    schema,
    objectName,
    maxTokens
}) {
    log('info', `Generating object with Vertex AI model: ${modelId}`);

    try {
        // Vertex AI uses Application Default Credentials (ADC) by default
        const vertexProvider = createVertex({ 
            project: process.env.VERTEX_PROJECT_ID || 'default-project',
            location: process.env.VERTEX_LOCATION || 'us-central1'
        });
        const model = vertexProvider(modelId);

        const { object } = await generateObject({
            model,
            schema,
            messages,
            temperature,
            maxOutputTokens: maxTokens
        });

        return object;
    } catch (error) {
        log(
            'error',
            `Error generating object with Vertex AI (${modelId}): ${error.message}`
        );
        throw error;
    }
}

export { generateVertexText, streamVertexText, generateVertexObject };
