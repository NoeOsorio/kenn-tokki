import Hero from './components/Hero'
import Mixtape from './components/Mixtape'
import DjDeck from './components/DjDeck'
import PhotoWall from './components/PhotoWall'
import Message from './components/Message'
import Footer from './components/Footer'
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
      <Footer />
      <div id="confetti" className="confetti" />
    </>
  )
}
