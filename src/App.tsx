import Hero from './components/Hero'
import Mixtape from './components/Mixtape'
import DjDeck from './components/DjDeck'
import PhotoWall from './components/PhotoWall'
import Message from './components/Message'
import Tweaks from './components/Tweaks'
import { useEffect } from 'react'
import { initConfetti } from './lib/confetti'

export default function App() {
  useEffect(() => {
    initConfetti()
  }, [])

  return (
    <>
      <Hero />
      <Mixtape />
      <DjDeck />
      <PhotoWall />
      <Message />
      <Tweaks />
      <canvas id="confetti" />
    </>
  )
}
