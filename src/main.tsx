import { LanguageProvider } from './language'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/main.css'

// Empieza a bajar el preloader 3D sin esperar a que React monte la página.
if (document.documentElement.hasAttribute('data-preloading') && typeof WebGL2RenderingContext !== 'undefined') {
  void import('./components/inflatedLogo').catch(() => undefined)
}

createRoot(document.getElementById('root')!).render(<LanguageProvider><App /></LanguageProvider>)
