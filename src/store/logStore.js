import { create } from 'zustand'

export const useLogStore = create((set, get) => {
  return {
    logs: [],
    addLog: (message, type = 'log') =>
      set((state) => ({
        logs: [
          ...state.logs,
          {
            id: Date.now() + Math.random(),
            type,
            message,
            timestamp: new Date().toLocaleTimeString(),
          }
        ]
      })),
    clearLogs: () => set({ logs: [] }),
  }
})

// Override console methods globally
const originalLog = console.log
const originalError = console.error
const originalWarn = console.warn

console.log = (...args) => {
  originalLog(...args)
  useLogStore.setState((state) => ({
    logs: [
      ...state.logs,
      {
        id: Date.now() + Math.random(),
        type: 'log',
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '),
        timestamp: new Date().toLocaleTimeString(),
      }
    ]
  }))
}

console.error = (...args) => {
  originalError(...args)
  useLogStore.setState((state) => ({
    logs: [
      ...state.logs,
      {
        id: Date.now() + Math.random(),
        type: 'error',
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '),
        timestamp: new Date().toLocaleTimeString(),
      }
    ]
  }))
}

console.warn = (...args) => {
  originalWarn(...args)
  useLogStore.setState((state) => ({
    logs: [
      ...state.logs,
      {
        id: Date.now() + Math.random(),
        type: 'warn',
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '),
        timestamp: new Date().toLocaleTimeString(),
      }
    ]
  }))
}
