import Hero from '../components/Hero'
import About from '../components/About'
import Experience from '../components/Experience'
import ProjectsCarousel from '../components/ProjectsCarousel'
import Education from '../components/Educations'
import Certifications from '../components/Certifications'
import Skills from '../components/Skills'
import Contact from '../components/Contact'
import ChatBot from '../components/ChatBot' // floating chatbot
import Organizations from '../components/organisations'
import TrainingExperience from '../components/TrainingExperience'
import Languages from '../components/Languages'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Education />
      <Organizations />
      <TrainingExperience />
      <ProjectsCarousel />
      <Skills />
      <Languages />
      <Certifications />
      <Contact />
      {/* Floating chatbot mounts here; it's fixed-positioned so it won't affect layout */}
      <ChatBot />
    </>
  )
}