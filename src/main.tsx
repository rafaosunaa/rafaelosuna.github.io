import { LanguageProvider } from './language'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/main.css'

createRoot(document.getElementById('root')!).render(<LanguageProvider><App /></LanguageProvider>)
