/**
 * Configurações dos provedores de LLM
 * Seguindo o princípio Open/Closed: fechado para modificação, aberto para extensão
 */

export const LLM_PROVIDERS = {
  anthropic: {
    name: 'Anthropic (Claude)',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      'claude-sonnet-4-20250514',
      'claude-opus-4-20250514',
      'claude-3-5-sonnet-20241022'
    ],
    endpoint: 'https://api.anthropic.com/v1/messages',
    headers: (key) => ({
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01'
    })
  },
  openai: {
    name: 'OpenAI (ChatGPT)',
    defaultModel: 'gpt-4o',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ],
    endpoint: 'https://api.openai.com/v1/chat/completions',
    headers: (key) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    })
  },
  google: {
    name: 'Google (Gemini)',
    defaultModel: 'gemini-1.5-pro',
    models: [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro'
    ],
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    headers: () => ({
      'Content-Type': 'application/json'
    })
  }
};

export const DEFAULT_LLM_PROVIDER = 'anthropic';
