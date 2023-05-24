import { Footer } from 'components/UI/Footer/Footer'
import { Header } from 'components/UI/Header/Header'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

export default function Layout({ children }) {
  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <Header />
      {children}
      <Footer />
      <ToastContainer position="top-center" />
    </div>
  )
}
