/**
 * Pure network-state manager.
 * Tracks online/offline browser connectivity and notifies subscribers.
 * Does NOT perform any weather fetching or duplicate requests.
 */

class OfflineManager {
  constructor () {
    this.listeners = new Set()
    this.reconnectTimer = null
    this.debounceMs = 500

    this.handleOnline = this.handleOnline.bind(this)
    this.handleOffline = this.handleOffline.bind(this)

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    }
  }

  /**
   * Current online status
   * @returns {boolean}
   */
  isOnline () {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine
    }
    return true
  }

  handleOnline () {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    // Debounce reconnect event to stabilize network flutters
    this.reconnectTimer = setTimeout(() => {
      this.notify({ isOnline: true })
    }, this.debounceMs)
  }

  handleOffline () {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.notify({ isOnline: false })
  }

  /**
   * Subscribe to network changes
   * @param {(state: { isOnline: boolean }) => void} listener 
   * @returns {() => void} unsubscribe function
   */
  subscribe (listener) {
    if (typeof listener !== 'function') return () => {}
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  notify (state) {
    for (const listener of this.listeners) {
      try {
        listener(state)
      } catch (err) {
        console.warn('OfflineManager: Error in subscriber listener:', err)
      }
    }
  }

  destroy () {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.listeners.clear()
  }
}

export const offlineManager = new OfflineManager()

