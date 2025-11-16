import React, { useRef, useEffect } from 'react';
import PDFCanvas from './PDFCanvas';
import PDFControls from './PDFControls';
import PDFUpload from './PDFUpload';

/**
 * Componente PDFViewer - Container principal do visualizador de PDF
 *
 * Princípios aplicados:
 * - Single Responsibility: Orquestra subcomponentes do PDF
 * - Composition over Inheritance: Compõe PDFCanvas, PDFControls, PDFUpload
 */
const PDFViewer = ({
  containerRef,
  canvasRef,
  canvas2Ref,
  textLayerRef,
  textLayer2Ref,
  fileInputRef,
  pdfDoc,
  currentPage,
  totalPages,
  pageInput,
  pageMode,
  fullscreen,
  draggingOver,
  onPageInputChange,
  onPageInputSubmit,
  onPreviousPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onRotate,
  onToggleFullscreen,
  onTogglePageMode,
  onFileUpload,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  // Listener para fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && fullscreen) {
        // User exited fullscreen with ESC
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [fullscreen]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900"
    >
      {/* Controles do PDF */}
      {pdfDoc && (
        <PDFControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageInput={pageInput}
          pageMode={pageMode}
          fullscreen={fullscreen}
          onPageInputChange={onPageInputChange}
          onPageInputSubmit={onPageInputSubmit}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onRotate={onRotate}
          onToggleFullscreen={onToggleFullscreen}
          onTogglePageMode={onTogglePageMode}
        />
      )}

      {/* Área de visualização */}
      <div className="flex-1 overflow-auto p-4">
        {!pdfDoc ? (
          <PDFUpload
            fileInputRef={fileInputRef}
            draggingOver={draggingOver}
            onFileUpload={onFileUpload}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          />
        ) : (
          <div className="flex justify-center items-start gap-4">
            {/* Primeira página / Página única */}
            <PDFCanvas
              canvasRef={canvasRef}
              textLayerRef={textLayerRef}
              show={true}
            />

            {/* Segunda página (modo duplo) */}
            {pageMode === 'double' && currentPage < totalPages && (
              <PDFCanvas
                canvasRef={canvas2Ref}
                textLayerRef={textLayer2Ref}
                show={true}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
