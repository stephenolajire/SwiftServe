import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const handleRateDelivery = async (delivery) => {
  const { value: rating } = await Swal.fire({
    title: 'Rate Your Delivery',
    text: `How would you rate ${delivery.worker_name}'s service?`,
    input: 'select',
    inputOptions: {
      1: '⭐ Poor',
      2: '⭐⭐ Fair',
      3: '⭐⭐⭐ Good',
      4: '⭐⭐⭐⭐ Very Good',
      5: '⭐⭐⭐⭐⭐ Excellent'
    },
    inputPlaceholder: 'Select a rating',
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return 'Please select a rating';
      }
    },
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#6c757d'
  });

  if (rating) {
    try {
      const response = await api.post(`deliveries/${delivery.id}/rate/`, {
        rating: parseInt(rating)
      });

      if (response.data.status === 'success') {
        await Swal.fire({
          title: 'Thank You!',
          text: 'Your rating has been submitted successfully',
          icon: 'success',
          confirmButtonColor: '#28a745'
        });
        await fetchDeliveries(); // Refresh deliveries list
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to submit rating',
        icon: 'error'
      });
    }
  }
};

export default handleRateDelivery;