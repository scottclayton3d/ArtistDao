import { useState, useEffect, useCallback } from "react";
import { 
  connectWallet, 
  disconnectWallet, 
  checkWalletConnection,
  initialWeb3State
} from "@/lib/web3";
import { Web3State } from "@/types";

export function useWeb3() {
  const [web3State, setWeb3State] = useState<Web3State>(initialWeb3State);

  // Effect to check wallet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const state = await checkWalletConnection();
      setWeb3State(state);
    };
    
    checkConnection();
  }, []);

  // Connect wallet function
  const connect = useCallback(async () => {
    setWeb3State(prev => ({ ...prev, isConnecting: true }));
    
    try {
      const state = await connectWallet();
      setWeb3State(state);
    } catch (error) {
      setWeb3State(prev => ({
        ...prev,
        isConnecting: false,
        error: "Failed to connect wallet"
      }));
    }
  }, []);

  // Disconnect wallet function
  const disconnect = useCallback(async () => {
    const state = await disconnectWallet();
    setWeb3State(state);
  }, []);

  // Shorten address for display
  const shortenAddress = useCallback((address: string | null) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  return {
    ...web3State,
    connect,
    disconnect,
    shortenAddress,
  };
}
