import { useState } from 'react'
import { installHintDismissed, dismissInstallHint } from '../lib/prefs.js'

// True on an iPhone/iPad running Safari (not already installed as a PWA).
function shouldShow() {
  if (typeof navigator === 'undefined') return false
  if (installHintDismissed()) return false
  const ua = navigator.userAgent || ''
  const isIOS = /iPhone|iPad|iPod/.test(ua)
  // navigator.standalone is true when launched from the Home Screen.
  const standalone =
    navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
  return isIOS && !standalone
}

export default function InstallHint() {
  const [show, setShow] = useState(shouldShow)
  if (!show) return null

  return (
    <div className="install-hint">
      <span>
        📲 Install this app: tap <strong>Share</strong> then{' '}
        <strong>Add to Home Screen</strong>.
      </span>
      <button
        className="icon-btn"
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          dismissInstallHint()
          setShow(false)
        }}
      >
        ✕
      </button>
    </div>
  )
}
