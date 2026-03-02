import { useState, useEffect } from 'react'

/**
 * Typing effect hook. Reveals text character by character.
 * @param {string} fullText - Full text to type
 * @param {number} speed - Ms per character
 * @param {boolean} start - Whether to start typing
 */
export function useTypingEffect(fullText, speed = 40, start = true) {
  const [display, setDisplay] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!start || !fullText) {
      setDisplay('')
      setDone(false)
      return
    }
    setDisplay('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      if (i >= fullText.length) {
        clearInterval(id)
        setDone(true)
        return
      }
      setDisplay(fullText.slice(0, i + 1))
      i += 1
    }, speed)
    return () => clearInterval(id)
  }, [fullText, speed, start])

  return { display, done }
}
