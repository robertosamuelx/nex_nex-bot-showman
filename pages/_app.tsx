import '../styles/globals.css'
import '../styles/whatsclone.css'
import "react-datepicker/dist/react-datepicker.css"
import { ToastProvider } from 'react-toast-notifications'
import { Provider } from 'next-auth/client'

import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider session={pageProps.session}>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </Provider>
  )
}

export default MyApp
