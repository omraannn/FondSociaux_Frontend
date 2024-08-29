import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";


import { createRoot } from 'react-dom/client'
import App from './App.js'


const rootElement = document.getElementById('root');

if (rootElement) {
    createRoot(rootElement).render(
        <App />
    );
} else {
    console.error('Root element not found');
}
