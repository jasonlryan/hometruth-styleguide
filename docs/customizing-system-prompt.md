# Customizing the Chat System Prompt

## Overview
The chatbot's behavior is controlled by a system prompt that can be customized.

## Methods (in order of precedence)

### 1. Environment Variable (Instant)
Set `CHAT_SYSTEM_PROMPT` in your environment:
- Vercel: Dashboard → Settings → Environment Variables
- Local: `.env.local` file
- Takes effect on next request (no redeploy needed)

### 2. Custom File Path
Set `CHAT_SYSTEM_PROMPT_PATH` to a file path:
- Relative paths resolved from project root
- Useful for A/B testing or multiple environments

### 3. Edit Default File
Edit `config/chat-system-prompt.md`:
- Requires redeploy in production
- Hot-reloads in development

## Best Practices
- Keep prompts under 16KB
- Test changes in development first
- Monitor token usage after changes
- Use version control for prompt history

## Troubleshooting
- Check logs for prompt source and hash
- Verify file permissions and encoding
- Ensure Node.js runtime (not Edge)
