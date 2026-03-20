import { useState } from 'react'
import { useLogStore } from '../store/logStore'
import { X } from 'lucide-react'
import styles from './LogViewer.module.css'

const LogViewer = ({ isOpen, onClose }) => {
  const { logs, clearLogs } = useLogStore()
  const [filter, setFilter] = useState('all')

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter)

  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>📋 Logs ({filteredLogs.length})</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        {/* Filter Buttons */}
        <div className={styles.filterContainer}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('log')}
            className={`${styles.filterBtn} ${filter === 'log' ? styles.active : ''}`}
          >
            Logs
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`${styles.filterBtn} ${filter === 'error' ? styles.active : ''}`}
          >
            Errors
          </button>
          <button
            onClick={() => setFilter('warn')}
            className={`${styles.filterBtn} ${filter === 'warn' ? styles.active : ''}`}
          >
            Warnings
          </button>
        </div>

        {/* Logs Container */}
        <div className={styles.logsContainer}>
          {filteredLogs.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No logs yet</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className={`${styles.logEntry} ${styles[log.type]}`}>
                <div className={styles.logHeader}>
                  <span className={styles.logType}>
                    {log.type === 'error' && '❌'}
                    {log.type === 'warn' && '⚠️'}
                    {log.type === 'log' && 'ℹ️'}
                  </span>
                  <span className={styles.logTime}>{log.timestamp}</span>
                </div>
                <div className={styles.logMessage}>{log.message}</div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button onClick={clearLogs} className={styles.clearBtn}>
            Clear All Logs
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogViewer
