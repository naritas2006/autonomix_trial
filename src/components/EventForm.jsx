import React, { useState } from 'react';

export default function EventForm() {
  const [eventType, setEventType] = useState('');
  const [zone, setZone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting event:', eventType, zone);
    // Call smart contract's reportEvent() here
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur p-6 rounded-xl space-y-4">
      <h3 className="text-xl font-semibold text-blush">📍 Report Road Event</h3>

      <select
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
        className="w-full p-2 border border-borderLight rounded-md"
        required
      >
        <option value="">Select Event Type</option>
        <option value="Pothole">Pothole</option>
        <option value="Accident">Accident</option>
        <option value="Fog">Fog</option>
        <option value="Construction">Construction</option>
      </select>

      <select
        value={zone}
        onChange={(e) => setZone(e.target.value)}
        className="w-full p-2 border border-borderLight rounded-md"
        required
      >
        <option value="">Select Location</option>
        <option value="Zone A">Zone A</option>
        <option value="Zone B">Zone B</option>
        <option value="Zone C">Zone C</option>
      </select>

      {/* Future: add image upload → IPFS */}
      <button type="submit" className="w-full py-2 bg-blush text-white rounded-lg hover:brightness-110">
        Submit Event
      </button>
    </form>
  );
}
