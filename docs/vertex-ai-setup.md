# Vertex AI Claude Setup Guide

This guide will help you set up and use Anthropic's Claude models via Google Cloud's Vertex AI platform with Task Master.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A GCP project with the Vertex AI API enabled
3. Google Cloud CLI (`gcloud`) installed on your machine

## Setup Steps

### 1. Create a Google Cloud Project (if you don't have one)

```bash
gcloud projects create your-project-id --name="Your Project Name"
```

### 2. Enable the Vertex AI API

```bash
gcloud services enable aiplatform.googleapis.com --project=your-project-id
```

### 3. Set up Application Default Credentials (ADC)

Task Master uses Application Default Credentials (ADC) to authenticate with Google Cloud. Run:

```bash
gcloud auth application-default login
```

This will open a browser window where you can log in with your Google account. After logging in, credentials will be stored locally on your machine.

### 4. Configure Environment Variables

Add the following environment variables to your `.env` file (for CLI) or `.cursor/mcp.json` (for MCP):

```
VERTEX_PROJECT_ID=your-gcp-project-id
VERTEX_LOCATION=us-central1
```

For the `VERTEX_LOCATION`, use a region where Claude models are available, such as:
- `us-central1`
- `us-east4`
- `europe-west4`
- `asia-northeast1`

## Using Vertex AI Claude with Task Master

### Setting the Model via CLI

```bash
# Set as main model
task-master models --set-main claude-3-7-sonnet@20250219 --vertex-claude

# Set as research model
task-master models --set-research claude-3-7-sonnet@20250219 --vertex-claude

# Set as fallback model
task-master models --set-fallback claude-3-7-sonnet@20250219 --vertex-claude
```

### Available Vertex AI Claude Models

Task Master supports the following Claude models via Vertex AI:

- `claude-3-7-sonnet@20250219` - Claude 3.7 Sonnet
- `claude-3-5-sonnet@20240620` - Claude 3.5 Sonnet
- `claude-3-haiku@20240307` - Claude 3 Haiku
- `claude-3-opus@20240229` - Claude 3 Opus

## Troubleshooting

### Authentication Issues

If you encounter authentication errors:

1. Verify your Application Default Credentials are set up correctly:
   ```bash
   gcloud auth application-default print-access-token
   ```
   This should print an access token. If it fails, run `gcloud auth application-default login` again.

2. Ensure your account has the necessary permissions in your GCP project.

### API Errors

- **Model not found**: Verify the model ID is correct and available in your region.
- **Quota exceeded**: Check your Vertex AI quotas in the Google Cloud Console.
- **Region issues**: Ensure the `VERTEX_LOCATION` is set to a region where Claude models are available.

## Pricing

Using Claude models via Vertex AI incurs costs based on the number of tokens processed. Refer to the [Google Cloud pricing page](https://cloud.google.com/vertex-ai/pricing) for the most up-to-date information.

## Additional Resources

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Claude on Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/claude)
- [Google Cloud CLI Documentation](https://cloud.google.com/sdk/gcloud)
