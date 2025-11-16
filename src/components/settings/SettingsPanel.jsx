import React from 'react';
import { X, Settings, Moon, Sun } from 'lucide-react';
import APIKeyManager from './APIKeyManager';

/**
 * Componente SettingsPanel - Painel de configurações
 *
 * Princípios aplicados:
 * - Single Responsibility: Interface de configurações
 * - Composition: Compõe APIKeyManager e outras configs
 */
const SettingsPanel = ({
  isOpen,
  darkMode,
  llmProvider,
  apiKey,
  modelName,
  apiKeyValid,
  validating,
  onClose,
  onToggleDarkMode,
  onProviderChange,
  onApiKeyChange,
  onModelChange,
  onValidateApiKey,
  onDeleteApiKey
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 p-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={24} />
            <h2 className="text-xl font-semibold">Configurações</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/20 transition-colors"
            title="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tema */}
          <div>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Aparência
            </h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2">
                {darkMode ? (
                  <Moon size={20} className="text-gray-700 dark:text-gray-300" />
                ) : (
                  <Sun size={20} className="text-gray-700 dark:text-gray-300" />
                )}
                <span className="dark:text-white">
                  Tema {darkMode ? 'Escuro' : 'Claro'}
                </span>
              </div>
              <button
                onClick={onToggleDarkMode}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    darkMode ? 'translate-x-7' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* API Keys */}
          <div>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Configuração de LLM
            </h3>
            <APIKeyManager
              provider={llmProvider}
              apiKey={apiKey}
              modelName={modelName}
              apiKeyValid={apiKeyValid}
              validating={validating}
              onProviderChange={onProviderChange}
              onApiKeyChange={onApiKeyChange}
              onModelChange={onModelChange}
              onValidate={onValidateApiKey}
              onDelete={onDeleteApiKey}
            />
          </div>

          {/* Informações */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-2 dark:text-white">
              💡 Dica
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Suas API keys são criptografadas e armazenadas com segurança.
              Você pode alternar entre diferentes provedores de IA a qualquer momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
