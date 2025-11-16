import React from 'react';
import { CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react';
import { LLM_PROVIDERS } from '../../constants/llm-providers';

/**
 * Componente APIKeyManager - Gerenciamento de API Keys
 *
 * Princípios aplicados:
 * - Single Responsibility: Gerencia apenas interface de API keys
 * - Presentational Component: Lógica no hook useChat
 */
const APIKeyManager = ({
  provider,
  apiKey,
  modelName,
  apiKeyValid,
  validating,
  onProviderChange,
  onApiKeyChange,
  onModelChange,
  onValidate,
  onDelete
}) => {
  const providerConfig = LLM_PROVIDERS[provider];

  return (
    <div className="space-y-4">
      {/* Seleção de Provider */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
          Provedor LLM
        </label>
        <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="w-full p-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
        >
          {Object.entries(LLM_PROVIDERS).map(([key, config]) => (
            <option key={key} value={key}>
              {config.name}
            </option>
          ))}
        </select>
      </div>

      {/* API Key */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
          API Key
          {apiKeyValid !== null && (
            <span className="ml-2">
              {apiKeyValid ? (
                <CheckCircle
                  size={16}
                  className="inline text-green-500"
                  title="API key válida"
                />
              ) : (
                <XCircle
                  size={16}
                  className="inline text-red-500"
                  title="API key inválida"
                />
              )}
            </span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={`Cole sua ${providerConfig.name} API key aqui`}
            className="flex-1 p-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
          />
          {apiKey && (
            <button
              onClick={onDelete}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Remover API key"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Modelo */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-gray-300">
          Modelo
        </label>
        <select
          value={modelName}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full p-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
        >
          {providerConfig.models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {/* Botão de Validação */}
      <button
        onClick={onValidate}
        disabled={!apiKey || validating}
        className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {validating ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Validando...
          </>
        ) : (
          'Salvar e Validar API Key'
        )}
      </button>

      {/* Instruções */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded">
        <p className="font-medium mb-1">Como obter sua API key:</p>
        <ul className="list-disc list-inside space-y-1">
          {provider === 'anthropic' && (
            <li>
              Acesse{' '}
              <a
                href="https://console.anthropic.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                console.anthropic.com
              </a>
            </li>
          )}
          {provider === 'openai' && (
            <li>
              Acesse{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </li>
          )}
          {provider === 'google' && (
            <li>
              Acesse{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                makersuite.google.com
              </a>
            </li>
          )}
          <li>Crie uma nova API key</li>
          <li>Cole a key acima e clique em validar</li>
        </ul>
      </div>
    </div>
  );
};

export default APIKeyManager;
