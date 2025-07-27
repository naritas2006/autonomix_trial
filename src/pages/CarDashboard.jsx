import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import EventForm from '../components/EventForm';
import EventTable from '../components/EventTable';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

export default function CarDashboard() {
  const { wallet } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!wallet) {
      navigate('/signup');
    }
  }, [wallet, navigate]);

  return (
    <div className="min-h-screen bg-soft-gradient text-violet font-sans px-6 py-12">
      <motion.h1 className="text-4xl font-bold text-center text-blush font-heading mb-10" {...fadeIn}>
        🚗 Vehicle Dashboard
      </motion.h1>

      <div className="space-y-8">
        <EventForm />
        <EventTable />
      </div>
    </div>
  );
}
