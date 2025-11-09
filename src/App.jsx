import React, { useState, useRef, useEffect } from 'react';
import { Upload, MessageSquare, Send, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Copy, Check, Settings, CheckCircle, XCircle, RotateCw, Search, Download, Printer, Menu, Home, FileText, Bookmark, Maximize2, Minimize2, BookOpen, File, LayoutGrid, HelpCircle } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const PDFStudyApp = () => {
  // Refs primeiro
  const canvasRef = useRef(null);
  const canvas2Ref = useRef(null);
  const textLayerRef = useRef(null);
  const textLayer2Ref = useRef(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const containerRef = useRef(null);
  // Estados do PDF
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [rotation, setRotation] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const [pageTextContent, setPageTextContent] = useState('');
  const [scrollMode, setScrollMode] = useState('page');
  const [pageMode, setPageMode] = useState('single');
  
  // Estados de UI
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [leftSidebarTab, setLeftSidebarTab] = useState('thumbnails');
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pdf-sage-dark-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [draggingOverViewer, setDraggingOverViewer] = useState(false);
  
  // Estados de chat e IA
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Estados de configuração LLM
  const [llmProvider, setLlmProvider] = useState('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('claude-sonnet-4-20250514');
  const [apiKeyValid, setApiKeyValid] = useState(null);
  const [validating, setValidating] = useState(false);
  
  // Estados de busca e navegação
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  const llmProviders = {
    anthropic: {
      name: 'Anthropic (Claude)',
      defaultModel: 'claude-sonnet-4-20250514',
      models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-3-5-sonnet-20241022'],
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
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
      endpoint: 'https://api.openai.com/v1/chat/completions',
      headers: (key) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      })
    },
    google: {
      name: 'Google (Gemini)',
      defaultModel: 'gemini-1.5-pro',
      models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      headers: () => ({ 'Content-Type': 'application/json' })
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, rotation, pageMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setModelName(llmProviders[llmProvider].defaultModel);
    setApiKeyValid(null);
  }, [llmProvider]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && !e.target.matches('input, textarea')) {
        setCurrentPage(prev => Math.max(1, prev - 1));
      } else if (e.key === 'ArrowRight' && !e.target.matches('input, textarea')) {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
      } else if (e.key === 'Home' && !e.target.matches('input, textarea')) {
        setCurrentPage(1);
      } else if (e.key === 'End' && !e.target.matches('input, textarea')) {
        setCurrentPage(totalPages);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '+') {
        e.preventDefault();
        setScale(prev => Math.min(3, prev + 0.25));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setScale(prev => Math.max(0.5, prev - 0.25));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setScale(1.5);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setChatOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setFullscreen(false);
        setShowKeyboardShortcuts(false);
      } else if (e.key === '?' || e.key === 'F1') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        if (pdfDoc) toggleBookmark();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages, pdfDoc]);

  // Persistir tema escuro no localStorage
  useEffect(() => {
    localStorage.setItem('pdf-sage-dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      try {
        toast.loading('Carregando PDF...', { id: 'pdf-loading' });
        const fileReader = new FileReader();
        fileReader.onload = async (event) => {
          try {
            const typedArray = new Uint8Array(event.target.result);
            const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
            setCurrentPage(1);
            setPageInput('1');
            setPdfFile(file.name);
            await generateThumbnails(pdf);
            toast.dismiss('pdf-loading');
            toast.success(`PDF "${file.name}" carregado com sucesso!`, { duration: 3 });
          } catch (error) {
            toast.dismiss('pdf-loading');
            toast.error('Erro ao carregar PDF. Tente outro arquivo.', { duration: 4 });
            console.error('Erro ao processar PDF:', error);
          }
        };
        fileReader.onerror = () => {
          toast.dismiss('pdf-loading');
          toast.error('Erro ao ler arquivo', { duration: 4 });
        };
        fileReader.readAsArrayBuffer(file);
      } catch (error) {
        toast.error('Erro ao processar arquivo', { duration: 4 });
      }
    } else {
      toast.error('Por favor, selecione um arquivo PDF válido', { duration: 3 });
    }
  };

  // Handler para drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOverViewer(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOverViewer(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOverViewer(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) {
      toast.error('Nenhum arquivo selecionado', { duration: 3 });
      return;
    }

    const file = files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos', { duration: 3 });
      return;
    }

    try {
      toast.loading('Carregando PDF...', { id: 'pdf-loading' });
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        try {
          const typedArray = new Uint8Array(event.target.result);
          const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          setPageInput('1');
          setPdfFile(file.name);
          await generateThumbnails(pdf);
          toast.dismiss('pdf-loading');
          toast.success(`PDF "${file.name}" carregado com sucesso!`, { duration: 3 });
        } catch (error) {
          toast.dismiss('pdf-loading');
          toast.error('Erro ao carregar PDF. Tente outro arquivo.', { duration: 4 });
          console.error('Erro ao processar PDF:', error);
        }
      };
      fileReader.onerror = () => {
        toast.dismiss('pdf-loading');
        toast.error('Erro ao ler arquivo', { duration: 4 });
      };
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      toast.error('Erro ao processar arquivo', { duration: 4 });
    }
  };

  const generateThumbnails = async (pdf) => {
    const thumbs = [];
    const thumbScale = 0.3;
    for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: thumbScale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      thumbs.push({ pageNum: i, dataUrl: canvas.toDataURL() });
    }
    setThumbnails(thumbs);
  };

  const renderPage = async (pageNum) => {
    if (!pdfDoc) return;
    
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale, rotation });
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    
    const textLayerDiv = textLayerRef.current;
    if (textLayerDiv) {
      textLayerDiv.innerHTML = '';
      textLayerDiv.style.width = `${viewport.width}px`;
      textLayerDiv.style.height = `${viewport.height}px`;
      window.pdfjsLib.renderTextLayer({
        textContentSource: textContent,
        container: textLayerDiv,
        viewport: viewport,
        textDivs: []
      });
    }
    
    let pageText2 = '';
    
    if (pageMode === 'double' && pageNum < totalPages) {
      const page2 = await pdfDoc.getPage(pageNum + 1);
      const viewport2 = page2.getViewport({ scale, rotation });
      const canvas2 = canvas2Ref.current;
      const context2 = canvas2.getContext('2d');
      
      canvas2.height = viewport2.height;
      canvas2.width = viewport2.width;
      
      await page2.render({ canvasContext: context2, viewport: viewport2 }).promise;
      
      const textContent2 = await page2.getTextContent();
      pageText2 = textContent2.items.map(item => item.str).join(' ');
      
      const textLayerDiv2 = textLayer2Ref.current;
      if (textLayerDiv2) {
        textLayerDiv2.innerHTML = '';
        textLayerDiv2.style.width = `${viewport2.width}px`;
        textLayerDiv2.style.height = `${viewport2.height}px`;
        window.pdfjsLib.renderTextLayer({
          textContentSource: textContent2,
          container: textLayerDiv2,
          viewport: viewport2,
          textDivs: []
        });
      }
    }
    
    setPageTextContent(pageText + (pageText2 ? '\n\n' + pageText2 : ''));
    setPageInput(pageNum.toString());
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) setSelectedText(text);
  };

  const copyToChat = () => {
    if (selectedText) {
      setInput(prev => prev + (prev ? '\n\n' : '') + `"${selectedText}"`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyValid(false);
      toast.error('Por favor, insira uma API Key', { duration: 3 });
      return;
    }
    setValidating(true);
    setApiKeyValid(null);
    toast.loading('Validando API Key...', { id: 'api-validate' });
    try {
      let isValid = false;
      if (llmProvider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: llmProviders.anthropic.headers(apiKey),
          body: JSON.stringify({
            model: modelName,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }]
          })
        });
        isValid = response.ok;
      } else if (llmProvider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: llmProviders.openai.headers(apiKey)
        });
        isValid = response.ok;
      } else if (llmProvider === 'google') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
          { method: 'GET', headers: llmProviders.google.headers() }
        );
        const data = await response.json();
        isValid = response.ok && data.models && Array.isArray(data.models);
      }
      setApiKeyValid(isValid);
      toast.dismiss('api-validate');
      if (isValid) {
        toast.success('API Key validada com sucesso!', { duration: 3 });
      } else {
        toast.error('API Key inválida. Verifique e tente novamente.', { duration: 4 });
      }
    } catch (error) {
      console.error('Erro ao validar API key:', error);
      setApiKeyValid(false);
      toast.dismiss('api-validate');
      toast.error('Erro ao validar API Key. Verifique sua conexão.', { duration: 4 });
    } finally {
      setValidating(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !apiKey.trim()) {
      if (!apiKey.trim()) {
        toast.error('Por favor, configure sua API Key nas configurações', { duration: 4 });
        setSettingsOpen(true);
      }
      return;
    }

    const contextInfo = `Contexto do Documento:
- PDF: "${pdfFile || 'documento'}"
- Página: ${currentPage} de ${totalPages}
${selectedText ? `- Texto selecionado: "${selectedText}"` : ''}

Conteúdo da página atual:
${pageTextContent.substring(0, 3000)}${pageTextContent.length > 3000 ? '...' : ''}

Responda com base neste contexto.`;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    toast.loading('Enviando mensagem...', { id: 'send-msg' });

    try {
      let assistantContent = '';

      if (llmProvider === 'anthropic') {
        const response = await fetch(llmProviders.anthropic.endpoint, {
          method: 'POST',
          headers: llmProviders.anthropic.headers(apiKey),
          body: JSON.stringify({
            model: modelName,
            max_tokens: 2000,
            messages: [...messages, userMessage, { role: 'user', content: contextInfo }]
          })
        });
        const data = await response.json();
        if (response.ok) {
          assistantContent = data.content[0].text;
        } else {
          throw new Error(data.error?.message || 'Erro ao processar');
        }
      } else if (llmProvider === 'openai') {
        const response = await fetch(llmProviders.openai.endpoint, {
          method: 'POST',
          headers: llmProviders.openai.headers(apiKey),
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: 'system', content: contextInfo }, ...messages, userMessage],
            max_tokens: 2000
          })
        });
        const data = await response.json();
        if (response.ok) {
          assistantContent = data.choices[0].message.content;
        } else {
          throw new Error(data.error?.message || 'Erro ao processar');
        }
      } else if (llmProvider === 'google') {
        const conversationHistory = messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));
        const response = await fetch(
          `${llmProviders.google.endpoint}/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: llmProviders.google.headers(),
            body: JSON.stringify({
              contents: [...conversationHistory, {
                role: 'user',
                parts: [{ text: `${contextInfo}\n\n${input}` }]
              }],
              generationConfig: { maxOutputTokens: 2000 }
            })
          }
        );
        const data = await response.json();
        if (response.ok) {
          assistantContent = data.candidates[0].content.parts[0].text;
        } else {
          throw new Error(data.error?.message || 'Erro ao processar');
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
      toast.dismiss('send-msg');
      toast.success('Resposta recebida!', { duration: 2 });
    } catch (error) {
      console.error('Erro:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Erro: ${error.message}`
      }]);
      toast.dismiss('send-msg');
      toast.error(`Erro ao processar: ${error.message}`, { duration: 4 });
    } finally {
      setLoading(false);
      setSelectedText('');
    }
  };

  const toggleBookmark = () => {
    const exists = bookmarks.includes(currentPage);
    if (exists) {
      setBookmarks(bookmarks.filter(p => p !== currentPage));
      toast.success(`Marcador removido da página ${currentPage}`, { duration: 2 });
    } else {
      setBookmarks([...bookmarks, currentPage].sort((a, b) => a - b));
      toast.success(`Marcador adicionado na página ${currentPage}`, { duration: 2 });
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim() || !pdfDoc) return;

    setSearching(true);
    setSearchResults([]);
    setCurrentSearchIndex(0);
    toast.loading('Buscando no documento...', { id: 'search' });

    const results = [];
    const queryLower = searchQuery.toLowerCase();

    try {
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');

        // Buscar todas as ocorrências na página
        const pageLower = pageText.toLowerCase();
        let index = pageLower.indexOf(queryLower);

        while (index !== -1) {
          // Extrair contexto ao redor da ocorrência
          const start = Math.max(0, index - 50);
          const end = Math.min(pageText.length, index + queryLower.length + 50);
          const snippet = pageText.substring(start, end);

          results.push({
            pageNum,
            index,
            snippet: (start > 0 ? '...' : '') + snippet + (end < pageText.length ? '...' : '')
          });

          index = pageLower.indexOf(queryLower, index + 1);
        }
      }

      setSearchResults(results);

      if (results.length > 0) {
        // Ir para a primeira ocorrência
        setCurrentPage(results[0].pageNum);
        toast.dismiss('search');
        toast.success(`${results.length} resultado${results.length > 1 ? 's' : ''} encontrado${results.length > 1 ? 's' : ''}`, { duration: 3 });
      } else {
        toast.dismiss('search');
        toast.info(`Nenhum resultado encontrado para "${searchQuery}"`, { duration: 3 });
      }
    } catch (error) {
      console.error('Erro ao buscar:', error);
      toast.dismiss('search');
      toast.error('Erro ao realizar busca', { duration: 3 });
    } finally {
      setSearching(false);
    }
  };

  const goToSearchResult = (index) => {
    if (index >= 0 && index < searchResults.length) {
      setCurrentSearchIndex(index);
      setCurrentPage(searchResults[index].pageNum);
    }
  };

  const nextSearchResult = () => {
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    goToSearchResult(nextIndex);
  };

  const prevSearchResult = () => {
    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    goToSearchResult(prevIndex);
  };

  return (
    <>
      <Toaster position="bottom-right" expand={true} />
      <style>{`
        .textLayer {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          opacity: 0.2;
          line-height: 1.0;
        }
        .textLayer span {
          color: transparent;
          position: absolute;
          white-space: pre;
          cursor: text;
          transform-origin: 0% 0%;
        }
        .textLayer ::selection {
          background: rgba(0, 0, 255, 0.3);
        }
      `}</style>
      <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} ${fullscreen ? 'fixed inset-0 z-50' : ''}`} ref={containerRef}>
        {/* Sidebar Esquerda */}
        {leftSidebarOpen && (
          <div className="w-64 bg-white border-r flex flex-col">
            <div className="flex border-b">
              <button
                onClick={() => setLeftSidebarTab('thumbnails')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  leftSidebarTab === 'thumbnails' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
                }`}
              >
                <FileText size={16} className="inline mr-2" />
                Páginas
              </button>
              <button
                onClick={() => setLeftSidebarTab('bookmarks')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  leftSidebarTab === 'bookmarks' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
                }`}
              >
                <Bookmark size={16} className="inline mr-2" />
                Marcadores
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {leftSidebarTab === 'thumbnails' && (
                <div className="space-y-2">
                  {thumbnails.map((thumb) => (
                    <button
                      key={thumb.pageNum}
                      onClick={() => setCurrentPage(thumb.pageNum)}
                      className={`w-full p-2 border rounded hover:border-blue-500 ${
                        currentPage === thumb.pageNum ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <img src={thumb.dataUrl} alt={`Página ${thumb.pageNum}`} className="w-full" />
                      <div className="text-xs text-center mt-1">Página {thumb.pageNum}</div>
                    </button>
                  ))}
                </div>
              )}
              {leftSidebarTab === 'bookmarks' && (
                <div className="space-y-1">
                  {bookmarks.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <Bookmark size={32} className="mx-auto mb-2 opacity-50" />
                      Nenhum marcador
                    </div>
                  ) : (
                    bookmarks.map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-full p-3 text-left border rounded hover:bg-blue-50 flex items-center justify-between"
                      >
                        <span>Página {pageNum}</span>
                        <Bookmark size={16} className="text-blue-600" fill="currentColor" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Área Central */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white shadow-sm border-b px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className="p-2 rounded hover:bg-gray-100">
                <Menu size={20} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <Upload size={18} />
                Abrir
              </button>
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
              {pdfFile && (
                <button onClick={() => window.print()} className="p-2 rounded hover:bg-gray-100">
                  <Printer size={20} />
                </button>
              )}
            </div>

            {pdfDoc && (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Home size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <input
                    type="text"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const pageNum = parseInt(pageInput);
                        if (pageNum >= 1 && pageNum <= totalPages) setCurrentPage(pageNum);
                        else setPageInput(currentPage.toString());
                      }
                    }}
                    className="w-16 px-2 py-1 text-center border rounded"
                  />
                  <span className="text-sm text-gray-600">/ {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setScale(Math.max(0.5, scale - 0.25))} className="p-2 rounded hover:bg-gray-100">
                    <ZoomOut size={20} />
                  </button>
                  <select
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="0.5">50%</option>
                    <option value="0.75">75%</option>
                    <option value="1">100%</option>
                    <option value="1.5">150%</option>
                    <option value="2">200%</option>
                    <option value="3">300%</option>
                  </select>
                  <button onClick={() => setScale(Math.min(3, scale + 0.25))} className="p-2 rounded hover:bg-gray-100">
                    <ZoomIn size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-2 border-l pl-2">
                  <button onClick={() => setRotation((rotation + 90) % 360)} className="p-2 rounded hover:bg-gray-100" title="Rotacionar">
                    <RotateCw size={20} />
                  </button>
                  
                  {/* Modo de Página */}
                  <div className="flex border rounded">
                    <button
                      onClick={() => setPageMode('single')}
                      className={`p-2 ${pageMode === 'single' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                      title="Página Única"
                    >
                      <File size={20} />
                    </button>
                    <button
                      onClick={() => setPageMode('double')}
                      className={`p-2 border-l ${pageMode === 'double' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                      title="Duas Páginas (Modo Livro)"
                    >
                      <BookOpen size={20} />
                    </button>
                  </div>
                  
                  <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded hover:bg-gray-100" title="Buscar">
                    <Search size={20} />
                  </button>
                  <button
                    onClick={toggleBookmark}
                    className={`p-2 rounded hover:bg-gray-100 ${bookmarks.includes(currentPage) ? 'text-blue-600' : ''}`}
                    title="Marcador"
                  >
                    <Bookmark size={20} fill={bookmarks.includes(currentPage) ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => setFullscreen(!fullscreen)} className="p-2 rounded hover:bg-gray-100" title="Tela Cheia">
                    {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                </div>
              </>
            )}

            <div className="flex items-center gap-2 border-l pl-2">
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Atalhos de teclado (? ou F1)"
              >
                <HelpCircle size={20} />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title={`Modo ${darkMode ? 'claro' : 'escuro'}`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
              >
                <MessageSquare size={18} />
                Chat IA
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="bg-yellow-50 border-b px-4 py-3">
              <div className="flex items-center gap-3 mb-3">
                <Search size={18} className="text-gray-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      performSearch();
                    }
                  }}
                  placeholder="Buscar no documento..."
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  autoFocus
                />
                <button 
                  onClick={performSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {searching ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    'Buscar'
                  )}
                </button>
                <button onClick={() => {
                  setSearchOpen(false);
                  setSearchResults([]);
                  setSearchQuery('');
                }} className="p-2 hover:bg-gray-200 rounded">
                  <X size={18} />
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="flex items-center justify-between bg-white rounded p-2 border">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevSearchResult}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Resultado Anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-medium">
                      {currentSearchIndex + 1} de {searchResults.length} resultados
                    </span>
                    <button
                      onClick={nextSearchResult}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Próximo Resultado"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 max-w-md truncate">
                    {searchResults[currentSearchIndex]?.snippet}
                  </div>
                </div>
              )}
              
              {!searching && searchQuery && searchResults.length === 0 && (
                <div className="text-sm text-gray-600 bg-white rounded p-2 border">
                  Nenhum resultado encontrado para "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {/* Área de Visualização */}
          <div
            className={`flex-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} p-8 overflow-auto transition-colors duration-200 ${draggingOverViewer ? (darkMode ? 'bg-blue-900/30 border-2 border-blue-500' : 'bg-blue-100 border-2 border-blue-400') : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!pdfDoc ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Upload size={64} className="mb-4" />
                <p className="text-xl font-semibold mb-2">Faça upload de um PDF para começar</p>
                <p className="text-sm text-gray-400">Arraste e solte ou clique em "Abrir"</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className={`flex ${pageMode === 'double' ? 'gap-4' : ''}`}>
                    <div className="bg-white shadow-2xl relative">
                      <canvas ref={canvasRef} className="max-w-full block" />
                      <div ref={textLayerRef} className="textLayer" onMouseUp={handleTextSelection} />
                    </div>
                    {pageMode === 'double' && currentPage < totalPages && (
                      <div className="bg-white shadow-2xl relative">
                        <canvas ref={canvas2Ref} className="max-w-full block" />
                        <div ref={textLayer2Ref} className="textLayer" onMouseUp={handleTextSelection} />
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedText && (
                  <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white shadow-xl rounded-lg p-4 flex items-center gap-3 border-2 border-purple-200 z-30">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={copyToChat}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                      >
                        {copied ? <Check size={16} /> : <MessageSquare size={16} />}
                        {copied ? 'Copiado!' : 'Enviar para Chat'}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedText);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                      >
                        <Copy size={16} />
                        Copiar Texto
                      </button>
                    </div>
                    <button onClick={() => setSelectedText('')} className="p-2 hover:bg-gray-100 rounded">
                      <X size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {pdfDoc && (
            <div className="bg-white border-t px-4 py-2 text-sm text-gray-600 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>📄 {pdfFile}</span>
                <span>•</span>
                <span>Página {currentPage}{pageMode === 'double' && currentPage < totalPages ? `-${currentPage + 1}` : ''} de {totalPages}</span>
                <span>•</span>
                <span>Zoom: {Math.round(scale * 100)}%</span>
                {pageMode === 'double' && (
                  <>
                    <span>•</span>
                    <span>📖 Modo Livro</span>
                  </>
                )}
              </div>
              {bookmarks.length > 0 && (
                <span className="flex items-center gap-1">
                  <Bookmark size={14} />
                  {bookmarks.length} marcadores
                </span>
              )}
            </div>
          )}
        </div>

        {/* Modal de Configurações */}
        {settingsOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Settings size={24} />
                  Configurações de LLM
                </h2>
                <button onClick={() => setSettingsOpen(false)} className="p-2 hover:bg-gray-100 rounded">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Provedor</label>
                  <select
                    value={llmProvider}
                    onChange={(e) => setLlmProvider(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  >
                    {Object.entries(llmProviders).map(([key, provider]) => (
                      <option key={key} value={key}>{provider.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Modelo</label>
                  <select
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  >
                    {llmProviders[llmProvider].models.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Ou digite um modelo personalizado"
                    className="w-full p-3 border rounded-lg mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setApiKeyValid(null);
                      }}
                      placeholder="Insira sua API Key"
                      className="flex-1 p-3 border rounded-lg"
                    />
                    <button
                      onClick={validateApiKey}
                      disabled={validating || !apiKey.trim()}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {validating ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Validando...
                        </>
                      ) : (
                        'Validar'
                      )}
                    </button>
                  </div>
                  {apiKeyValid === true && (
                    <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                      <CheckCircle size={16} />
                      API Key válida!
                    </div>
                  )}
                  {apiKeyValid === false && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <XCircle size={16} />
                      API Key inválida
                    </div>
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Como obter sua API Key:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {llmProvider === 'anthropic' && (
                      <li>• Acesse: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">console.anthropic.com</a></li>
                    )}
                    {llmProvider === 'openai' && (
                      <li>• Acesse: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/api-keys</a></li>
                    )}
                    {llmProvider === 'google' && (
                      <li>• Acesse: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">aistudio.google.com/app/apikey</a></li>
                    )}
                    <li>• Crie uma conta ou faça login</li>
                    <li>• Gere uma nova API Key</li>
                    <li>• Cole a chave acima e clique em "Validar"</li>
                  </ul>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Atalhos de Teclado */}
        {showKeyboardShortcuts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <HelpCircle size={24} />
                  Atalhos de Teclado
                </h2>
                <button onClick={() => setShowKeyboardShortcuts(false)} className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Navegação */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    📄 Navegação
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Próxima página</span>
                      <kbd className={`px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>→</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Página anterior</span>
                      <kbd className={`px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>←</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Primeira página</span>
                      <kbd className={`px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Home</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Última página</span>
                      <kbd className={`px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>End</kbd>
                    </div>
                  </div>
                </div>

                {/* Zoom */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    🔍 Zoom
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Aumentar zoom</span>
                      <kbd className={`px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl +</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Diminuir zoom</span>
                      <kbd className={`px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl -</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Zoom padrão (150%)</span>
                      <kbd className={`px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl 0</kbd>
                    </div>
                  </div>
                </div>

                {/* Busca e Ferramentas */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    🔎 Busca e Ferramentas
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Abrir busca</span>
                      <kbd className={`px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl F</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Abrir chat IA</span>
                      <kbd className={`px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl K</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Adicionar/remover marcador</span>
                      <kbd className={`px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Ctrl B</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Girar página</span>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Clique no botão 🔄</span>
                    </div>
                  </div>
                </div>

                {/* Geral */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    ⚙️ Geral
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sair da busca / Sair de tela cheia</span>
                      <kbd className={`px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>Esc</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Mostrar este painel</span>
                      <kbd className={`px-2 py-1 rounded font-mono text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>? ou F1</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="w-full mt-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Painel do Chat */}
        {chatOpen && (
          <div className={`w-96 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-2xl flex flex-col border-l`}>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={24} />
                <div>
                  <h2 className="text-lg font-semibold">Assistente IA</h2>
                  <p className="text-xs opacity-90">{llmProviders[llmProvider].name}</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/20 rounded">
                <X size={20} />
              </button>
            </div>

            {messages.length === 0 && pdfDoc && (
              <div className="p-4 border-b bg-gray-50">
                <p className="text-xs font-semibold text-gray-700 mb-2">Sugestões:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setInput('Resuma esta página')}
                    className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
                  >
                    📝 Resumir página
                  </button>
                  <button
                    onClick={() => setInput('Explique os conceitos principais desta página')}
                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                  >
                    💡 Explicar conceitos
                  </button>
                  <button
                    onClick={() => setInput('Crie perguntas de estudo sobre este conteúdo')}
                    className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                  >
                    ❓ Criar quiz
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Comece uma conversa!</p>
                  <p className="text-sm mt-2">Selecione texto no PDF ou use as sugestões acima</p>
                  {!apiKey && (
                    <button
                      onClick={() => setSettingsOpen(true)}
                      className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Configurar API Key
                    </button>
                  )}
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 border border-gray-200 p-3 rounded-lg flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-purple-600" />
                    <span className="text-sm text-gray-600">Pensando...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t bg-gray-50">
              {pdfFile && (
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <FileText size={12} />
                  Página {currentPage} de {totalPages} - {pdfFile}
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 p-3 border rounded-lg resize-none"
                  rows={3}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading || !apiKey}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Shift + Enter para nova linha | Enter para enviar
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PDFStudyApp;