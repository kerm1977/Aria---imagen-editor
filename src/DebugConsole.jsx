import React, { useState, useEffect, useRef } from 'react'
import { X, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const DebugConsole = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [logs, setLogs] = useState([])
  const logsRef = useRef(null)
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef(null)

  // Capturar eventos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      const logEntry = {
        type: 'KEYDOWN',
        timestamp: new Date().toISOString(),
        key: e.key,
        code: e.code,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey
      }
      addLog(logEntry)
    }

    const handleKeyUp = (e) => {
      const logEntry = {
        type: 'KEYUP',
        timestamp: new Date().toISOString(),
        key: e.key,
        code: e.code
      }
      addLog(logEntry)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Capturar eventos de mouse
  useEffect(() => {
    const handleMouseDown = (e) => {
      const logEntry = {
        type: 'MOUSEDOWN',
        timestamp: new Date().toISOString(),
        target: e.target.tagName,
        button: e.button,
        clientX: e.clientX,
        clientY: e.clientY,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey
      }
      addLog(logEntry)
    }

    const handleMouseUp = (e) => {
      const logEntry = {
        type: 'MOUSEUP',
        timestamp: new Date().toISOString(),
        target: e.target.tagName,
        button: e.button,
        clientX: e.clientX,
        clientY: e.clientY
      }
      addLog(logEntry)
    }

    const handleClick = (e) => {
      const logEntry = {
        type: 'CLICK',
        timestamp: new Date().toISOString(),
        target: e.target.tagName,
        clientX: e.clientX,
        clientY: e.clientY
      }
      addLog(logEntry)
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  const addLog = (logEntry) => {
    setLogs(prev => [...prev, logEntry].slice(-500)) // Mantener solo los últimos 500 logs
  }

  const clearLogs = () => {
    setLogs([])
  }

  const copyLogs = () => {
    const text = logs.map(log => JSON.stringify(log)).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      alert('Logs copiados al portapapeles')
    })
  }

  const handleTitleClick = () => {
    clickCountRef.current += 1
    
    if (clickCountRef.current === 1) {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0
      }, 500)
    } else if (clickCountRef.current === 3) {
      clearTimeout(clickTimerRef.current)
      clickCountRef.current = 0
      setIsVisible(!isVisible)
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      width: '400px',
      maxHeight: '80vh',
      backgroundColor: '#1a1a2e',
      border: '1px solid #4a4a6a',
      borderRadius: '8px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'monospace',
      fontSize: '11px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        backgroundColor: '#2a2a4e',
        borderBottom: '1px solid #4a4a6a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: '8px 8px 0 0'
      }}>
        <span style={{ color: '#00ffff', fontWeight: 'bold' }}>🔍 Debug Console</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); copyLogs(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#00ff00',
              cursor: 'pointer',
              padding: '2px'
            }}
            title="Copiar logs"
          >
            <Copy size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); clearLogs(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff6b6b',
              cursor: 'pointer',
              padding: '2px'
            }}
            title="Limpiar logs"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div 
          ref={logsRef}
          style={{
            padding: '8px',
            overflowY: 'auto',
            maxHeight: '400px',
            backgroundColor: '#0a0a1e'
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              Esperando eventos...
            </div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index}
                style={{
                  padding: '4px',
                  borderBottom: '1px solid #1a1a3e',
                  color: log.type === 'KEYDOWN' ? '#00ff00' : 
                        log.type === 'KEYUP' ? '#ffff00' : 
                        log.type === 'CLICK' ? '#00ffff' : '#ffffff',
                  fontSize: '10px'
                }}
              >
                <span style={{ color: '#666' }}>[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                <span style={{ color: '#ff6b6b', marginLeft: '8px' }}>{log.type}</span>
                <span style={{ marginLeft: '8px' }}>
                  {log.type === 'KEYDOWN' || log.type === 'KEYUP' ? (
                    <>
                      key: <span style={{ color: '#00ffff' }}>{log.key}</span>
                      {log.ctrlKey && <span style={{ color: '#ff6b6b' }}> +Ctrl</span>}
                      {log.altKey && <span style={{ color: '#ff6b6b' }}> +Alt</span>}
                      {log.shiftKey && <span style={{ color: '#ff6b6b' }}> +Shift</span>}
                    </>
                  ) : (
                    <>
                      target: <span style={{ color: '#00ffff' }}>{log.target}</span>
                      x: {log.clientX}, y: {log.clientY}
                    </>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default DebugConsole
