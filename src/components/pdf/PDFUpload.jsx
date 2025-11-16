import React from 'react';
import { Upload } from 'lucide-react';

/**
 * Componente PDFUpload - Interface de upload de PDFs
 *
 * Princípios aplicados:
 * - Single Responsibility: Apenas interface de upload
 * - Presentational Component: Não gerencia lógica de negócio
 */
const PDFUpload = ({
  fileInputRef,
  draggingOver,
  onFileUpload,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  return (
    <div
      className={`flex-1 flex items-center justify-center p-8 transition-all ${
        draggingOver
          ? 'bg-blue-50 dark:bg-blue-900/20 border-4 border-blue-400 border-dashed'
          : ''
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
            <Upload size={48} className="text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2 dark:text-white">
            Arraste um PDF aqui
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            ou clique no botão abaixo para selecionar
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            Selecionar PDF
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={onFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PDFUpload;
