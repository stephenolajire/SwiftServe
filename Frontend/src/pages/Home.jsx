import React from 'react'
import Hero from '../components/HomeComponents/Hero'
import HowItWorks from '../components/HomeComponents/HowItWorks'

const Home = () => {
  return (
    <main style={{ marginTop: "10rem", width:"100%"}}>
      <Hero />
      <HowItWorks />
    </main>
  )
}

export default Home
