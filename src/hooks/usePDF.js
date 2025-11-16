import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { PDF_CONFIG } from '../constants/app-config';

/**
 * Hook customizado para gerenciar estado e lógica de PDFs
 *
 * Princípios aplicados:
 * - Single Responsibility: Gerencia apenas lógica de PDF
 * - Separation of Concerns: Separa lógica de negócio da apresentação
 * - Don't Repeat Yourself: Centraliza lógica duplicada de upload
 *
 * @returns {Object} Estado e funções para manipular PDF
 */
const usePDF = () => {
  // Refs
  const canvasRef = useRef(null);
  const canvas2Ref = useRef(null);
  const textLayerRef = useRef(null);
  const textLayer2Ref = useRef(null);
  const fileInputRef = useRef(null);

  // Estado do PDF
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(PDF_CONFIG.DEFAULT_SCALE);
  const [rotation, setRotation] = useState(PDF_CONFIG.DEFAULT_ROTATION);
  const [pageInput, setPageInput] = useState('1');
  const [pageTextContent, setPageTextContent] = useState('');
  const [pageMode, setPageMode] = useState(PDF_CONFIG.PAGE_MODES.SINGLE);
  const [thumbnails, setThumbnails] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [draggingOverViewer, setDraggingOverViewer] = useState(false);

  // Carrega PDF.js quando componente monta
  useEffect(() => {
    const script = document.createElement('script');
    script.src = PDF_CONFIG.PDFJS.SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_CONFIG.PDFJS.WORKER_URL;
    };
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // Script já foi removido
      }
    };
  }, []);

  // Renderiza página quando necessário
  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, rotation, pageMode]);

  /**
   * Gera miniaturas do PDF
   */
  const generateThumbnails = useCallback(async (pdf) => {
    const thumbs = [];
    const thumbScale = 0.3;
    const maxPages = Math.min(pdf.numPages, 50);

    for (let i = 1; i <= maxPages; i++) {
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
  }, []);

  /**
   * Carrega um arquivo PDF
   */
  const loadPDF = useCallback(async (file) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Por favor, selecione um arquivo PDF válido');
      return false;
    }

    try {
      toast.loading('Carregando PDF...', { id: 'pdf-loading' });

      const fileReader = new FileReader();

      return new Promise((resolve, reject) => {
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
            toast.success(`PDF "${file.name}" carregado com sucesso!`);
            resolve(true);
          } catch (error) {
            toast.dismiss('pdf-loading');
            toast.error('Erro ao carregar PDF. Tente outro arquivo.');
            console.error('Erro ao processar PDF:', error);
            reject(error);
          }
        };

        fileReader.onerror = () => {
          toast.dismiss('pdf-loading');
          toast.error('Erro ao ler arquivo');
          reject(new Error('Erro ao ler arquivo'));
        };

        fileReader.readAsArrayBuffer(file);
      });
    } catch (error) {
      toast.error('Erro ao processar arquivo');
      return false;
    }
  }, [generateThumbnails]);

  /**
   * Handler para upload de arquivo
   */
  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file) {
      await loadPDF(file);
    }
  }, [loadPDF]);

  /**
   * Handlers de drag and drop
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOverViewer(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOverViewer(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingOverViewer(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }

    const file = files[0];
    await loadPDF(file);
  }, [loadPDF]);

  /**
   * Renderiza uma página do PDF
   */
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDoc) return;

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale, rotation });
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;

    // Renderiza camada de texto
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    setPageTextContent(pageText);

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

    // Renderiza segunda página se modo duplo
    if (pageMode === 'double' && pageNum < totalPages) {
      const page2 = await pdfDoc.getPage(pageNum + 1);
      const viewport2 = page2.getViewport({ scale, rotation });
      const canvas2 = canvas2Ref.current;
      const context2 = canvas2.getContext('2d');

      canvas2.height = viewport2.height;
      canvas2.width = viewport2.width;

      await page2.render({ canvasContext: context2, viewport: viewport2 }).promise;

      const textContent2 = await page2.getTextContent();
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
  }, [pdfDoc, scale, rotation, pageMode, totalPages]);

  /**
   * Navegação de páginas
   */
  const goToPage = useCallback((pageNum) => {
    const page = Math.max(1, Math.min(totalPages, pageNum));
    setCurrentPage(page);
    setPageInput(String(page));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  /**
   * Controles de zoom
   */
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  /**
   * Rotação
   */
  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  /**
   * Toggle bookmark
   */
  const toggleBookmark = useCallback(() => {
    if (!pdfDoc) return;

    const existingIndex = bookmarks.findIndex(b => b.page === currentPage);

    if (existingIndex >= 0) {
      // Remove bookmark
      setBookmarks(prev => prev.filter((_, i) => i !== existingIndex));
      toast.success('Marcador removido');
    } else {
      // Adiciona bookmark
      const newBookmark = {
        page: currentPage,
        title: `Página ${currentPage}`,
        timestamp: new Date().toISOString()
      };
      setBookmarks(prev => [...prev, newBookmark]);
      toast.success('Marcador adicionado');
    }
  }, [pdfDoc, currentPage, bookmarks]);

  return {
    // Refs
    canvasRef,
    canvas2Ref,
    textLayerRef,
    textLayer2Ref,
    fileInputRef,
    // Estado
    pdfFile,
    pdfDoc,
    currentPage,
    totalPages,
    scale,
    rotation,
    pageInput,
    pageTextContent,
    pageMode,
    thumbnails,
    bookmarks,
    draggingOverViewer,
    // Setters
    setPageInput,
    setPageMode,
    setBookmarks,
    // Funções
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    goToPage,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    rotate,
    toggleBookmark,
    renderPage
  };
};

export default usePDF;
