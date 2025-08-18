import './App.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="title-section">
            <h1>SecureHealth</h1>
            <p>Secure Image Management with Blockchain</p>
          </div>
          <div className="wallet-section">
            <ConnectButton />
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <div className="upload-section">
          <h2>Upload & Encrypt Image</h2>
          {/* Image upload component will go here */}
        </div>
        
        <div className="decrypt-section">
          <h2>Decrypt Image</h2>
          {/* Image decryption component will go here */}
        </div>
      </main>
    </div>
  )
}

export default App
