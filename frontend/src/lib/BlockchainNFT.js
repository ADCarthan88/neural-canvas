/**
 * Blockchain NFT Export System
 * Mint neural canvas creations as NFTs on multiple chains
 */

import { ethers } from 'ethers';

export class BlockchainNFTEngine {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = new Map();
    this.supportedChains = {
      1: { name: 'Ethereum', rpc: 'https://mainnet.infura.io/v3/', symbol: 'ETH' },
      137: { name: 'Polygon', rpc: 'https://polygon-rpc.com/', symbol: 'MATIC' },
      56: { name: 'BSC', rpc: 'https://bsc-dataseed.binance.org/', symbol: 'BNB' },
      43114: { name: 'Avalanche', rpc: 'https://api.avax.network/ext/bc/C/rpc', symbol: 'AVAX' },
      250: { name: 'Fantom', rpc: 'https://rpc.ftm.tools/', symbol: 'FTM' },
      42161: { name: 'Arbitrum', rpc: 'https://arb1.arbitrum.io/rpc', symbol: 'ETH' },
      10: { name: 'Optimism', rpc: 'https://mainnet.optimism.io', symbol: 'ETH' }
    };
    
    this.currentChain = 1; // Ethereum default
    this.ipfsGateway = 'https://ipfs.io/ipfs/';
    this.pinataApiKey = null;
    this.pinataSecretKey = null;
  }

  // Initialize Web3 connection
  async initialize() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        
        // Get current chain
        const network = await this.provider.getNetwork();
        this.currentChain = network.chainId;
        
        console.log(`🔗 Connected to ${this.supportedChains[this.currentChain]?.name || 'Unknown'} network`);
        
        // Listen for chain changes
        window.ethereum.on('chainChanged', (chainId) => {
          this.currentChain = parseInt(chainId, 16);
          this.onChainChanged?.(this.currentChain);
        });
        
        return true;
      } catch (error) {
        console.error('Failed to initialize Web3:', error);
        return false;
      }
    } else {
      console.error('MetaMask not detected');
      return false;
    }
  }

  // Switch to different blockchain
  async switchChain(chainId) {
    if (!this.supportedChains[chainId]) {
      throw new Error('Unsupported chain');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
      
      this.currentChain = chainId;
      return true;
    } catch (error) {
      // Chain not added to wallet, try to add it
      if (error.code === 4902) {
        return await this.addChainToWallet(chainId);
      }
      throw error;
    }
  }

  // Add chain to wallet
  async addChainToWallet(chainId) {
    const chain = this.supportedChains[chainId];
    
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${chainId.toString(16)}`,
          chainName: chain.name,
          rpcUrls: [chain.rpc],
          nativeCurrency: {
            name: chain.symbol,
            symbol: chain.symbol,
            decimals: 18
          }
        }]
      });
      
      this.currentChain = chainId;
      return true;
    } catch (error) {
      console.error('Failed to add chain:', error);
      return false;
    }
  }

  // Upload to IPFS
  async uploadToIPFS(canvasData, metadata) {
    if (!this.pinataApiKey) {
      throw new Error('Pinata API keys not configured');
    }

    try {
      // Upload image to IPFS
      const imageFormData = new FormData();
      imageFormData.append('file', canvasData.imageBlob);
      
      const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey
        },
        body: imageFormData
      });
      
      const imageResult = await imageResponse.json();
      const imageHash = imageResult.IpfsHash;
      
      // Create NFT metadata
      const nftMetadata = {
        name: metadata.name || 'Neural Canvas Creation',
        description: metadata.description || 'AI-powered neural canvas artwork',
        image: `ipfs://${imageHash}`,
        attributes: [
          { trait_type: 'Mode', value: canvasData.mode },
          { trait_type: 'Intensity', value: canvasData.intensity },
          { trait_type: 'Particles', value: canvasData.particleCount },
          { trait_type: 'Colors', value: `${canvasData.primaryColor}-${canvasData.secondaryColor}` },
          { trait_type: 'Created With', value: 'Neural Canvas Platform' },
          { trait_type: 'Accessibility', value: canvasData.accessibility ? 'Inclusive Design' : 'Standard' },
          { trait_type: 'AI Generated', value: canvasData.aiGenerated ? 'Yes' : 'No' },
          { trait_type: 'Collaboration', value: canvasData.collaborative ? 'Multi-User' : 'Solo' },
          { trait_type: 'VR/AR Ready', value: canvasData.vrArCompatible ? 'Yes' : 'No' }
        ],
        properties: {
          canvas_state: canvasData.state,
          creation_timestamp: Date.now(),
          platform_version: '2.0.0',
          blockchain: this.supportedChains[this.currentChain].name
        }
      };
      
      // Upload metadata to IPFS
      const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey
        },
        body: JSON.stringify(nftMetadata)
      });
      
      const metadataResult = await metadataResponse.json();
      
      return {
        imageHash,
        metadataHash: metadataResult.IpfsHash,
        metadata: nftMetadata
      };
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw error;
    }
  }

  // Deploy NFT contract (if needed)
  async deployNFTContract(name = 'Neural Canvas NFT', symbol = 'NCNFT') {
    const contractCode = `
      // SPDX-License-Identifier: MIT
      pragma solidity ^0.8.0;
      
      import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
      import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
      import "@openzeppelin/contracts/access/Ownable.sol";
      import "@openzeppelin/contracts/utils/Counters.sol";
      
      contract NeuralCanvasNFT is ERC721, ERC721URIStorage, Ownable {
          using Counters for Counters.Counter;
          Counters.Counter private _tokenIdCounter;
          
          mapping(uint256 => string) private _canvasStates;
          mapping(uint256 => address) private _creators;
          
          event CanvasMinted(uint256 tokenId, address creator, string canvasState);
          
          constructor() ERC721("${name}", "${symbol}") {}
          
          function mintCanvas(address to, string memory uri, string memory canvasState) 
              public returns (uint256) {
              uint256 tokenId = _tokenIdCounter.current();
              _tokenIdCounter.increment();
              
              _safeMint(to, tokenId);
              _setTokenURI(tokenId, uri);
              _canvasStates[tokenId] = canvasState;
              _creators[tokenId] = to;
              
              emit CanvasMinted(tokenId, to, canvasState);
              return tokenId;
          }
          
          function getCanvasState(uint256 tokenId) public view returns (string memory) {
              require(_exists(tokenId), "Token does not exist");
              return _canvasStates[tokenId];
          }
          
          function getCreator(uint256 tokenId) public view returns (address) {
              require(_exists(tokenId), "Token does not exist");
              return _creators[tokenId];
          }
          
          function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
              super._burn(tokenId);
          }
          
          function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) 
              returns (string memory) {
              return super.tokenURI(tokenId);
          }
      }
    `;
    
    // This would require a Solidity compiler - simplified for demo
    console.log('Contract deployment would happen here');
    return '0x1234567890123456789012345678901234567890'; // Mock address
  }

  // Mint NFT
  async mintNFT(canvasData, metadata, contractAddress = null) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      // Upload to IPFS first
      const ipfsResult = await this.uploadToIPFS(canvasData, metadata);
      
      // Use existing contract or deploy new one
      if (!contractAddress) {
        contractAddress = await this.deployNFTContract();
      }
      
      // Contract ABI (simplified)
      const contractABI = [
        "function mintCanvas(address to, string memory uri, string memory canvasState) public returns (uint256)",
        "function getCanvasState(uint256 tokenId) public view returns (string memory)",
        "function ownerOf(uint256 tokenId) public view returns (address)"
      ];
      
      const contract = new ethers.Contract(contractAddress, contractABI, this.signer);
      const userAddress = await this.signer.getAddress();
      
      // Mint the NFT
      const tokenURI = `ipfs://${ipfsResult.metadataHash}`;
      const canvasState = JSON.stringify(canvasData.state);
      
      const tx = await contract.mintCanvas(userAddress, tokenURI, canvasState);
      const receipt = await tx.wait();
      
      // Extract token ID from events
      const mintEvent = receipt.events?.find(e => e.event === 'CanvasMinted');
      const tokenId = mintEvent?.args?.tokenId?.toString();
      
      return {
        tokenId,
        transactionHash: receipt.transactionHash,
        contractAddress,
        tokenURI,
        ipfsHashes: ipfsResult,
        chainId: this.currentChain,
        chainName: this.supportedChains[this.currentChain].name
      };
    } catch (error) {
      console.error('NFT minting failed:', error);
      throw error;
    }
  }

  // Get NFT details
  async getNFTDetails(contractAddress, tokenId) {
    const contractABI = [
      "function tokenURI(uint256 tokenId) public view returns (string memory)",
      "function ownerOf(uint256 tokenId) public view returns (address)",
      "function getCanvasState(uint256 tokenId) public view returns (string memory)",
      "function getCreator(uint256 tokenId) public view returns (address)"
    ];
    
    const contract = new ethers.Contract(contractAddress, contractABI, this.provider);
    
    try {
      const [tokenURI, owner, canvasState, creator] = await Promise.all([
        contract.tokenURI(tokenId),
        contract.ownerOf(tokenId),
        contract.getCanvasState(tokenId),
        contract.getCreator(tokenId)
      ]);
      
      return {
        tokenId,
        tokenURI,
        owner,
        creator,
        canvasState: JSON.parse(canvasState),
        contractAddress,
        chainId: this.currentChain
      };
    } catch (error) {
      console.error('Failed to get NFT details:', error);
      throw error;
    }
  }

  // List NFT on marketplace
  async listOnMarketplace(tokenId, price, marketplaceType = 'opensea') {
    const marketplaces = {
      opensea: {
        name: 'OpenSea',
        url: `https://opensea.io/assets/${this.currentChain}`,
        api: 'https://api.opensea.io/api/v1'
      },
      rarible: {
        name: 'Rarible',
        url: 'https://rarible.com',
        api: 'https://api.rarible.org'
      },
      foundation: {
        name: 'Foundation',
        url: 'https://foundation.app',
        api: 'https://api.foundation.app'
      }
    };
    
    const marketplace = marketplaces[marketplaceType];
    if (!marketplace) {
      throw new Error('Unsupported marketplace');
    }
    
    // This would integrate with marketplace APIs
    console.log(`Listing NFT ${tokenId} on ${marketplace.name} for ${price} ETH`);
    
    return {
      marketplace: marketplace.name,
      listingUrl: `${marketplace.url}/${tokenId}`,
      price,
      currency: this.supportedChains[this.currentChain].symbol
    };
  }

  // Batch mint multiple canvases
  async batchMint(canvasDataArray, contractAddress = null) {
    const results = [];
    
    for (const canvasData of canvasDataArray) {
      try {
        const result = await this.mintNFT(canvasData.canvas, canvasData.metadata, contractAddress);
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Get gas price estimation
  async estimateGasCost() {
    if (!this.provider) return null;
    
    try {
      const gasPrice = await this.provider.getGasPrice();
      const estimatedGas = 200000; // Typical NFT mint gas
      
      return {
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        estimatedGas,
        totalCost: ethers.utils.formatEther(gasPrice.mul(estimatedGas)),
        currency: this.supportedChains[this.currentChain].symbol
      };
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return null;
    }
  }

  // Configure IPFS settings
  setPinataKeys(apiKey, secretKey) {
    this.pinataApiKey = apiKey;
    this.pinataSecretKey = secretKey;
  }

  // Event handlers
  onChainChanged = null;
  onNFTMinted = null;

  // Getters
  getSupportedChains() {
    return this.supportedChains;
  }

  getCurrentChain() {
    return this.currentChain;
  }

  getWalletAddress() {
    return this.signer?.getAddress();
  }

  isConnected() {
    return !!this.signer;
  }
}