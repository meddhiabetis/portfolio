import Hero from '../components/Hero'
import About from '../components/About'
import Experience from '../components/Experience'
import ProjectsCarousel from '../components/ProjectsCarousel'
import Education from '../components/Educations'
import Certifications from '../components/Certifications'
import Skills from '../components/Skills'
import Contact from '../components/Contact'
import Organizations from '../components/organisations'
import TrainingExperience from '../components/TrainingExperience'
import Languages from '../components/Languages'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <ProjectsCarousel />
      <Skills />
      <Education />
      <Organizations />
      <TrainingExperience />
      <Languages />
      <Certifications />
      <Contact />
    </>
  )
}
