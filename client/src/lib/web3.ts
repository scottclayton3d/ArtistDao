// Real implementation of web3 functionality using ethers.js v6
import { 
  JsonRpcProvider, 
  BrowserProvider, 
  Contract, 
  formatEther, 
  parseEther,
  Signer,
  ContractTransactionResponse,
  TransactionReceipt
} from "ethers";
import { Web3State } from "../types";

// Add type for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Extended type for success/error return values
type BuyTokensResult = { 
  success: boolean; 
  txHash?: string; 
  error?: string; 
}

// Network configuration - Polygon by default, with option to switch to Arbitrum
export const SUPPORTED_NETWORKS = {
  POLYGON: {
    name: "Polygon",
    chainId: 137,
    rpcUrl: "https://polygon-rpc.com",
    currencySymbol: "MATIC",
    blockExplorerUrl: "https://polygonscan.com",
  },
  POLYGON_MUMBAI: {
    name: "Polygon Mumbai",
    chainId: 80001,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    currencySymbol: "MATIC",
    blockExplorerUrl: "https://mumbai.polygonscan.com",
  },
  ARBITRUM: {
    name: "Arbitrum One",
    chainId: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    currencySymbol: "ETH",
    blockExplorerUrl: "https://arbiscan.io",
  },
  ARBITRUM_GOERLI: {
    name: "Arbitrum Goerli",
    chainId: 421613,
    rpcUrl: "https://goerli-rollup.arbitrum.io/rpc",
    currencySymbol: "ETH",
    blockExplorerUrl: "https://goerli.arbiscan.io",
  }
};

// Default network
export const DEFAULT_NETWORK = SUPPORTED_NETWORKS.POLYGON_MUMBAI;

// ABI for ArtistShare token contract
export const ARTIST_TOKEN_ABI = [
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // Write functions
  "function transfer(address to, uint256 value) returns (bool)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
  
  // Additional functions for ArtistShare
  "function mint(address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount) returns (bool)",
  "function distributeRevenue(uint256 amount) returns (bool)"
];

// ABI for governance contract
export const GOVERNANCE_ABI = [
  "function createProposal(string title, string description, string[] options, uint256 endTime) returns (uint256)",
  "function castVote(uint256 proposalId, uint256 optionIndex) returns (bool)",
  "function getProposal(uint256 proposalId) view returns (tuple(string, string, string[], uint256, uint256, bool))",
  "function getVotes(uint256 proposalId) view returns (uint256[])"
];

// ABI for NFT contract
export const NFT_ABI = [
  "function mint(address to, string uri, uint256 royalty) returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId)"
];

// Initial state for Web3 connection
export const initialWeb3State: Web3State = {
  address: null,
  chainId: null,
  balance: null,
  isConnected: false,
  isConnecting: false,
  error: null,
};

// Helper function to get provider (ethers v6 syntax)
const getProvider = () => {
  if (window.ethereum) {
    return new BrowserProvider(window.ethereum);
  }
  
  // Fallback to RPC provider if no injected provider
  return new JsonRpcProvider(DEFAULT_NETWORK.rpcUrl);
};

// Connect to wallet (ethers v6 syntax)
export const connectWallet = async (): Promise<Web3State> => {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error("No Ethereum wallet detected. Please install MetaMask.");
    }

    const provider = getProvider() as BrowserProvider;
    
    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" });
    
    // Get current account and chain
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    const chainId = parseInt(chainIdHex, 16);
    
    // Get account balance
    const balanceWei = await provider.getBalance(address);
    const balance = formatEther(balanceWei);
    
    return {
      address,
      chainId,
      balance,
      isConnected: true,
      isConnecting: false,
      error: null,
    };
  } catch (error: any) {
    console.error("Wallet connection error:", error);
    return {
      ...initialWeb3State,
      error: error.message || "Failed to connect wallet",
    };
  }
};

