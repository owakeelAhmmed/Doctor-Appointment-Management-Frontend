import React from 'react'
import Navbar from './components/share/Navbar'
import HeroCarousel from './components/home/HeroCarousel'
import CategorySection from './components/home/CategorySection'
import DoctorDashboardSection from './components/landingpage/DoctorDashboardSection'
import AppDownloadSection from './components/landingpage/AppDownloadSection'
import Footer from './components/share/Footer'

const page = () => {
  return (
    <>
     <Navbar />
     <HeroCarousel />
     <CategorySection />
     {/* <DoctorDashboardSection/> */}
     <AppDownloadSection/>
     <Footer/>
    </>
  )
}

export default page