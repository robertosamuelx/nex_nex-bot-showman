import '../styles/globals.css'
import '../styles/whatsclone.css'
import { ToastProvider } from 'react-toast-notifications'

import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <ToastProvider><Component {...pageProps} /></ToastProvider>
}

export default MyApp
