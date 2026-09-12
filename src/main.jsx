import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from './lib/router.jsx'
import { BookingProvider } from './context/BookingProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider>
      <BookingProvider>
        <App />
      </BookingProvider>
    </RouterProvider>
  </StrictMode>,
)
