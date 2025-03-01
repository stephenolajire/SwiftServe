import React, { useEffect } from "react";
import style from "../../css/MeetCourier.module.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaShieldAlt } from "react-icons/fa";
import { MdSpeed } from "react-icons/md";
import courier from "../../assets/courier.webp";

const MeetCourier = () => {
  useEffect(() => {
    AOS.init({
      duration: 2000, // Animation duration
      once: false, // Ensures the animation runs only once
    });
  }, []);
  return (
    <div className={style.container}>
      <h1 className={style.meet}>Meet Your Courier</h1>
      <p className={style.text}>
        We have a network of couriers who are ready to deliver your package to
        your desired location and are from the neighborhood. Our couriers are
        reliable, efficient, and professional. They are ready to deliver your
        package 24/7. All you need to do is sign up and get started.
      </p>
      <div className={style.courier}>
        <div className={style.container1}>
          <div>
            <div className={style.card} data-aos="fade-up">
              <FaShieldAlt size={40} className={style.icon} />
              <h3 className={style.name}>Reliable</h3>
            </div>
            <p className={style.info} data-aos="fade-up">
              Our carefully vetted couriers are dedicated to providing
              exceptional service. Each delivery partner undergoes thorough
              background checks and training to ensure the highest standards of
              professionalism and reliability. With real-time tracking, secure
              handling, and timely deliveries, you can trust our couriers to
              handle your packages with care. Whether it's same-day deliveries,
              scheduled pickups, or special handling requirements, our team is
              equipped to meet and exceed your expectations.
            </p>
          </div>
          <div>
            <div className={style.card} data-aos="fade-up">
              <MdSpeed size={40} className={style.icon} />
              <h3 className={style.name}>Efficient</h3>
            </div>
            <p className={style.info} data-aos="fade-up">
              Experience lightning-fast deliveries powered by our smart routing
              technology and dedicated courier network. Our automated dispatch
              system optimizes delivery routes in real-time, reducing wait times
              and ensuring maximum efficiency. With our streamlined process,
              packages are picked up within minutes and delivered through the
              fastest possible routes. Our platform's intelligent matching
              algorithm pairs orders with the nearest available couriers,
              minimizing delivery times while maximizing resource utilization.
            </p>
          </div>
        </div>
        <div className={style.container2} data-aos="zoom-in">
          <img src={courier} alt="courier" />
        </div>
      </div>
    </div>
  );
};

export default MeetCourier;
