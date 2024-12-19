import React from 'react'
import ReactDOM from 'react-dom/client'
<<<<<<< HEAD
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './styles/animations.css'
import './styles/theme.css'
=======
import { ToastContainer } from 'react-toastify'
import AppRoutes from './routes/AppRoutes'
import 'react-toastify/dist/ReactToastify.css'
import './styles/animations.css'
>>>>>>> 385d21d198da5dc0d1b1ef1810662532e206719a
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
<<<<<<< HEAD
    <AuthProvider>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
=======
    <AppRoutes />
    <ToastContainer />
>>>>>>> 385d21d198da5dc0d1b1ef1810662532e206719a
  </React.StrictMode>,
)
