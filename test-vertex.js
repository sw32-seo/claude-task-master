/**
 * Test script for Vertex AI Claude integration
 */

import { generateTextService } from './scripts/modules/ai-services-unified.js';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables from .env file
dotenv.config();

async function testVertexAI() {
  console.log('Testing Vertex AI integration...');
  
  // Check environment variables
  const projectId = process.env.VERTEX_PROJECT_ID;
  const location = process.env.VERTEX_LOCATION;
  
  console.log('Environment variables:');
  console.log(`- VERTEX_PROJECT_ID: ${projectId || 'Not set'}`);
  console.log(`- VERTEX_LOCATION: ${location || 'Not set'}`);
  console.log();
  
  console.log(chalk.yellow('IMPORTANT: To use Vertex AI, you need to:'));
  console.log('1. Create a Google Cloud project and enable the Vertex AI API');
  console.log('2. Set up Application Default Credentials (ADC) using gcloud CLI:');
  console.log('   $ gcloud auth application-default login');
  console.log('3. Set the VERTEX_PROJECT_ID and VERTEX_LOCATION environment variables in .env:');
  console.log('   VERTEX_PROJECT_ID=your-gcp-project-id');
  console.log('   VERTEX_LOCATION=us-central1');
  console.log();
  
  if (!projectId || !location) {
    console.error(chalk.red('Error: VERTEX_PROJECT_ID and VERTEX_LOCATION must be set in .env file'));
    process.exit(1);
  }
  
  console.log('Attempting to call Vertex AI...\n');
  
  try {
    // Test with Claude 3.7 Sonnet model
    const modelId = 'claude-3-7-sonnet@20250219';
    console.log(`Trying with ${modelId} model via vertex-claude provider...`);
    
    const response = await generateTextService({
      role: 'main',
      providerOverride: 'vertex-claude',
      modelIdOverride: modelId,
      systemPrompt: 'You are a helpful assistant.',
      prompt: 'Write a short overview of Vertex AI.'
    });
    
    console.log(chalk.green('Vertex AI response:'));
    console.log(response);
    console.log(chalk.green('Test completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error calling Vertex AI:'));
    console.error(error);
    process.exit(1);
  }
}

testVertexAI();
