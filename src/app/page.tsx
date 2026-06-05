import Slider from "@/components/Slider";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CoursesSection from "@/components/CoursesSection";
import Footer from "@/components/Footer";

const HomePage = () => {
  return (
    <div className="">
      <Slider />
      <HeroSection />
      <AboutSection />
      <CoursesSection />
      <Footer />
    </div>
  );
};

export default HomePage;
