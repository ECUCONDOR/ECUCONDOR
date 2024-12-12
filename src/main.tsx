import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import AppRoutes from './routes/AppRoutes'
import 'react-toastify/dist/ReactToastify.css'
import './styles/animations.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRoutes />
    <ToastContainer />
  </React.StrictMode>,
)
