import React from 'react';

/**
 * Componente PDFCanvas - Renderiza o canvas do PDF
 *
 * Princípios aplicados:
 * - Single Responsibility: Apenas renderiza o canvas
 * - Separation of Concerns: Lógica de renderização no hook usePDF
 */
const PDFCanvas = ({ canvasRef, textLayerRef, show = true }) => {
  if (!show) return null;

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="max-w-full shadow-lg" />
      <div
        ref={textLayerRef}
        className="textLayer absolute top-0 left-0 opacity-0"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
};

export default PDFCanvas;
