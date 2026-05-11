import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { checkUpcomingDeadlines } from './discord.js'

// 마감 체크 - 앱 시작 시 + 10분마다
checkUpcomingDeadlines()
setInterval(checkUpcomingDeadlines, 10 * 60 * 1000)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
