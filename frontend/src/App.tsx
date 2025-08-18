import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>SecureHealth</h1>
        <p>Secure Image Management with Blockchain</p>
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
