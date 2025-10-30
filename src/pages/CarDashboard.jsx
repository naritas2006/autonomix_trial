import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import EventForm from '../components/EventForm';
import DebugEvents from '../pages/DebugEvents';
import AutonomixDPoS_ABI from '../contracts/AutonomixDPoS.json';
import AutonomixDataSharing_ABI from '../contracts/AutonomixDataShare.json';


const DPOS_CONTRACT_ADDRESS = "0xACA9492685809C431995e9591364165001A59583"; // DPoS
const AUTOX_TOKEN_ADDRESS = "0x693cf8cb08d57C19139C96D59e7DbC28460FD2A6"; // Token
const DATASHARING_CONTRACT_ADDRESS = "0xaa1AbEa9ADdfa8FC58e38afD704EAd0C972CEf9B"; //AutonomixDataSharing contract


const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

export default function CarDashboard() {
  const { wallet, connectWallet, disconnectWallet, contract } = useWallet();
  const [events, setEvents] = useState([]);
  const [dposTransactions, setDposTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataBlocks, setDataBlocks] = useState([]);


  // --- FETCH EVENTS SAFELY ---
  const fetchEvents = async () => {
    if (!contract) return;
    setLoading(true);

    try {
      const totalBN = await contract.totalEvents(); // ethers.BigNumber
      const total = Number(totalBN); // convert BigNumber to JS number

      const loadedEvents = [];

      for (let i = 0; i < total; i++) {
        const e = await contract.getEvent(i);

        // SAFELY extract fields from ethers v6 Typed object
        loadedEvents.push({
          vehicleId: e.vehicleId?.toString() || '',
          eventType: e.eventType || '',
          ipfsHash: e.ipfsHash || '',
          timestamp: e.timestamp
            ? new Date(Number(e.timestamp) * 1000).toLocaleString()
            : ''
        });
      }

      console.log('Loaded events:', loadedEvents); // DEBUG
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Error fetching contract data:', error);
    }

    setLoading(false);
  };

  // --- TEST EVENT (optional, just logs first event) ---
  const testEvent = async () => {
    if (!contract) return;
    try {
      const e = await contract.getEvent(0);
      console.log('Test event raw:', e);
    } catch (error) {
      console.error('Test event error:', error);
    }
  };

  const fetchDposTransactions = async () => {
    if (!wallet || !window.ethereum) return;
    setLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const dposContract = new ethers.Contract(DPOS_CONTRACT_ADDRESS, AutonomixDPoS_ABI, provider);

      // For now, we'll fetch all registered delegates and assume they are DPoS transactions.
      // In a real scenario, you'd likely have events emitted for stake/unstake operations.
      const registeredDelegates = await dposContract.registeredDelegates();
      const fetchedTransactions = [];

      for (const delegateAddress of registeredDelegates) {
        const stake = await dposContract.delegateStake(delegateAddress);
        fetchedTransactions.push({
          type: 'Stake',
          address: delegateAddress,
          amount: ethers.formatEther(stake),
          timestamp: 'N/A' // Placeholder, as we don't have event timestamps here
        });
      }
      setDposTransactions(fetchedTransactions);
    } catch (error) {
      console.error('Error fetching DPoS transactions:', error);
    }
    setLoading(false);
  };
