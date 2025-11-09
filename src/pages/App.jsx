import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MessageSquare, Send, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Copy, Check, Settings, CheckCircle, XCircle, RotateCw, Search, Printer, Menu, Home, FileText, Bookmark, Maximize2, Minimize2, BookOpen, File, HelpCircle, LogOut } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import {
  saveApiKey,
  getApiKey,
  saveDocument,
  updateBookmarks,
  saveConversation,
  getConversation
} from '../services/firestore.service';

const PDFStudyApp = () => {
  // Auth e navegação
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
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

  // Carregar API Key do Firestore quando o componente montar
  useEffect(() => {
    if (currentUser && llmProvider) {
      const loadApiKey = async () => {
        try {
          const keyData = await getApiKey(currentUser.uid, llmProvider);
          if (keyData) {
            setApiKey(keyData.apiKey);
            setModelName(keyData.modelName || llmProviders[llmProvider].defaultModel);
            setApiKeyValid(true);
          }
        } catch (error) {
          console.error('Erro ao carregar API Key do Firestore:', error);
        }
      };
      loadApiKey();
    }
  }, [currentUser, llmProvider]);

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

  // Função para toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Entrar em fullscreen
      containerRef.current?.requestFullscreen()
        .then(() => setFullscreen(true))
        .catch(err => {
          console.error('Erro ao entrar em fullscreen:', err);
          toast.error('Não foi possível ativar tela cheia', { duration: 2 });
        });
    } else {
      // Sair de fullscreen
      document.exitFullscreen()
        .then(() => setFullscreen(false))
        .catch(err => {
          console.error('Erro ao sair de fullscreen:', err);
        });
    }
  };

  // Listener para quando usuário sai do fullscreen com ESC
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
        // Salvar API Key no Firestore
        if (currentUser) {
          try {
            await saveApiKey(currentUser.uid, llmProvider, apiKey, modelName);
            toast.success('API Key validada e salva com sucesso!', { duration: 3 });
          } catch (error) {
            console.error('Erro ao salvar API Key no Firestore:', error);
            toast.error('API Key validada, mas erro ao salvar. Tente novamente.', { duration: 4 });
          }
        }
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
  
  const clearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm('Tem certeza que deseja limpar todas as mensagens?')) {
      setMessages([]);
      toast.success('Chat limpo!', { duration: 2 });
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
          if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
            throw new Error('Resposta vazia da API Anthropic');
          }
          assistantContent = data.content[0]?.text;
          if (!assistantContent) {
            throw new Error('Formato de resposta inválido do Anthropic');
          }
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
          if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
            throw new Error('Resposta vazia da API OpenAI');
          }
          assistantContent = data.choices[0]?.message?.content;
          if (!assistantContent) {
            throw new Error('Formato de resposta inválido do OpenAI');
          }
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
          if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
            throw new Error('Resposta vazia da API Google Gemini');
          }
          const candidate = data.candidates[0];
          if (!candidate?.content?.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
            throw new Error('Formato de resposta inválido do Google Gemini');
          }
          assistantContent = candidate.content.parts[0]?.text;
          if (!assistantContent) {
            throw new Error('Texto não encontrado na resposta do Google Gemini');
          }
        } else {
          throw new Error(data.error?.message || 'Erro ao processar');
        }
      }

      const newMessages = [...messages, userMessage, { role: 'assistant', content: assistantContent }];
      setMessages(newMessages);
      toast.dismiss('send-msg');
      toast.success('Resposta recebida!', { duration: 2 });

      // Salvar conversa no Firestore
      if (currentUser && pdfFile) {
        try {
          const documentId = pdfFile.replace(/\.[^/.]+$/, ''); // Remove extensão
          await saveConversation(currentUser.uid, documentId, newMessages);
        } catch (error) {
          console.error('Erro ao salvar conversa no Firestore:', error);
        }
      }
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

  const toggleBookmark = async () => {
    const exists = bookmarks.includes(currentPage);
    const newBookmarks = exists
      ? bookmarks.filter(p => p !== currentPage)
      : [...bookmarks, currentPage].sort((a, b) => a - b);

    setBookmarks(newBookmarks);

    // Salvar no Firestore
    if (currentUser && pdfFile) {
      try {
        const documentId = pdfFile.replace(/\.[^/.]+$/, ''); // Remove extensão
        await updateBookmarks(currentUser.uid, documentId, newBookmarks);
        toast.success(
          exists
            ? `Marcador removido da página ${currentPage}`
            : `Marcador adicionado na página ${currentPage}`,
          { duration: 2 }
        );
      } catch (error) {
        console.error('Erro ao salvar marcador:', error);
        toast.error('Erro ao salvar marcador', { duration: 2 });
      }
    } else {
      toast.success(
        exists
          ? `Marcador removido da página ${currentPage}`
          : `Marcador adicionado na página ${currentPage}`,
        { duration: 2 }
      );
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
          background: rgba(59, 130, 246, 0.3);
        }

        /* Scrollbar customizada */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        ::-webkit-scrollbar-track {
          background: rgb(243 244 246);
          border-radius: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgb(156 163 175);
          border-radius: 6px;
          border: 2px solid rgb(243 244 246);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgb(107 114 128);
        }
        .dark ::-webkit-scrollbar-track {
          background: rgb(31 41 55);
        }
        .dark ::-webkit-scrollbar-thumb {
          background: rgb(75 85 99);
          border-color: rgb(31 41 55);
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background: rgb(107 114 128);
        }
      `}</style>
      <div className={`flex h-screen ${darkMode ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20'} ${fullscreen ? 'fixed inset-0 z-50' : ''} transition-colors duration-300`} ref={containerRef}>
        {/* Sidebar Esquerda */}
        {leftSidebarOpen && (
          <div className={`w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col shadow-xl transition-colors duration-300`}>
            <div className={`flex ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
              <button
                onClick={() => setLeftSidebarTab('thumbnails')}
                className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  leftSidebarTab === 'thumbnails'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                    : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
                }`}
              >
                <FileText size={18} className="inline mr-2" />
                Páginas
              </button>
              <button
                onClick={() => setLeftSidebarTab('bookmarks')}
                className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  leftSidebarTab === 'bookmarks'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md'
                    : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
                }`}
              >
                <Bookmark size={18} className="inline mr-2" />
                Marcadores
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {leftSidebarTab === 'thumbnails' && (
                <div className="space-y-3">
                  {thumbnails.map((thumb) => (
                    <button
                      key={thumb.pageNum}
                      onClick={() => setCurrentPage(thumb.pageNum)}
                      className={`group w-full p-3 border-2 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg ${
                        currentPage === thumb.pageNum
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md ring-2 ring-blue-200'
                          : `${darkMode ? 'border-gray-600 bg-gray-700 hover:border-blue-400 hover:bg-gray-600' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'}`
                      }`}
                    >
                      <img src={thumb.dataUrl} alt={`Página ${thumb.pageNum}`} className="w-full rounded-lg shadow-sm" />
                      <div className={`text-sm font-medium text-center mt-2 ${currentPage === thumb.pageNum ? 'text-blue-700' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Página {thumb.pageNum}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {leftSidebarTab === 'bookmarks' && (
                <div className="space-y-2">
                  {bookmarks.length === 0 ? (
                    <div className={`text-center text-sm py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Bookmark size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Nenhum marcador</p>
                      <p className="text-xs mt-1 opacity-75">Pressione Ctrl+B para adicionar</p>
                    </div>
                  ) : (
                    bookmarks.map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`group w-full p-4 text-left border-2 rounded-xl transition-all duration-200 flex items-center justify-between hover:shadow-lg transform hover:scale-[1.02] ${
                          currentPage === pageNum
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 shadow-md'
                            : `${darkMode ? 'border-gray-600 bg-gray-700 hover:border-purple-400 hover:bg-gray-600' : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'}`
                        }`}
                      >
                        <span className={`font-semibold ${currentPage === pageNum ? 'text-purple-700' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Página {pageNum}
                        </span>
                        <Bookmark size={18} className={currentPage === pageNum ? 'text-purple-600' : 'text-purple-500'} fill="currentColor" />
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
          <div className={`${darkMode ? 'bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 border-gray-700' : 'bg-gradient-to-r from-white via-blue-50/30 to-purple-50/20 border-gray-200'} shadow-lg border-b px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap backdrop-blur-sm transition-colors duration-300`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                className={`p-2.5 rounded-xl transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`}
                title="Toggle Sidebar"
              >
                <Menu size={20} />
              </button>
              <div className={`h-8 w-px ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Upload size={18} />
                Abrir PDF
              </button>
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
              {pdfFile && (
                <button
                  onClick={() => window.print()}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`}
                  title="Imprimir"
                >
                  <Printer size={20} />
                </button>
              )}
            </div>

            {pdfDoc && (
              <>
                <div className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700/50' : 'bg-white/80'} px-3 py-1.5 rounded-xl shadow-sm backdrop-blur-sm`}>
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      currentPage === 1
                        ? 'opacity-40 cursor-not-allowed'
                        : `${darkMode ? 'hover:bg-gray-600 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`
                    }`}
                    title="Primeira página"
                  >
                    <Home size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      currentPage === 1
                        ? 'opacity-40 cursor-not-allowed'
                        : `${darkMode ? 'hover:bg-gray-600 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`
                    }`}
                    title="Página anterior"
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
                    className={`w-16 px-3 py-1.5 text-center border-2 rounded-lg font-semibold transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>/ {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'opacity-40 cursor-not-allowed'
                        : `${darkMode ? 'hover:bg-gray-600 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`
                    }`}
                    title="Próxima página"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700/50' : 'bg-white/80'} px-3 py-1.5 rounded-xl shadow-sm backdrop-blur-sm`}>
                  <button
                    onClick={() => setScale(Math.max(0.5, scale - 0.25))}
                    className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-gray-600 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`}
                    title="Diminuir zoom"
                  >
                    <ZoomOut size={20} />
                  </button>
                  <select
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className={`px-3 py-1.5 border-2 rounded-lg text-sm font-semibold transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="0.5">50%</option>
                    <option value="0.75">75%</option>
                    <option value="1">100%</option>
                    <option value="1.5">150%</option>
                    <option value="2">200%</option>
                    <option value="3">300%</option>
                  </select>
                  <button
                    onClick={() => setScale(Math.min(3, scale + 0.25))}
                    className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-gray-600 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`}
                    title="Aumentar zoom"
                  >
                    <ZoomIn size={20} />
                  </button>
                </div>

                <div className={`flex items-center gap-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'} border-l pl-3`}>
                  <button
                    onClick={() => setRotation((rotation + 90) % 360)}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`}
                    title="Rotacionar página"
                  >
                    <RotateCw size={20} />
                  </button>

                  {/* Modo de Página */}
                  <div className={`flex border-2 rounded-xl overflow-hidden shadow-sm ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <button
                      onClick={() => setPageMode('single')}
                      className={`p-2.5 transition-all duration-200 ${
                        pageMode === 'single'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm'
                          : `${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600'}`
                      }`}
                      title="Página Única"
                    >
                      <File size={20} />
                    </button>
                    <button
                      onClick={() => setPageMode('double')}
                      className={`p-2.5 border-l transition-all duration-200 ${
                        pageMode === 'double'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm'
                          : `${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white border-gray-600' : 'hover:bg-gray-100 text-gray-600 border-gray-300'}`
                      }`}
                      title="Duas Páginas (Modo Livro)"
                    >
                      <BookOpen size={20} />
                    </button>
                  </div>

                  <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${
                      searchOpen
                        ? 'bg-yellow-500 text-white shadow-md'
                        : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`
                    }`}
                    title="Buscar no documento"
                  >
                    <Search size={20} />
                  </button>
                  <button
                    onClick={toggleBookmark}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${
                      bookmarks.includes(currentPage)
                        ? 'bg-purple-500 text-white shadow-md'
                        : `${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`
                    }`}
                    title="Adicionar/remover marcador"
                  >
                    <Bookmark size={20} fill={bookmarks.includes(currentPage) ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className={`p-2.5 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`}
                    title={fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                  >
                    {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                </div>
              </>
            )}

            <div className={`flex items-center gap-3 ${darkMode ? 'border-gray-600' : 'border-gray-300'} border-l pl-3`}>
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className={`p-2.5 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`}
                title="Atalhos de teclado (? ou F1)"
              >
                <HelpCircle size={20} />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-lg transition-all duration-200 text-2xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title={`Modo ${darkMode ? 'claro' : 'escuro'}`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <div className={`h-8 w-px ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl hover:from-gray-700 hover:to-gray-600 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                title="Configurações"
              >
                <Settings size={18} />
                Config
              </button>
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                title="Abrir chat IA"
              >
                <MessageSquare size={18} />
                Chat IA
              </button>
              <button
                onClick={async () => {
                  try {
                    await logout();
                    navigate('/login');
                  } catch (error) {
                    console.error('Erro ao fazer logout:', error);
                    toast.error('Erro ao fazer logout', { duration: 3 });
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                title="Fazer logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className={`${darkMode ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-800' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'} border-b px-5 py-4 shadow-lg backdrop-blur-sm transition-colors duration-300`}>
              <div className="flex items-center gap-3 mb-3">
                <Search size={20} className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
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
                  className={`flex-1 px-4 py-2.5 border-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-500 ${
                    darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-yellow-300 text-gray-900 placeholder-gray-500'
                  }`}
                  autoFocus
                />
                <button
                  onClick={performSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                  className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-yellow-200 text-gray-700'}`}
                >
                  <X size={20} />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className={`flex items-center justify-between rounded-xl p-3 border-2 shadow-md ${
                  darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-yellow-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevSearchResult}
                      className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      title="Resultado Anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {currentSearchIndex + 1} de {searchResults.length} resultados
                    </span>
                    <button
                      onClick={nextSearchResult}
                      className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      title="Próximo Resultado"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className={`text-xs max-w-md truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {searchResults[currentSearchIndex]?.snippet}
                  </div>
                </div>
              )}

              {!searching && searchQuery && searchResults.length === 0 && (
                <div className={`text-sm font-medium rounded-xl p-3 border-2 ${
                  darkMode ? 'text-gray-400 bg-gray-800 border-gray-600' : 'text-gray-600 bg-white border-yellow-300'
                }`}>
                  Nenhum resultado encontrado para "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {/* Área de Visualização */}
          <div
            className={`flex-1 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50/20'} p-8 overflow-auto transition-all duration-300 ${
              draggingOverViewer
                ? (darkMode ? 'bg-blue-900/40 border-4 border-blue-500 border-dashed' : 'bg-blue-100 border-4 border-blue-500 border-dashed')
                : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!pdfDoc ? (
              <div className={`flex flex-col items-center justify-center h-full ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className={`p-8 rounded-3xl mb-6 ${darkMode ? 'bg-gray-800/50' : 'bg-white/70'} shadow-2xl backdrop-blur-sm`}>
                  <Upload size={80} className={`mb-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <p className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Faça upload de um PDF para começar
                </p>
                <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Arraste e solte ou clique em "Abrir PDF"
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className={`flex ${pageMode === 'double' ? 'gap-6' : ''}`}>
                    <div className="bg-white shadow-2xl relative rounded-lg overflow-hidden ring-4 ring-gray-300/20 hover:ring-blue-400/40 transition-all duration-300">
                      <canvas ref={canvasRef} className="max-w-full block" />
                      <div ref={textLayerRef} className="textLayer" onMouseUp={handleTextSelection} />
                    </div>
                    {pageMode === 'double' && currentPage < totalPages && (
                      <div className="bg-white shadow-2xl relative rounded-lg overflow-hidden ring-4 ring-gray-300/20 hover:ring-blue-400/40 transition-all duration-300">
                        <canvas ref={canvas2Ref} className="max-w-full block" />
                        <div ref={textLayer2Ref} className="textLayer" onMouseUp={handleTextSelection} />
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedText && (
                  <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white shadow-2xl rounded-2xl p-5 flex items-center gap-4 border-2 border-purple-300 z-30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={copyToChat}
                        className="flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        {copied ? <Check size={18} /> : <MessageSquare size={18} />}
                        {copied ? 'Copiado!' : 'Enviar para Chat'}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedText);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl hover:from-gray-700 hover:to-gray-600 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        <Copy size={18} />
                        Copiar Texto
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedText('')}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {pdfDoc && (
            <div className={`${darkMode ? 'bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 border-gray-700 text-gray-300' : 'bg-gradient-to-r from-white via-blue-50/20 to-purple-50/10 border-gray-200 text-gray-700'} border-t px-4 py-2.5 text-sm font-medium flex items-center justify-between shadow-lg backdrop-blur-sm transition-colors duration-300`}>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 font-semibold">
                  <File size={16} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                  {pdfFile}
                </span>
                <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>•</span>
                <span className="font-semibold">
                  Página {currentPage}{pageMode === 'double' && currentPage < totalPages ? `-${currentPage + 1}` : ''} de {totalPages}
                </span>
                <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>•</span>
                <span className="font-semibold">
                  Zoom: {Math.round(scale * 100)}%
                </span>
                {pageMode === 'double' && (
                  <>
                    <span className={darkMode ? 'text-gray-600' : 'text-gray-400'}>•</span>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <BookOpen size={16} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                      Modo Livro
                    </span>
                  </>
                )}
              </div>
              {bookmarks.length > 0 && (
                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold ${
                  darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                }`}>
                  <Bookmark size={16} fill="currentColor" />
                  {bookmarks.length} marcador{bookmarks.length > 1 ? 'es' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Modal de Configurações */}
        {settingsOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto border-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} animate-in slide-in-from-bottom-4 duration-300`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-3xl font-bold flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white shadow-lg">
                    <Settings size={28} />
                  </div>
                  Configurações de LLM
                </h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-7">
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Provedor de IA
                  </label>
                  <select
                    value={llmProvider}
                    onChange={(e) => setLlmProvider(e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {Object.entries(llmProviders).map(([key, provider]) => (
                      <option key={key} value={key}>{provider.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Modelo
                  </label>
                  <select
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
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
                    className={`w-full p-4 border-2 rounded-xl mt-3 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    API Key
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setApiKeyValid(null);
                      }}
                      placeholder="Insira sua API Key"
                      className={`flex-1 p-4 border-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <button
                      onClick={validateApiKey}
                      disabled={validating || !apiKey.trim()}
                      className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
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
                    <div className="flex items-center gap-2 mt-3 text-green-600 text-sm font-semibold bg-green-50 px-4 py-2 rounded-xl">
                      <CheckCircle size={18} />
                      API Key válida e salva com sucesso!
                    </div>
                  )}
                  {apiKeyValid === false && (
                    <div className="flex items-center gap-2 mt-3 text-red-600 text-sm font-semibold bg-red-50 px-4 py-2 rounded-xl">
                      <XCircle size={18} />
                      API Key inválida. Verifique e tente novamente.
                    </div>
                  )}
                </div>
                <div className={`border-2 rounded-xl p-5 ${
                  darkMode
                    ? 'bg-blue-900/20 border-blue-800'
                    : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
                }`}>
                  <h3 className={`font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    <HelpCircle size={20} />
                    Como obter sua API Key:
                  </h3>
                  <ul className={`text-sm space-y-2 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                    {llmProvider === 'anthropic' && (
                      <li>• Acesse: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-600">console.anthropic.com</a></li>
                    )}
                    {llmProvider === 'openai' && (
                      <li>• Acesse: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-600">platform.openai.com/api-keys</a></li>
                    )}
                    {llmProvider === 'google' && (
                      <li>• Acesse: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-600">aistudio.google.com/app/apikey</a></li>
                    )}
                    <li>• Crie uma conta ou faça login</li>
                    <li>• Gere uma nova API Key</li>
                    <li>• Cole a chave acima e clique em "Validar"</li>
                  </ul>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Atalhos de Teclado */}
        {showKeyboardShortcuts && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto border-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} animate-in slide-in-from-bottom-4 duration-300`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-3xl font-bold flex items-center gap-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white shadow-lg">
                    <HelpCircle size={28} />
                  </div>
                  Atalhos de Teclado
                </h2>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Navegação */}
                <div className={`p-5 rounded-xl border-2 ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'}`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    <FileText size={22} />
                    Navegação
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Próxima página</span>
                      <kbd className={`px-3 py-2 rounded-lg font-mono font-bold shadow-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>→</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Página anterior</span>
                      <kbd className={`px-3 py-2 rounded-lg font-mono font-bold shadow-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>←</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Primeira página</span>
                      <kbd className={`px-3 py-2 rounded-lg font-mono font-bold shadow-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>Home</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Última página</span>
                      <kbd className={`px-3 py-2 rounded-lg font-mono font-bold shadow-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>End</kbd>
                    </div>
                  </div>
                </div>

                {/* Zoom */}
                <div className={`p-5 rounded-xl border-2 ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'}`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-green-300' : 'text-green-900'}`}>
                    <Search size={22} />
                    Zoom
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Aumentar zoom</span>
                      <kbd className={`px-3 py-2 rounded-lg font-mono font-bold shadow-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>Ctrl +</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Diminuir zoom</span>
                      <kbd className={`px-3 py-2 rounded-lg font-mono font-bold shadow-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>Ctrl -</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Zoom padrão (150%)</span>
                      <kbd className={`px-3 py-2 rounded-lg font-mono font-bold shadow-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>Ctrl 0</kbd>
                    </div>
                  </div>
                </div>

                {/* Busca e Ferramentas */}
                <div className={`p-5 rounded-xl border-2 ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'}`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-purple-300' : 'text-purple-900'}`}>
                    <Settings size={22} />
                    Busca e Ferramentas
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Abrir busca</span>
                      <kbd className={`px-3 py-2 rounded-lg font-mono font-bold shadow-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>Ctrl F</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Abrir chat IA</span>
                      <kbd className={`px-3 py-2 rounded-lg font-mono font-bold shadow-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>Ctrl K</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Adicionar/remover marcador</span>
                      <kbd className={`px-3 py-2 rounded-lg font-mono font-bold shadow-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>Ctrl B</kbd>
                    </div>
                  </div>
                </div>

                {/* Geral */}
                <div className={`p-5 rounded-xl border-2 ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'}`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-orange-300' : 'text-orange-900'}`}>
                    <HelpCircle size={22} />
                    Geral
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Sair da busca / Sair de tela cheia</span>
                      <kbd className={`px-3 py-2 rounded-lg font-mono font-bold shadow-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>Esc</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Mostrar este painel</span>
                      <kbd className={`px-3 py-2 rounded-lg font-mono font-bold shadow-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}>? ou F1</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="w-full mt-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Painel do Chat */}
        {chatOpen && (
          <div className={`w-96 ${darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900 text-white border-gray-700' : 'bg-white border-gray-200'} shadow-2xl flex flex-col border-l-2 transition-colors duration-300`}>
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white p-5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <MessageSquare size={26} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Assistente IA</h2>
                  <p className="text-sm opacity-95 font-medium">{llmProviders[llmProvider].name}</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <X size={22} />
              </button>
            </div>

            {/* Controles do Chat - Modelo e Limpar */}
            <div className={`p-4 border-b flex items-center gap-3 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              {/* Select de Modelo */}
              <div className="flex-1">
                <label className={`block text-xs font-semibold mb-1.5 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Modelo IA
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className={`w-full px-3 py-2 border-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {llmProviders[llmProvider].models.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Botão Limpar Chat */}
              <div className="flex flex-col">
                <label className="block text-xs font-semibold mb-1.5 opacity-0 select-none">.</label>
                <button
                  onClick={clearChat}
                  disabled={messages.length === 0}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    messages.length === 0
                      ? 'opacity-40 cursor-not-allowed bg-gray-200 text-gray-500'
                      : darkMode
                        ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800 hover:border-red-700'
                        : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300'
                  }`}
                  title="Limpar todas as mensagens"
                >
                  <X size={16} />
                  Limpar
                </button>
              </div>
            </div>

            {messages.length === 0 && pdfDoc && (
              <div className={`p-5 border-b ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-gray-200'}`}>
                <p className={`text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sugestões rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setInput('Resuma esta página')}
                    className="text-sm px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 font-semibold shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                  >
                    📝 Resumir página
                  </button>
                  <button
                    onClick={() => setInput('Explique os conceitos principais desta página')}
                    className="text-sm px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 font-semibold shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                  >
                    💡 Explicar conceitos
                  </button>
                  <button
                    onClick={() => setInput('Crie perguntas de estudo sobre este conteúdo')}
                    className="text-sm px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 font-semibold shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                  >
                    ❓ Criar quiz
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <div className={`text-center mt-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className={`p-6 rounded-2xl mb-4 inline-block ${darkMode ? 'bg-purple-900/20' : 'bg-purple-100'}`}>
                    <MessageSquare size={56} className={`mx-auto ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <p className={`font-bold text-lg mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Comece uma conversa!
                  </p>
                  <p className="text-sm mt-2">Selecione texto no PDF ou use as sugestões acima</p>
                  {!apiKey && (
                    <button
                      onClick={() => setSettingsOpen(true)}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Configurar API Key
                    </button>
                  )}
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl shadow-md ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white'
                          : `${darkMode ? 'bg-gray-700 text-gray-100 border-2 border-gray-600' : 'bg-white text-gray-800 border-2 border-gray-200'}`
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-md ${
                    darkMode ? 'bg-gray-700 border-2 border-gray-600' : 'bg-white border-2 border-gray-200'
                  }`}>
                    <Loader2 size={18} className="animate-spin text-purple-600" />
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Pensando...
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className={`p-5 border-t-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-gray-50 to-blue-50/30 border-gray-200'} shadow-lg`}>
              {pdfFile && (
                <div className={`text-xs mb-3 flex items-center gap-2 font-medium px-3 py-2 rounded-lg ${
                  darkMode ? 'text-gray-400 bg-gray-700/50' : 'text-gray-600 bg-white/70'
                }`}>
                  <FileText size={14} />
                  Página {currentPage} de {totalPages} - {pdfFile}
                </div>
              )}
              <div className="flex gap-3">
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
                  className={`flex-1 p-4 border-2 rounded-xl resize-none font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={3}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading || !apiKey}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:via-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  title="Enviar mensagem"
                >
                  <Send size={22} />
                </button>
              </div>
              <p className={`text-xs mt-3 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                <kbd className={`px-2 py-1 rounded font-mono ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>Shift + Enter</kbd> para nova linha • <kbd className={`px-2 py-1 rounded font-mono ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>Enter</kbd> para enviar
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PDFStudyApp;