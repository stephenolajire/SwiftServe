import React, {useEffect} from "react";
import style from "../../css/HowItWorks.module.css";
import AOS from "aos";
import "aos/dist/aos.css";

const HowItWorks = () => {
  useEffect(() => {
      AOS.init({
        duration: 2000, // Animation duration
        once: false, // Ensures the animation runs only once
      });
    }, []);

  return (
    <div className={style.howItWorks}> 
      <div data-aos="zoom-in">
        <h1>About Us</h1>
        <p>
          We are a platform that connects you with a courier (in your
          neighborhood) who can deliver your package to your desired location.
          We have a network of couriers who are ready to deliver your package to
          your desired location.
        </p>
      </div>
      <div data-aos="slide-up">
        <h1>Our Platform</h1>
        <p>
          We offer a seamless and user-friendly experience, with real-time
          tracking of your package. We also offer competitive prices and
          excellent customer service.
        </p>
      </div>
      <div data-aos="zoom-in">
        <h1>The Benefits</h1>
        <p>
          From time-saving convenience to cost-effective solutions, our platform
          provides the ultimate in courier services. We offer a range of
          benefits, including same-day delivery, secure transactions, and a
          network of reliable couriers.
        </p>
      </div>
    </div>
  );
};

export default HowItWorks;