const uploadData = async (metadata, ipfsHash) => {
  if (!wallet || !window.ethereum) return alert("Connect wallet first");
  setLoading(true);
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const dataSharing = new ethers.Contract(
      DATASHARING_CONTRACT_ADDRESS,
      AutonomixDataSharing_ABI,
      signer
    );

    const dataHash = ethers.keccak256(ethers.toUtf8Bytes(ipfsHash));
    const tx = await dataSharing.uploadData(metadata, dataHash);
    await tx.wait();

    alert("✅ Data uploaded successfully!");
  } catch (error) {
    console.error("Upload error:", error);
    alert("❌ Upload failed: " + error.message);
  }
  setLoading(false);
};
const fetchDataRecords = async () => {
  if (!window.ethereum) return alert("Please connect your wallet");
  setLoading(true);
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const dataSharing = new ethers.Contract(
      DATASHARING_CONTRACT_ADDRESS,
      AutonomixDataSharing_ABI,
      provider
    );

    const allData = await dataSharing.getAllData();
    console.log("📦 All Data Blocks:", allData);

    // Convert into readable format
    const formatted = allData.map((d) => ({
      carAddress: d.carAddress,
      metadata: d.metadata,
      dataHash: d.dataHash,
      verified: d.verified,
      timestamp: new Date(Number(d.timestamp) * 1000).toLocaleString(),
    }));

    setDataBlocks(formatted);
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    alert("Error fetching data records!");
  }
  setLoading(false);
};


  // --- EFFECTS ---
  useEffect(() => {
    testEvent();
  }, [contract]);

  useEffect(() => {
    if (wallet && contract) {
      fetchEvents();
      fetchDposTransactions();
    }
  }, [wallet, contract]);

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-soft-gradient text-violet font-sans px-6 py-12">
      <motion.h1 className="text-4xl font-bold text-center text-blush mb-10" {...fadeIn}>
        🚗 Vehicle Dashboard
      </motion.h1>

      <div className="mb-6 text-center space-x-4">
        {!wallet ? (
          <button
            onClick={connectWallet}
            className="px-6 py-2 bg-blush text-white rounded-lg hover:brightness-110 transition"
          >
            🔗 Connect Wallet
          </button>
        ) : (
          <>
            <button
              onClick={disconnectWallet}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:brightness-110 transition"
            >
              ❌ Disconnect Wallet
            </button>
            <button
              onClick={fetchEvents}
              className="px-4 py-2 bg-violet text-white rounded-lg hover:brightness-110 transition"
            >
              🔄 Refresh Events
            </button>
          </>
        )}
      </div>

      {wallet && (
        <>
          <EventForm onEventSubmitted={fetchEvents} />
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center text-blush mb-4">🕓 Event History</h2>

            {loading ? (
              <p className="text-center text-white">Loading events...</p>
            ) : (
              <table className="w-full table-auto border-collapse border border-violet">
                <thead>
                  <tr>
                    <th className="border border-violet px-2 py-1">Type</th>
                    <th className="border border-violet px-2 py-1">Vehicle ID / Zone</th>
                    <th className="border border-violet px-2 py-1">IPFS</th>
                    <th className="border border-violet px-2 py-1">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length ? (
                    events.map((e, idx) => (
                      <tr key={idx}>
                        <td className="border border-violet px-2 py-1">{e.eventType}</td>
                        <td className="border border-violet px-2 py-1">{e.vehicleId}</td>
                        <td className="border border-violet px-2 py-1">{e.ipfsHash}</td>
                        <td className="border border-violet px-2 py-1">{e.timestamp}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="border border-violet text-center py-2">
                        No events yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center text-blush mb-4">🗳️ DPoS Transactions</h2>
            {loading ? (
              <p className="text-center text-white">Loading DPoS transactions...</p>
            ) : (
              <table className="w-full table-auto border-collapse border border-violet">
                <thead>
                  <tr>
                    <th className="border border-violet px-2 py-1">Type</th>
                    <th className="border border-violet px-2 py-1">Address</th>
                    <th className="border border-violet px-2 py-1">Amount</th>
                    <th className="border border-violet px-2 py-1">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {dposTransactions.length ? (
                    dposTransactions.map((tx, idx) => (
                      <tr key={idx}>
                        <td className="border border-violet px-2 py-1">{tx.type}</td>
                        <td className="border border-violet px-2 py-1">{tx.address}</td>
                        <td className="border border-violet px-2 py-1">{tx.amount}</td>
                        <td className="border border-violet px-2 py-1">{tx.timestamp}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="border border-violet text-center py-2">
                        No DPoS transactions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          <div className="mt-8">
  <h2 className="text-2xl font-bold text-center text-blush mb-4">📦 Uploaded Data Records</h2>
  <div className="text-center mb-4">
    <button
      onClick={fetchDataRecords}
      className="px-4 py-2 bg-violet text-white rounded-lg hover:brightness-110 transition"
    >
      🔄 Refresh Data Blocks
    </button>
  </div>

  {loading ? (
    <p className="text-center text-white">Loading data records...</p>
  ) : (
    <table className="w-full table-auto border-collapse border border-violet">
      <thead>
        <tr>
          <th className="border border-violet px-2 py-1">Car Address</th>
          <th className="border border-violet px-2 py-1">Metadata</th>
          <th className="border border-violet px-2 py-1">Data Hash</th>
          <th className="border border-violet px-2 py-1">Verified</th>
          <th className="border border-violet px-2 py-1">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {dataBlocks.length ? (
          dataBlocks.map((b, idx) => (
            <tr key={idx}>
              <td className="border border-violet px-2 py-1">{b.carAddress}</td>
              <td className="border border-violet px-2 py-1">{b.metadata}</td>
              <td className="border border-violet px-2 py-1">{b.dataHash}</td>
              <td className="border border-violet px-2 py-1">
                {b.verified ? "✅ Yes" : "❌ No"}
              </td>
              <td className="border border-violet px-2 py-1">{b.timestamp}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="border border-violet text-center py-2">
              No data uploaded yet
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )}
</div>

        </>
      )}
    </div>
  );
}
