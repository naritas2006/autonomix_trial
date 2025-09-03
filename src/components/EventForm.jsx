import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';

export default function EventForm({ refreshEvents }) {
  const { wallet, contract } = useWallet();
  const [vehicleId, setVehicleId] = useState('');
  const [eventType, setEventType] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wallet) return alert('Connect your wallet first!');
    if (!contract) return alert('Contract not loaded');

    try {
      const tx = await contract.logEvent(vehicleId, eventType, ipfsHash);
      await tx.wait();
      alert('Event logged successfully!');
      setVehicleId('');
      setEventType('');
      setIpfsHash('');
      refreshEvents(); // optionally refresh dashboard
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Check console.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center text-blush">Log New Road Event</h2>
      <input
        type="text"
        placeholder="Vehicle ID / Zone"
        value={vehicleId}
        onChange={(e) => setVehicleId(e.target.value)}
        className="w-full p-2 border border-violet rounded"
        required
      />
      <input
        type="text"
        placeholder="Event Type"
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
        className="w-full p-2 border border-violet rounded"
        required
      />
      <input
        type="text"
        placeholder="IPFS Hash (optional)"
        value={ipfsHash}
        onChange={(e) => setIpfsHash(e.target.value)}
        className="w-full p-2 border border-violet rounded"
      />
      <button type="submit" className="w-full py-2 bg-blush text-white rounded-lg hover:brightness-110 transition">
        Submit Event
      </button>
    </form>
  );
}
