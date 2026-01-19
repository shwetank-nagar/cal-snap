import { useState } from 'react'
import './App.css'
import Upload from './components/Upload'
import Dashboard from './components/Dashboard'
import History from './components/History'

function App() {
  const [activeTab, setActiveTab] = useState('upload')
  // refreshToken: Incremented each time a meal is saved to trigger re-fetch in Dashboard/History
  // This creates a simple sync mechanism without prop drilling or global state
  const [refreshToken, setRefreshToken] = useState(0)

  /**
   * Sync callback: Triggered when Upload component saves a new meal
   * Increments refreshToken to signal Dashboard and History to re-fetch their data
   * This ensures the UI stays in sync with the database after meal creation
   */
  const handleMealSaved = () => {
    setRefreshToken((current) => current + 1)
  }

  return (
    <div className="app">
      <header className="app-header">
        <p className="app-kicker">Daily nutrition snapshots</p>
        <h1>CalSnap</h1>
        <p className="app-subtitle">Upload meals, track macros, and stay on target.</p>
      </header>

      <nav className="nav-tabs">
        <button
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          Upload
        </button>
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'upload' && <Upload onMealSaved={handleMealSaved} />}
        {activeTab === 'dashboard' && <Dashboard refreshToken={refreshToken} />}
        {activeTab === 'history' && <History refreshToken={refreshToken} />}
      </main>
    </div>
  )
}

export default App
