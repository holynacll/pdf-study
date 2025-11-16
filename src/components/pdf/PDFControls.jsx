import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  BookOpen,
  File
} from 'lucide-react';

/**
 * Componente PDFControls - Barra de controles do PDF
 *
 * Princípios aplicados:
 * - Single Responsibility: Apenas renderiza controles
 * - Presentational Component: Não gerencia estado, apenas exibe UI
 */
const PDFControls = ({
  currentPage,
  totalPages,
  pageInput,
  pageMode,
  fullscreen,
  onPageInputChange,
  onPageInputSubmit,
  onPreviousPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onRotate,
  onToggleFullscreen,
  onTogglePageMode
}) => {
  if (!totalPages) return null;

  return (
    <div className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex-wrap">
      {/* Navegação de páginas */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página anterior (←)"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={pageInput}
            onChange={(e) => onPageInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onPageInputSubmit()}
            className="w-16 px-2 py-1 text-center border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
            min="1"
            max={totalPages}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            / {totalPages}
          </span>
        </div>

        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Próxima página (→)"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Separador */}
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      {/* Controles de zoom */}
      <div className="flex items-center gap-2">
        <button
          onClick={onZoomOut}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Diminuir zoom"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={onZoomIn}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Aumentar zoom"
        >
          <ZoomIn size={20} />
        </button>
      </div>

      {/* Separador */}
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

      {/* Rotação */}
      <button
        onClick={onRotate}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Rotacionar"
      >
        <RotateCw size={20} />
      </button>

      {/* Modo de página */}
      <button
        onClick={onTogglePageMode}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={pageMode === 'single' ? 'Modo duplo' : 'Modo simples'}
      >
        {pageMode === 'single' ? <BookOpen size={20} /> : <File size={20} />}
      </button>

      {/* Tela cheia */}
      <button
        onClick={onToggleFullscreen}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={fullscreen ? 'Sair de tela cheia' : 'Tela cheia'}
      >
        {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>
    </div>
  );
};

export default PDFControls;
