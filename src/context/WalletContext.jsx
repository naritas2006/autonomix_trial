import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AutonomixABI from '../contracts/AutonomixDataShare.json';
import contractAddress from '../contracts/contractAddress.json';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Connect MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask not found! Install MetaMask extension.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _wallet = accounts[0];

      const _contract = new ethers.Contract(
        contractAddress.AutonomixDataShare,
        AutonomixABI.abi,
        _signer
      );

      setProvider(_provider);
      setSigner(_signer);
      setWallet(_wallet);
      setContract(_contract);

      console.log('Connected account:', _wallet);
    } catch (error) {
      console.error('User rejected request or error:', error);
    }
  };

  // Disconnect MetaMask (resets all state)
  const disconnectWallet = async () => {
  setWallet(null);
  setContract(null);
  setSigner(null);
  setProvider(null);

  // Optional: tell MetaMask to disconnect site
  if (window.ethereum?.request) {
    try {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
    } catch (err) {
      console.error('Failed to reset MetaMask connection:', err);
    }
  }
};


  // Detect account change in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          // Automatically switch to new account
          connectWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        provider,
        signer,
        contract,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
