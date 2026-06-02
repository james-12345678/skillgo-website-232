import { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

const pdfWorker = new PdfWorker();
pdfjsLib.GlobalWorkerOptions.workerPort = pdfWorker;

interface PDFViewerProps {
  data: ArrayBuffer;
  fileName: string;
  height?: string;
}

export const PDFViewer = ({ data, fileName, height = "50vh" }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const scale = 1.2;
  const pdfDocRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});
  const renderTasksRef = useRef<{ [key: number]: any }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const renderedPagesRef = useRef<Set<number>>(new Set());
  const isRenderingRef = useRef<boolean>(false);
  const renderQueueRef = useRef<Set<number>>(new Set());

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setRenderError(null);
        setIsDocumentLoaded(false);
        renderedPagesRef.current.clear();

        if (!data) {
          throw new Error('No PDF data provided');
        }

        // Ensure data is an ArrayBuffer
        let buffer = data;
        if (!(data instanceof ArrayBuffer)) {
          console.warn('Data is not an ArrayBuffer, attempting conversion...');
          if (data instanceof Uint8Array) {
            buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          } else {
            throw new Error('Invalid data type: expected ArrayBuffer');
          }
        }

        if (buffer.byteLength === 0) {
          throw new Error('PDF file is empty');
        }

        console.log('Loading PDF, buffer size:', buffer.byteLength);
        console.log('Buffer type:', buffer.constructor.name);

        // Verify it's a valid PDF by checking header
        const bytes = new Uint8Array(buffer);
        const header = String.fromCharCode(...bytes.slice(0, 5));
        console.log('PDF header:', header);
        console.log('First 20 bytes:', Array.from(bytes.slice(0, 20)).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '));

        if (header !== '%PDF-') {
          console.warn('Warning: File header does not match PDF format');
          console.warn('Expected: %PDF-, Got:', header);
          // Don't throw, just warn - some valid PDFs might have different headers
        }

        try {
          console.log('Attempting to load PDF with PDF.js...');
          console.log('PDF.js version:', pdfjsLib.version);

          const startLoadTime = performance.now();
          const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
          const loadTime = performance.now() - startLoadTime;

          // Verify we got a valid PDF
          if (!pdf || !pdf.numPages || pdf.numPages < 1) {
            throw new Error('Invalid PDF or no pages found');
          }

          console.log('✓ PDF loaded successfully, pages:', pdf.numPages);
          console.log(`PDF parsing took ${loadTime.toFixed(2)}ms`);
          pdfDocRef.current = pdf;
          setNumPages(pdf.numPages);
          setIsDocumentLoaded(true);
        } catch (loadError) {
          const loadErrorMsg = loadError instanceof Error ? loadError.message : String(loadError);
          console.error('PDF.js load error:', loadError);
          console.error('Error stack:', loadError instanceof Error ? loadError.stack : 'N/A');

          // Provide helpful error message based on the error type
          let userMessage = `Failed to load PDF: ${loadErrorMsg}`;
          if (loadErrorMsg.includes('Invalid PDF') || loadErrorMsg.includes('Corrupted')) {
            userMessage = 'The file is corrupted or not a valid PDF. Please check and re-upload the file.';
          } else if (loadErrorMsg.includes('syntax')) {
            userMessage = 'The PDF file has invalid structure. Please verify the file is not corrupted.';
          } else if (loadErrorMsg.includes('XRef')) {
            userMessage = 'The PDF file appears to be corrupted. The cross-reference table is invalid.';
          } else if (loadErrorMsg.includes('BaseException')) {
            userMessage = 'PDF.js encountered an internal error processing the file. The file may be corrupted or in an unsupported format.';
          } else if (loadErrorMsg.includes('network') || loadErrorMsg.includes('worker')) {
            userMessage = 'PDF.js worker failed to load. Check your internet connection or try refreshing the page.';
          }

          throw new Error(`PDF.js failed to load document: ${userMessage}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error loading PDF:', error);
        setRenderError(`Failed to load PDF: ${errorMessage}`);
        setIsDocumentLoaded(false);
        setNumPages(0);
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      loadPdf();
    } else {
      setLoading(false);
    }

    return () => {
      if (pdfDocRef.current) {
        try {
          pdfDocRef.current.destroy();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      setIsDocumentLoaded(false);
    };
  }, [data]);

  // Render a single page with queue management
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current) return;
    if (!canvasRefs.current[pageNum]) return;
    if (renderedPagesRef.current.has(pageNum)) return;

    // Add to render queue
    renderQueueRef.current.add(pageNum);

    // If already rendering, just queue this page
    if (isRenderingRef.current) {
      return;
    }

    // Process queue sequentially to avoid memory overload
    while (renderQueueRef.current.size > 0) {
      isRenderingRef.current = true;
      const pagesToRender = Array.from(renderQueueRef.current).slice(0, 1);
      const currentPageNum = pagesToRender[0];
      renderQueueRef.current.delete(currentPageNum);

      if (renderedPagesRef.current.has(currentPageNum)) {
        isRenderingRef.current = false;
        continue;
      }

      const pageRenderStartTime = performance.now();
      try {
        const canvas = canvasRefs.current[currentPageNum];
        if (!canvas || !canvas.parentElement) {
          isRenderingRef.current = false;
          continue;
        }

        // Get the page - add safety checks
        let page;
        try {
          page = await pdfDocRef.current.getPage(currentPageNum);
        } catch (e) {
          console.error(`Failed to get page ${currentPageNum}:`, e);
          isRenderingRef.current = false;
          continue;
        }

        if (!page) {
          console.warn(`Page ${currentPageNum} is null`);
          isRenderingRef.current = false;
          continue;
        }

        const viewport = page.getViewport({ scale });
        if (!viewport) {
          console.warn(`Could not get viewport for page ${currentPageNum}`);
          isRenderingRef.current = false;
          continue;
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        if (!context) {
          console.warn(`Could not get 2d context for page ${currentPageNum}`);
          isRenderingRef.current = false;
          continue;
        }

        // Cancel previous render task if exists
        if (renderTasksRef.current[currentPageNum]) {
          try {
            renderTasksRef.current[currentPageNum].cancel();
          } catch (e) {
            // Ignore cancel errors
          }
        }

        const renderTask = page.render({
          canvasContext: context,
          viewport: viewport,
        });

        renderTasksRef.current[currentPageNum] = renderTask;

        try {
          await renderTask.promise;
          renderedPagesRef.current.add(currentPageNum);
          const pageRenderEndTime = performance.now();
          console.log(`✓ Page ${currentPageNum} rendered in ${(pageRenderEndTime - pageRenderStartTime).toFixed(2)}ms`);
        } catch (renderError) {
          if (renderError instanceof Error && renderError.message === 'Rendering cancelled') {
            // This is expected when navigation occurs
            isRenderingRef.current = false;
            continue;
          }
          console.error(`Error in render promise for page ${currentPageNum}:`, renderError);
        }
      } catch (error) {
        console.error(`Unexpected error rendering page ${currentPageNum}:`, error);
      } finally {
        isRenderingRef.current = false;
        // Small delay before next render to prevent blocking UI
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }, []);

  // Setup intersection observer for lazy rendering
  useEffect(() => {
    if (!isDocumentLoaded || numPages === 0) return;

    // Immediately render the first page for better perceived performance
    if (!renderedPagesRef.current.has(1)) {
      setTimeout(() => {
        renderPage(1);
      }, 50);
    }

    // Create intersection observer to render pages as they come into view
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = parseInt((entry.target as HTMLElement).getAttribute('data-page-num') || '0', 10);
            if (pageNum > 0 && pageNum <= numPages) {
              // Add small delay to prevent concurrent rendering issues
              setTimeout(() => {
                renderPage(pageNum);
              }, 0);
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '150px', // Start rendering 150px before page is visible
        threshold: 0.01,
      }
    );

    // Observe all page elements - ensure they exist first
    setTimeout(() => {
      const pageElements = scrollContainerRef.current?.querySelectorAll('[data-page-num]');
      if (pageElements) {
        pageElements.forEach((element) => {
          if (observerRef.current) {
            observerRef.current.observe(element);
          }
        });
      }
    }, 0);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isDocumentLoaded, numPages, renderPage]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center bg-slate-50 rounded-xl" style={{ height }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-logo-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-xs animate-pulse">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (renderError) {
    return (
      <div className="w-full flex items-center justify-center bg-red-50 rounded-xl border border-red-200" style={{ height }}>
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <p className="text-red-600 font-bold text-sm">{renderError}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col w-full bg-slate-50 rounded-xl border border-slate-100 shadow-sm overflow-hidden" style={{ height: height === "100%" ? "100%" : (height || "50vh") }}>
      {/* Scrollable Canvas Container */}
      <div ref={scrollContainerRef} className="w-full overflow-y-auto overflow-x-hidden flex flex-col items-center gap-4 p-4 bg-slate-50 flex-1">
        {isDocumentLoaded ? (
          <>
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <div key={pageNum} data-page-num={pageNum} className="w-full flex flex-col items-center">
                <canvas
                  ref={(el) => {
                    if (el) canvasRefs.current[pageNum] = el;
                  }}
                  className="max-w-full shadow-lg rounded-lg border border-slate-200"
                />
              </div>
            ))}
          </>
        ) : (
          <div className="text-center flex-1 flex items-center justify-center">
            <p className="text-slate-400 font-semibold text-sm">PDF could not be loaded</p>
          </div>
        )}
      </div>
    </div>
  );
};
