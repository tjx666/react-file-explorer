import { createRoot } from 'react-dom/client';

import Counter from './Counter';

const root = createRoot(document.querySelector('#app')!);
root.render(<Counter />);
