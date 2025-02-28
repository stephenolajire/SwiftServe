import React, { useEffect } from 'react'
import style from "../../css/Hero.module.css";
import hero from "../../assets/hero.webp";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const Hero = () => {

  useEffect(() => {
    AOS.init({
      duration: 2000, // Animation duration
      once: false, // Ensures the animation runs only once
    });
  }, []);
  return (
    <div className={style.container} data-aos="fade-up">
      <div className={style.hero}>
        <h1 data-aos="fade-up" className={style.heroHeader}>
          Revolutionizing <br /> Delivery: <br /> Empowering <br /> Your Errands
        </h1>
        <p className={style.heroText} data-aos="fade-up">
          Experience the ultimate in on-demand delivery and errand services with
          our cutting-edge platform, designed to make your life easier.
          Meet your new assistant ready to get your items delivered at your
          service 24/7. All you need to do is sign up and get started.
        </p>

        <div className={style.heroButtons}>
          <Link to="signup">
            <button className={style.heroButton}>
              Get Started
            </button>
          </Link>
          <Link to="about">
            <button className={style.learnMore}>Learn More</button>  
          </Link>
        </div>
      </div>

      <div data-aos="zoom-in"
        className={style.heroImage}
        style={{
          backgroundImage: `url(${hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          objectFit: "cover",
          width: "100%",
        }}
      ></div>
    </div>
  );
}

export default Hero
