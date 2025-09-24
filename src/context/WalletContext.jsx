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

  const HARDHAT_CHAIN_ID = '0x7A69'; // 31337 in hex

  // Switch MetaMask network to Hardhat localhost
  const switchToHardhat = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HARDHAT_CHAIN_ID }],
      });
    } catch (switchError) {
      // If network not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: HARDHAT_CHAIN_ID,
            chainName: 'Hardhat Localhost',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['http://127.0.0.1:8545'],
            blockExplorerUrls: null,
          }],
        });
      } else {
        console.error('Failed to switch network:', switchError);
      }
    }
  };

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not found! Install MetaMask extension.');
      return;
    }

    try {
      await switchToHardhat(); // Ensure correct network

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

  // Disconnect wallet
  const disconnectWallet = async () => {
    setWallet(null);
    setContract(null);
    setSigner(null);
    setProvider(null);
    // Optional: reset permissions in MetaMask
    if (window.ethereum?.request) {
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (err) {
        console.error('Failed to reset MetaMask connection:', err);
      }
    }
  };

  // Detect account change
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

      const handleChainChanged = (_chainId) => {
        if (_chainId !== HARDHAT_CHAIN_ID) {
          console.warn('Switched to wrong network, reconnecting...');
          switchToHardhat();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
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
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
