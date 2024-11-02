import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

// Chrome拡張のコンテキストでReactを初期化
const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);