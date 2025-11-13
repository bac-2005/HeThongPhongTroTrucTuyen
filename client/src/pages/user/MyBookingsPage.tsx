import React from 'react';
import '../../css/MyBookingsPage.css';
import MyBookings from '../../components/user/MyBookings';

const MyBookingsPage = () => {
  return (
    <div className="page-container">
      <h1>Yêu cầu đặt phòng của tôi</h1>
      <MyBookings />
    </div>
  );
};

export default MyBookingsPage;
