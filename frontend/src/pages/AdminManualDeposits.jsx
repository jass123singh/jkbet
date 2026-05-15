import React from 'react';
import Navbar from '../components/Navbar';
import AdminManualDepositsComponent from '../components/AdminManualDeposits';

const AdminManualDeposits = () => {
  return (
    <>
      <Navbar />
      <div className="container page-content">
        <AdminManualDepositsComponent />
      </div>
    </>
  );
};

export default AdminManualDeposits;
