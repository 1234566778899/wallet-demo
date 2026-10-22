import { createRoot } from 'react-dom/client';
import { Root } from '../shared/Root.jsx';
import { App } from './App.jsx';

createRoot(document.getElementById('root')).render(<Root><App /></Root>);
