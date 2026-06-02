import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress ResizeObserver loop error warnings
const resizeObserverErrorHandler = (e: ErrorEvent) => {
  if (e.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    e.stopImmediatePropagation();
  }
};

window.addEventListener('error', resizeObserverErrorHandler);

const container = document.getElementById('root');
if (!container) throw new Error('Root container not found');

const root = createRoot(container);
root.render(<App />);
