import { createContext, useContext, useState, useEffect } from "react";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("wallet");
    if (saved) setWallet(saved);
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
      localStorage.setItem("wallet", accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed", err);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    localStorage.removeItem("wallet");
  };

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