// Function to switch network
export const switchNetwork = async (chainId: number): Promise<boolean> => {
  try {
    if (!window.ethereum) return false;
    
    // Find network details
    const network = Object.values(SUPPORTED_NETWORKS).find(n => n.chainId === chainId);
    if (!network) return false;
    
    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // If network isn't added to MetaMask, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: {
                name: network.currencySymbol,
                symbol: network.currencySymbol,
                decimals: 18,
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.blockExplorerUrl],
            },
          ],
        });
        return true;
      }
      throw switchError;
    }
  } catch (error) {
    console.error("Network switch error:", error);
    return false;
  }
};

// Disconnect from wallet
export const disconnectWallet = async (): Promise<Web3State> => {
  // Note: Most wallets don't have a "disconnect" method.
  // We simply clear the local state and return to initial state.
  return initialWeb3State;
};

// Check if wallet is connected
export const checkWalletConnection = async (): Promise<Web3State> => {
  try {
    if (!window.ethereum) {
      return initialWeb3State;
    }
    
    const provider = getProvider() as BrowserProvider;
    
    try {
      const accounts = await provider.listAccounts();
      
      if (accounts.length === 0) {
        return initialWeb3State;
      }
      
      // Get current chain
      const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
      const chainId = parseInt(chainIdHex, 16);
      
      // Get account balance
      const address = await accounts[0].getAddress();
      const balanceWei = await provider.getBalance(address);
      const balance = formatEther(balanceWei);
      
      return {
        address,
        chainId,
        balance,
        isConnected: true,
        isConnecting: false,
        error: null,
      };
    } catch (error) {
      console.error("Check wallet connection error:", error);
      return initialWeb3State;
    }
  } catch (error: any) {
    console.error("Check wallet connection error:", error);
    return {
      ...initialWeb3State,
      error: error.message,
    };
  }
};

// Helper function to get contract instance
export const getContract = async (
  contractAddress: string, 
  abi: any,
  needSigner = true
) => {
  try {
    const provider = getProvider();
    
    if (needSigner && window.ethereum) {
      const browserProvider = provider as BrowserProvider;
      const signer = await browserProvider.getSigner();
      return new Contract(contractAddress, abi, signer);
    }
    
    return new Contract(contractAddress, abi, provider);
  } catch (error) {
    console.error("Get contract error:", error);
    throw error;
  }
};

// Function to buy artist tokens directly with crypto
export const buyTokens = async (
  artistContractAddress: string,
  amount: number,
  price: number
): Promise<BuyTokensResult> => {
  try {
    // For real implementation, this would interact with a smart contract
    const tokenContract = await getContract(artistContractAddress, ARTIST_TOKEN_ABI);
    
    // Calculate total price in wei
    const totalPriceWei = parseEther((amount * price).toString());
    
    // Execute transaction
    const tx = await tokenContract.mint(amount, { value: totalPriceWei });
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: typeof receipt.hash === 'string' ? receipt.hash : receipt.hash.toString()
    };
  } catch (error: any) {
    console.error("Buy tokens error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to buy tokens with USD (via backend integration with Stripe)
export const buyTokensWithUSD = async (
  artistId: number,
  amount: number,
  priceUSD: number,
  userId?: number
): Promise<{ checkoutUrl?: string; error?: string }> => {
  try {
    // This function would call our backend API, which would create a Stripe checkout session
    const response = await fetch(`/api/artists/${artistId}/buy-tokens-usd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, priceUSD, userId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }
    
    const data = await response.json();
    return { checkoutUrl: data.checkoutUrl };
  } catch (error: any) {
    console.error("Buy tokens with USD error:", error);
    return { error: error.message };
  }
};

// Function to cast vote on a proposal
export const castVote = async (
  contractAddress: string,
  proposalId: number,
  optionIndex: number
): Promise<boolean> => {
  try {
    const governanceContract = await getContract(contractAddress, GOVERNANCE_ABI);
    
    // Cast vote
    const tx = await governanceContract.castVote(proposalId, optionIndex);
    
    // Wait for transaction to be mined
    await tx.wait();
    
    return true;
  } catch (error) {
    console.error("Cast vote error:", error);
    return false;
  }
};