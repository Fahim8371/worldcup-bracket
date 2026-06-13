import { useRef, useState } from 'react'

// Swipeable full-screen slides explaining how the app works. Used both inside
// onboarding and as a standalone overlay (replayed from Settings).
const SLIDES = [
  {
    icon: '📅',
    title: 'Fixtures in your time',
    body: 'Every game is shown in your local timezone. Your favourite teams are highlighted; all other games are greyed out — but their scores stay visible so you never miss a result.',
  },
  {
    icon: '🏆',
    title: 'Groups & Bracket',
    body: 'The Groups tab shows live standings for each group. The Bracket tab fills in the knockout rounds as the tournament progresses.',
  },
  {
    icon: '⭐',
    title: 'Build your watch calendar',
    body: 'Tap the star on ANY game — even a greyed-out one — to add it to your Calendar tab. There you get a month view and an "Up Next" list so you always know what you\'re watching next.',
  },
  {
    icon: '⚙️',
    title: 'Make it yours',
    body: 'Open Settings to change your timezone, switch between dark and light mode, or edit your favourite teams. Everything is saved privately on this device.',
  },
]

export default function Guide({ onDone, doneLabel = 'Done' }) {
  const [i, setI] = useState(0)
  const startX = useRef(null)
  const last = i === SLIDES.length - 1
  const slide = SLIDES[i]

  function next() {
    if (last) onDone()
    else setI((n) => n + 1)
  }
  function prev() {
    setI((n) => Math.max(0, n - 1))
  }

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX
  }
  function onTouchEnd(e) {
    if (startX.current == null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (dx < -40) next()
    else if (dx > 40) prev()
    startX.current = null
  }

  return (
    <div className="guide" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="guide-card">
        <button className="guide-skip" type="button" onClick={onDone}>
          Skip
        </button>
        <div className="guide-icon">{slide.icon}</div>
        <h2>{slide.title}</h2>
        <p className="muted">{slide.body}</p>

        <div className="guide-dots">
          {SLIDES.map((_, n) => (
            <span key={n} className={`dot ${n === i ? 'active' : ''}`} />
          ))}
        </div>

        <div className="guide-actions">
          <button
            className="btn ghost"
            type="button"
            onClick={prev}
            disabled={i === 0}
            style={{ visibility: i === 0 ? 'hidden' : 'visible' }}
          >
            Back
          </button>
          <button className="btn primary" type="button" onClick={next}>
            {last ? doneLabel : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
