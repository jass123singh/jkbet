import React from 'react';
import Navbar from '../components/Navbar';
import ManualDeposit from '../components/ManualDeposit';

const AddMoney = () => {
  return (
    <>
      <Navbar />
      <div className="container page-content">
        <ManualDeposit />
      </div>
    </>
  );
};

export default AddMoney;
