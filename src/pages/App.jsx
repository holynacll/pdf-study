import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { usePDF, useChat, useKeyboardShortcuts, useDarkMode, useTextSelection } from '../hooks';
import {
  Header,
  PDFViewer,
  ChatPanel,
  SettingsPanel,
  TextSelectionMenu
} from '../components';

/**
 * App Component - Refatorado
 *
 * Princípios SOLID aplicados:
 * - Single Responsibility: Orquestra componentes, não implementa lógica
 * - Dependency Inversion: Usa abstrações (hooks, componentes)
 * - Separation of Concerns: Lógica em hooks, UI em componentes
 *
 * Antes: 1,773 linhas
 * Depois: ~150 linhas (90% de redução!)
 */
const PDFStudyApp = () => {
  // Auth
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // UI State
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Container ref para fullscreen
  const containerRef = useRef(null);

  // Dark mode hook
  const [darkMode, toggleDarkMode] = useDarkMode();

  // PDF hook - gerencia todo estado e lógica de PDF
  const pdfState = usePDF();

  // Chat hook - gerencia todo estado e lógica de chat
  const chatState = useChat(currentUser?.uid, pdfState.pdfDoc?.fingerprint);

  // Text selection hook - gerencia seleção de texto no PDF
  const textSelection = useTextSelection();

  // Keyboard shortcuts hook
  useKeyboardShortcuts({
    nextPage: pdfState.nextPage,
    previousPage: pdfState.previousPage,
    openSearch: () => {}, // TODO: Implementar busca
    openChat: () => setChatOpen(true),
    closeSearch: () => {},
    toggleBookmark: pdfState.toggleBookmark,
    exitFullscreen: () => setFullscreen(false),
    showHelp: () => {} // TODO: Implementar ajuda
  });

  // Handlers
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
        .then(() => setFullscreen(true))
        .catch(err => console.error('Erro fullscreen:', err));
    } else {
      document.exitFullscreen()
        .then(() => setFullscreen(false))
        .catch(err => console.error('Erro fullscreen:', err));
    }
  };

  const handlePageInputSubmit = () => {
    const pageNum = parseInt(pdfState.pageInput);
    if (!isNaN(pageNum)) {
      pdfState.goToPage(pageNum);
    }
  };

  const handleSendMessage = () => {
    chatState.sendMessage(pdfState.pageTextContent);
  };

  // Handlers para seleção de texto
  const handleAskAI = () => {
    if (textSelection.selectedText) {
      chatState.setInput('');
      setChatOpen(true);
      // Adiciona o texto selecionado como contexto
      setTimeout(() => {
        chatState.setInput(textSelection.selectedText);
      }, 100);
      textSelection.clearSelection();
      toast.success('Pergunta adicionada ao chat! 💬', { duration: 2000 });
    }
  };

  const handleTranslate = () => {
    if (textSelection.selectedText) {
      chatState.setInput(`Traduza este texto para português:\n\n${textSelection.selectedText}`);
      setChatOpen(true);
      textSelection.clearSelection();
      toast.success('Tradução solicitada! 🌐', { duration: 2000 });
    }
  };

  const handleExplain = () => {
    if (textSelection.selectedText) {
      chatState.setInput(`Explique este texto de forma clara e detalhada:\n\n${textSelection.selectedText}`);
      setChatOpen(true);
      textSelection.clearSelection();
      toast.success('Explicação solicitada! 💡', { duration: 2000 });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <Header
        pdfFile={pdfState.pdfFile}
        darkMode={darkMode}
        user={currentUser}
        onToggleChat={() => setChatOpen(!chatOpen)}
        onToggleSettings={() => setSettingsOpen(!settingsOpen)}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <PDFViewer
          containerRef={containerRef}
          canvasRef={pdfState.canvasRef}
          canvas2Ref={pdfState.canvas2Ref}
          textLayerRef={pdfState.textLayerRef}
          textLayer2Ref={pdfState.textLayer2Ref}
          fileInputRef={pdfState.fileInputRef}
          pdfDoc={pdfState.pdfDoc}
          currentPage={pdfState.currentPage}
          totalPages={pdfState.totalPages}
          pageInput={pdfState.pageInput}
          pageMode={pdfState.pageMode}
          fullscreen={fullscreen}
          draggingOver={pdfState.draggingOverViewer}
          onPageInputChange={pdfState.setPageInput}
          onPageInputSubmit={handlePageInputSubmit}
          onPreviousPage={pdfState.previousPage}
          onNextPage={pdfState.nextPage}
          onZoomIn={pdfState.zoomIn}
          onZoomOut={pdfState.zoomOut}
          onRotate={pdfState.rotate}
          onToggleFullscreen={handleToggleFullscreen}
          onTogglePageMode={() =>
            pdfState.setPageMode(
              pdfState.pageMode === 'single' ? 'double' : 'single'
            )
          }
          onFileUpload={pdfState.handleFileUpload}
          onDragOver={pdfState.handleDragOver}
          onDragLeave={pdfState.handleDragLeave}
          onDrop={pdfState.handleDrop}
          onTextSelection={textSelection.handleTextSelection}
        />

        {/* Chat Panel */}
        <ChatPanel
          isOpen={chatOpen}
          messages={chatState.messages}
          input={chatState.input}
          loading={chatState.loading}
          apiKeyValid={chatState.apiKeyValid}
          onClose={() => setChatOpen(false)}
          onInputChange={chatState.setInput}
          onSendMessage={handleSendMessage}
          onClearConversation={chatState.clearConversation}
        />
      </div>

      {/* Settings Modal */}
      <SettingsPanel
        isOpen={settingsOpen}
        darkMode={darkMode}
        llmProvider={chatState.llmProvider}
        apiKey={chatState.apiKey}
        modelName={chatState.modelName}
        apiKeyValid={chatState.apiKeyValid}
        validating={chatState.validating}
        onClose={() => setSettingsOpen(false)}
        onToggleDarkMode={toggleDarkMode}
        onProviderChange={chatState.setLlmProvider}
        onApiKeyChange={chatState.setApiKey}
        onModelChange={chatState.setModelName}
        onValidateApiKey={chatState.validateApiKey}
        onDeleteApiKey={chatState.deleteApiKey}
      />

      {/* Text Selection Menu */}
      <TextSelectionMenu
        selectedText={textSelection.selectedText}
        darkMode={darkMode}
        onAskAI={handleAskAI}
        onTranslate={handleTranslate}
        onExplain={handleExplain}
        onClose={textSelection.clearSelection}
      />
    </div>
  );
};

export default PDFStudyApp;
