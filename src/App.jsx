import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Activity, Thermometer, Droplets, Wind, AlertCircle, RefreshCw, Layers, Maximize, Download } from 'lucide-react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access the camera. Please allow camera permissions in your browser.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setImage(imageDataUrl);
      stopCamera();
      simulateAnalysis(imageDataUrl);
    }
  };

  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setResults(null);
        stopCamera();
        simulateAnalysis(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAnalysis = (imgData = image) => {
    if (!imgData) return;
    setIsAnalyzing(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      setIsAnalyzing(false);
      setResults({
        hue: { dominant: 'Copper / Warm', confidence: 92, rgb: 'rgb(184, 115, 51)' },
        texture: { smoothness: 68, concerns: ['Mild dryness', 'Uneven tone'] },
        touch: {
          temperature: 'Normal (36.5°C)',
          dryness: 'Moderate',
          swelling: 'None detected'
        },
        ayurvedic: {
          varna: 'Tamra (Copper-like)',
          sparsha: 'Ruksha (Dry)',
          doshaIndication: {
            vata: 65,
            pitta: 45,
            kapha: 20
          },
          prognosis: 'Normal baseline. Mild Vata imbalance indicated by dryness.'
        }
      });
    }, 2500);
  };

  const resetAnalysis = () => {
    setImage(null);
    setResults(null);
    setIsAnalyzing(false);
    stopCamera();
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">
          <Activity size={28} color="var(--accent-primary)" />
          <span>AyurVision</span>
        </div>
        <div className="nav-links">
          <span className="nav-link active">Dashboard</span>
          <span className="nav-link">History</span>
          <span className="nav-link">Settings</span>
          {deferredPrompt && (
            <button 
              className="btn-primary" 
              onClick={handleInstallClick} 
              style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={16} /> Install App
            </button>
          )}
        </div>
      </nav>

      <main className="main-content">
        {!image && !results && !isAnalyzing ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="scanner-container"
            style={{ maxWidth: '800px', margin: '0 auto' }}
          >
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="card-header" style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)' }}>
                <Maximize size={24} style={{color: 'var(--accent-primary)'}} />
                <h2 className="card-title">Live Skin Scanner</h2>
              </div>
              
              <div style={{ position: 'relative', width: '100%', height: '500px', background: '#000' }}>
                {!cameraActive ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Camera size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
                    <button className="btn-primary" onClick={startCamera}>
                      <Camera size={18} /> Initialize Scanner
                    </button>
                    <label style={{marginTop: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)', textDecoration: 'underline'}}>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                      Or upload an image manually
                    </label>
                  </div>
                ) : (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="scan-overlay">
                      <div className="target-box">
                        <div className="target-box-inner"></div>
                        <div className="scanner-scan-line"></div>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }}>
                      <button className="btn-primary" onClick={captureImage} style={{ padding: '1rem 3rem', fontSize: '1.2rem', boxShadow: '0 0 20px rgba(217, 119, 6, 0.6)' }}>
                        <Activity size={24} /> Scan Skin Now
                      </button>
                    </div>
                  </>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="dashboard-grid"
          >
            {/* Left Column - Scanned Image & Ayurvedic Results */}
            <div className="column">
              <div className="glass-card">
                <div className="card-header" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Camera size={24} style={{color: 'var(--accent-primary)'}} />
                    <h2 className="card-title">Scanned Image</h2>
                  </div>
                  <button className="btn-primary" onClick={resetAnalysis} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--card-border)' }}>
                    <RefreshCw size={14} /> New Scan
                  </button>
                </div>
                
                <div className="image-preview-container">
                  <img src={image} alt="Skin sample" className="image-preview" />
                  {isAnalyzing && <div className="scan-line"></div>}
                </div>

                {isAnalyzing && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{color: 'var(--accent-secondary)', marginBottom: '1rem'}}>Analyzing Varna (Hue) and Sparsha (Texture)...</p>
                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{width: '100%', animation: 'scan 2.5s ease-in-out'}}></div>
                    </div>
                  </div>
                )}
              </div>

              {results && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card" 
                  style={{marginTop: '2rem'}}
                >
                  <div className="card-header">
                    <Layers size={24} style={{color: 'var(--success)'}} />
                    <h2 className="card-title">Ayurvedic Assessment</h2>
                    <span className="badge varna">Varna</span>
                    <span className="badge sparsha">Sparsha</span>
                  </div>
                  
                  <div className="result-item">
                    <div className="result-label">
                      <span>Identified Varna (Color)</span>
                      <span className="result-value" style={{color: 'var(--accent-primary)'}}>{results.ayurvedic.varna}</span>
                    </div>
                  </div>
                  
                  <div className="result-item">
                    <div className="result-label">
                      <span>Identified Sparsha (Touch/Texture)</span>
                      <span className="result-value">{results.ayurvedic.sparsha}</span>
                    </div>
                  </div>

                  <div style={{marginTop: '1.5rem'}}>
                    <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem'}}>Dosha Probability Profile:</p>
                    
                    <div className="result-item">
                      <div className="result-label"><span>Vata (Dry/Cold)</span> <span>{results.ayurvedic.doshaIndication.vata}%</span></div>
                      <div className="progress-bar-container"><div className="progress-bar vta" style={{width: `${results.ayurvedic.doshaIndication.vata}%`}}></div></div>
                    </div>
                    
                    <div className="result-item">
                      <div className="result-label"><span>Pitta (Hot/Red)</span> <span>{results.ayurvedic.doshaIndication.pitta}%</span></div>
                      <div className="progress-bar-container"><div className="progress-bar pita" style={{width: `${results.ayurvedic.doshaIndication.pitta}%`}}></div></div>
                    </div>
                    
                    <div className="result-item">
                      <div className="result-label"><span>Kapha (Oily/Pale)</span> <span>{results.ayurvedic.doshaIndication.kapha}%</span></div>
                      <div className="progress-bar-container"><div className="progress-bar kapha" style={{width: `${results.ayurvedic.doshaIndication.kapha}%`}}></div></div>
                    </div>
                  </div>
                  
                  <div style={{marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--success)'}}>
                    <p style={{color: '#a7f3d0', fontSize: '0.95rem'}}>{results.ayurvedic.prognosis}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - Results */}
            <div className="column">
              <div className="glass-card" style={{opacity: results ? 1 : 0.5, transition: 'opacity 0.5s', height: '100%'}}>
                <div className="card-header">
                  <Activity size={24} style={{color: 'var(--accent-secondary)'}} />
                  <h2 className="card-title">Clinical AI Metrics</h2>
                  <span className="badge">Modern Analysis</span>
                </div>

                {results ? (
                  <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
                    <div className="result-item" style={{marginBottom: '2rem'}}>
                      <div className="result-label">
                        <span>Colorimetric Analysis</span>
                        <span className="result-value">{results.hue.dominant}</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar copper" style={{width: `${results.hue.confidence}%`}}></div>
                      </div>
                      <p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem'}}>Confidence Score: {results.hue.confidence}%</p>
                    </div>

                    <h3 style={{fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)'}}>Touch & Texture Indicators</h3>
                    <div className="indicators-grid">
                      <div className="indicator-card">
                        <Thermometer className="indicator-icon" size={24} />
                        <div className="indicator-title">Temperature</div>
                        <div className="indicator-value" style={{fontSize: '1rem'}}>{results.touch.temperature}</div>
                      </div>
                      <div className="indicator-card">
                        <Droplets className="indicator-icon" size={24} style={{color: 'var(--accent-primary)'}} />
                        <div className="indicator-title">Moisture</div>
                        <div className="indicator-value" style={{fontSize: '1rem'}}>{results.touch.dryness}</div>
                      </div>
                      <div className="indicator-card">
                        <Wind className="indicator-icon" size={24} style={{color: '#a78bfa'}} />
                        <div className="indicator-title">Swelling</div>
                        <div className="indicator-value" style={{fontSize: '1rem'}}>{results.touch.swelling}</div>
                      </div>
                    </div>

                    <div style={{marginTop: '2rem'}}>
                      <h3 style={{fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)'}}>Texture Abnormalities</h3>
                      <ul style={{listStylePosition: 'inside', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px'}}>
                        {results.texture.concerns.map((concern, i) => (
                          <li key={i} style={{marginBottom: '0.5rem'}}>{concern}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-secondary)', textAlign: 'center'}}>
                    <Activity size={48} style={{opacity: 0.2, marginBottom: '1rem', animation: 'pulse 2s infinite'}} />
                    <p>Processing scan data...</p>
                    <p style={{fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.7}}>Analyzing clinical metrics and Ayurvedic correlations.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div className="disclaimer">
          <AlertCircle className="disclaimer-icon" size={24} />
          <div className="disclaimer-text">
            <h4>Decision-Support System Only</h4>
            <p>AyurVision AI is designed as a supplementary analytical tool. It is NOT a definitive diagnostic authority. Skin conditions can vary based on lighting, camera quality, ethnicity, and environmental factors. Always consult a certified healthcare practitioner or Ayurvedic doctor for clinical diagnosis.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
