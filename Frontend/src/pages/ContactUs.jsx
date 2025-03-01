import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import styles from '../css/ContactUs.module.css';
import Swal from 'sweetalert2';

const Contact = () => {
  const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    subject: yup.string().required('Subject is required'),
    message: yup.string().required('Message is required').min(10, 'Message must be at least 10 characters'),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      // Add your API call here
      console.log(data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call

      Swal.fire({
        title: 'Success!',
        text: 'Your message has been sent successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      reset();
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to send message. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Contact Us</h1>
        <p>Get in touch with us for any questions or concerns</p>
      </div>

      <div className={styles.contentWrapper}>
        {/* Contact Information */}
        <div className={styles.contactInfo}>
          <h2>Get In Touch</h2>
          <div className={styles.infoItems}>
            <div className={styles.infoItem}>
              <FaPhone className={styles.icon} />
              <div>
                <h3>Phone</h3>
                <p>+1 (555) 123-4567</p>
                <p>Mon-Fri 9am-6pm</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <FaEnvelope className={styles.icon} />
              <div>
                <h3>Email</h3>
                <p>support@swiftserve.com</p>
                <p>24/7 Online Support</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <FaMapMarkerAlt className={styles.icon} />
              <div>
                <h3>Office</h3>
                <p>123 Business Avenue</p>
                <p>New York, NY 10001</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <FaClock className={styles.icon} />
              <div>
                <h3>Hours</h3>
                <p>Monday - Friday</p>
                <p>9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className={styles.formSection}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                {...register('name')}
                className={errors.name ? styles.errorInput : ''}
                placeholder="Your name"
              />
              {errors.name && <span className={styles.errorMessage}>{errors.name.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                {...register('email')}
                className={errors.email ? styles.errorInput : ''}
                placeholder="Your email"
              />
              {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Subject</label>
              <input
                type="text"
                {...register('subject')}
                className={errors.subject ? styles.errorInput : ''}
                placeholder="Message subject"
              />
              {errors.subject && <span className={styles.errorMessage}>{errors.subject.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Message</label>
              <textarea
                {...register('message')}
                className={errors.message ? styles.errorInput : ''}
                placeholder="Your message"
                rows="5"
              />
              {errors.message && <span className={styles.errorMessage}>{errors.message.message}</span>}
            </div>

            <button type="submit" className={styles.submitButton}>
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Map Section */}
      <div className={styles.mapSection}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.30596670385!2d-74.25986548727506!3d40.69714941932609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1645564658896!5m2!1sen!2s"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="location"
        />
      </div>
    </div>
  );
};

export default Contact;