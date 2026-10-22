import { createRoot } from 'react-dom/client';
import { Root } from '../shared/Root.jsx';
import { Tarjeta } from './Tarjeta.jsx';

createRoot(document.getElementById('root')).render(<Root><Tarjeta /></Root>);
