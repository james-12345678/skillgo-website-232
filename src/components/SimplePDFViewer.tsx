import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Button } from '@/components/ui/button';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface SimplePDFViewerProps {
  data: ArrayBuffer;
  fileName: string;
}

export const SimplePDFViewer = ({ data, fileName }: SimplePDFViewerProps) => {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const pdfDocRef = useRef<any>(null);

  useEffect(() => {
    loadPdf();

    return () => {
      // Cleanup: destroy the PDF document when component unmounts
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
      }
    };
  }, [data]);

  useEffect(() => {
    if (numPages > 0 && pdfDocRef.current) {
      renderPage(currentPage);
    }
  }, [currentPage, numPages]);

  const loadPdf = async () => {
    try {
      setLoading(true);
      setError('');

      // Make a copy of the ArrayBuffer to avoid detachment issues
      const dataCopy = data.slice(0);

      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(dataCopy) }).promise;
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);

      // Render first page
      const page = await pdf.getPage(1);
      await renderPageWithDocument(pdf, 1, page);
    } catch (err) {
      setError('Failed to load PDF');
      console.error('PDF load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDocRef.current) {
      setError('PDF document not loaded');
      return;
    }

    try {
      setLoading(true);
      const page = await pdfDocRef.current.getPage(pageNum);
      await renderPageWithDocument(pdfDocRef.current, pageNum, page);
    } catch (err) {
      setError('Failed to render page');
      console.error('Page render error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderPageWithDocument = async (pdf: any, pageNum: number, page: any) => {
    try {
      const scale = 2; // Higher scale for better quality
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (!context) throw new Error('Could not get canvas context');

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      setImageUrl(canvas.toDataURL('image/png'));
      setError('');
    } catch (err) {
      console.error('Page render error:', err);
      throw err;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-slate-500 font-bold text-sm mb-2">{error}</p>
          <Button onClick={() => loadPdf()} size="sm">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-slate-100">
      {/* Navigation */}
      {numPages > 1 && (
        <div className="shrink-0 border-b border-slate-200 bg-white p-4 flex items-center justify-center gap-3 sticky top-0 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1 || loading}
          >
            ← Previous
          </Button>
          <span className="text-xs font-semibold text-slate-600 px-3">
            Page {currentPage} of {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
            disabled={currentPage >= numPages || loading}
          >
            Next →
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-logo-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm">Rendering...</p>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={`Page ${currentPage}`}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-lg"
          />
        ) : null}
      </div>
    </div>
  );
};
