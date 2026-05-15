import React from 'react';
import Navbar from '../components/Navbar';
import AdminManualWithdrawsComponent from '../components/AdminManualWithdraws';

const AdminManualWithdraws = () => {
  return (
    <>
      <Navbar />
      <div className="container page-content">
        <AdminManualWithdrawsComponent />
      </div>
    </>
  );
};

export default AdminManualWithdraws;
