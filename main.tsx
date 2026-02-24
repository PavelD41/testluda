import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SDKProvider } from '@tma.js/sdk-react'
import { Root } from './Root'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SDKProvider acceptCustomStyles debug>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </SDKProvider>
  </React.StrictMode>,
)
