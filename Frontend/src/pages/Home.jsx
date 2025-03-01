import React from 'react'
import Hero from '../components/HomeComponents/Hero'
import HowItWorks from '../components/HomeComponents/HowItWorks'
import MeetCourier from '../components/HomeComponents/MeetCourier'

const Home = () => {
  return (
    <main style={{ marginTop: "10rem", width:"100%"}}>
      <Hero />
      <HowItWorks />
      <MeetCourier/>
    </main>
  )
}

export default Home
