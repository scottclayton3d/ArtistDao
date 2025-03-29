import {
  User, InsertUser, users,
  Artist, InsertArtist, artists,
  Token, InsertToken, tokens,
  Proposal, InsertProposal, proposals,
  Vote, InsertVote, votes,
  Revenue, InsertRevenue, revenues,
  Earning, InsertEarning, earnings
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByIds(ids: number[]): Promise<User[]>;
  
  // Artist operations
  getArtist(id: number): Promise<Artist | undefined>;
  getArtistByUserId(userId: number): Promise<Artist | undefined>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  getAllArtists(): Promise<Artist[]>;
  updateArtistContractAddress(id: number, contractAddress: string): Promise<Artist | undefined>;
  
  // Token operations
  getUserTokens(userId: number): Promise<Token[]>;
  getArtistTokens(artistId: number): Promise<Token[]>;
  createToken(token: InsertToken): Promise<Token>;
  
  // Proposal operations
  getProposal(id: number): Promise<Proposal | undefined>;
  getArtistProposals(artistId: number): Promise<Proposal[]>;
  getUserProposals(userId: number): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposalStatus(id: number, status: string): Promise<Proposal | undefined>;
  getActiveProposals(): Promise<Proposal[]>;
  
  // Vote operations
  getUserVotes(userId: number): Promise<Vote[]>;
  getProposalVotes(proposalId: number): Promise<Vote[]>;
  createVote(vote: InsertVote): Promise<Vote>;
  
  // Revenue operations
  getArtistRevenues(artistId: number): Promise<Revenue[]>;
  createRevenue(revenue: InsertRevenue): Promise<Revenue>;
  markRevenueDistributed(id: number): Promise<Revenue | undefined>;
  
  // Earnings operations
  getUserEarnings(userId: number): Promise<Earning[]>;
  getArtistEarnings(artistId: number): Promise<Earning[]>;
  createEarning(earning: InsertEarning): Promise<Earning>;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private artists: Map<number, Artist>;
  private tokens: Map<number, Token>;
  private proposals: Map<number, Proposal>;
  private votes: Map<number, Vote>;
  private revenues: Map<number, Revenue>;
  private earnings: Map<number, Earning>;
  
  private currentIds: {
    user: number;
    artist: number;
    token: number;
    proposal: number;
    vote: number;
    revenue: number;
    earning: number;
  };

  constructor() {
    this.users = new Map();
    this.artists = new Map();
    this.tokens = new Map();
    this.proposals = new Map();
    this.votes = new Map();
    this.revenues = new Map();
    this.earnings = new Map();
    
    this.currentIds = {
      user: 1,
      artist: 1,
      token: 1,
      proposal: 1,
      vote: 1,
      revenue: 1,
      earning: 1,
    };
    
    // Add seed data
    this.seedData();
  }

  // Seed some initial data
  private seedData() {
    // Create sample users
    const user1: InsertUser = { 
      username: "aurora_artist", 
      password: "password123", 
      isArtist: true,
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      bio: "Indie Electronic Artist from Stockholm, Sweden",
      profileImage: "https://images.unsplash.com/photo-1522609925277-66fea332c575?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&h=400&q=80"
    };
    
    const user2: InsertUser = { 
      username: "nebula_artist", 
      password: "password123", 
      isArtist: true,
      walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      bio: "Electronic Music Producer and Visual Artist",
      profileImage: "https://images.unsplash.com/photo-1604072366595-e75dc92d6bdc?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=60&h=60&q=80"
    };
    
    const user3: InsertUser = { 
      username: "fan_user", 
      password: "password123", 
      isArtist: false,
      walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      profileImage: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    
    this.createUser(user1).then(aurora => {
      // Create Aurora artist profile
      const auroraArtist: InsertArtist = {
        userId: aurora.id,
        name: "Aurora",
        genres: ["Electronic", "Indie Pop", "Vocalist", "Producer"],
        location: "Stockholm, Sweden",
        bannerImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        tokenName: "AuroraShares",
        tokenSymbol: "AURORA",
        tokenSupply: 1000000,
        artistShare: 60,
        tokenHolderShare: 30,
        treasuryShare: 10,
        contractAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      };
      
      this.createArtist(auroraArtist).then(artist => {
        // Create sample proposals for Aurora
        const proposal1: InsertProposal = {
          artistId: artist.id,
          creatorId: aurora.id,
          title: "Album Concept Direction",
          description: "Vote on the creative direction for Aurora's upcoming album",
          type: "creative",
          options: ["Ethereal Electronic", "Acoustic Reimagining"],
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
        };
        
        this.createProposal(proposal1);
        
        // Create some revenue
        const revenue1: InsertRevenue = {
          artistId: artist.id,
          amount: 10.2,
          source: "streaming"
        };
        
        const revenue2: InsertRevenue = {
          artistId: artist.id,
          amount: 16.8,
          source: "merchandise"
        };
        
        const revenue3: InsertRevenue = {
          artistId: artist.id,
          amount: 22.1,
          source: "licensing"
        };
        
        const revenue4: InsertRevenue = {
          artistId: artist.id,
          amount: 12.8,
          source: "streaming"
        };
        
        this.createRevenue(revenue1);
        this.createRevenue(revenue2);
        this.createRevenue(revenue3);
        this.createRevenue(revenue4);
      });
    });
    
    this.createUser(user2).then(nebula => {
      // Create Nebula artist profile
      const nebulaArtist: InsertArtist = {
        userId: nebula.id,
        name: "Nebula",
        genres: ["Electronic", "Ambient", "Downtempo", "Visual"],
        location: "Berlin, Germany",
        bannerImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        tokenName: "NebulaDAO",
        tokenSymbol: "NEBULA",
        tokenSupply: 2000000,
        artistShare: 55,
        tokenHolderShare: 35,
        treasuryShare: 10,
        contractAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
      };
      
      this.createArtist(nebulaArtist).then(artist => {
        // Create sample proposals for Nebula
        const proposal1: InsertProposal = {
          artistId: artist.id,
          creatorId: nebula.id,
          title: "Tour Location Selection",
          description: "Help decide where Nebula should tour next",
          type: "business",
          options: ["North America Tour", "European Tour"],
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
        };
        
        this.createProposal(proposal1);
      });
    });
    
    this.createUser(user3).then(fan => {
      // Wait for artists to be created
      setTimeout(() => {
        // Find the artist ids
        this.getAllArtists().then(allArtists => {
          if (allArtists.length >= 2) {
            const auroraArtist = allArtists[0];
            const nebulaArtist = allArtists[1];
            
            // Create token holdings for the fan
            const token1: InsertToken = {
              artistId: auroraArtist.id,
              userId: fan.id,
              amount: 250
            };
            
            const token2: InsertToken = {
              artistId: nebulaArtist.id,
              userId: fan.id,
              amount: 750
            };
            
            this.createToken(token1);
            this.createToken(token2);
            
            // Create some votes
            this.getArtistProposals(auroraArtist.id).then(proposals => {
              if (proposals.length > 0) {
                const vote: InsertVote = {
                  proposalId: proposals[0].id,
                  userId: fan.id,
                  optionIndex: 0, // Voting for first option
                  weight: 250 // Based on token holdings
                };
                
                this.createVote(vote);
              }
            });
            
            this.getArtistProposals(nebulaArtist.id).then(proposals => {
              if (proposals.length > 0) {
                const vote: InsertVote = {
                  proposalId: proposals[0].id,
                  userId: fan.id,
                  optionIndex: 1, // Voting for second option
                  weight: 750 // Based on token holdings
                };
                
                this.createVote(vote);
              }
            });
          }
        });
      }, 100);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async getUsersByIds(ids: number[]): Promise<User[]> {
    return ids.map(id => this.users.get(id)).filter(Boolean) as User[];
  }
  
  // Artist operations
  async getArtist(id: number): Promise<Artist | undefined> {
    return this.artists.get(id);
  }
  
  async getArtistByUserId(userId: number): Promise<Artist | undefined> {
    return Array.from(this.artists.values()).find(
      (artist) => artist.userId === userId
    );
  }
  
  async createArtist(artist: InsertArtist): Promise<Artist> {
    const id = this.currentIds.artist++;
    const newArtist: Artist = { ...artist, id };
    this.artists.set(id, newArtist);
    return newArtist;
  }
  
  async getAllArtists(): Promise<Artist[]> {
    return Array.from(this.artists.values());
  }
  
  async updateArtistContractAddress(id: number, contractAddress: string): Promise<Artist | undefined> {
    const artist = this.artists.get(id);
    if (!artist) return undefined;
    
    const updatedArtist: Artist = { ...artist, contractAddress };
    this.artists.set(id, updatedArtist);
    return updatedArtist;
  }
  
  // Token operations
  async getUserTokens(userId: number): Promise<Token[]> {
    return Array.from(this.tokens.values()).filter(
      (token) => token.userId === userId
    );
  }
  
  async getArtistTokens(artistId: number): Promise<Token[]> {
    return Array.from(this.tokens.values()).filter(
      (token) => token.artistId === artistId
    );
  }
  
  async createToken(token: InsertToken): Promise<Token> {
    const id = this.currentIds.token++;
    const purchaseDate = new Date();
    const newToken: Token = { ...token, id, purchaseDate };
    this.tokens.set(id, newToken);
    return newToken;
  }
  
  // Proposal operations
  async getProposal(id: number): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }
  
  async getArtistProposals(artistId: number): Promise<Proposal[]> {
    return Array.from(this.proposals.values()).filter(
      (proposal) => proposal.artistId === artistId
    );
  }
  
  async getUserProposals(userId: number): Promise<Proposal[]> {
    return Array.from(this.proposals.values()).filter(
      (proposal) => proposal.creatorId === userId
    );
  }
  
  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const id = this.currentIds.proposal++;
    const startDate = new Date();
    const status = "active";
    const newProposal: Proposal = { ...proposal, id, startDate, status };
    this.proposals.set(id, newProposal);
    return newProposal;
  }
  
  async updateProposalStatus(id: number, status: string): Promise<Proposal | undefined> {
    const proposal = this.proposals.get(id);
    if (!proposal) return undefined;
    
    const updatedProposal: Proposal = { ...proposal, status };
    this.proposals.set(id, updatedProposal);
    return updatedProposal;
  }
  
  async getActiveProposals(): Promise<Proposal[]> {
    return Array.from(this.proposals.values()).filter(
      (proposal) => proposal.status === "active" && new Date(proposal.endDate) > new Date()
    );
  }
  
  // Vote operations
  async getUserVotes(userId: number): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(
      (vote) => vote.userId === userId
    );
  }
  
  async getProposalVotes(proposalId: number): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(
      (vote) => vote.proposalId === proposalId
    );
  }
  
  async createVote(vote: InsertVote): Promise<Vote> {
    const id = this.currentIds.vote++;
    const timestamp = new Date();
    const newVote: Vote = { ...vote, id, timestamp };
    this.votes.set(id, newVote);
    return newVote;
  }
  
  // Revenue operations
  async getArtistRevenues(artistId: number): Promise<Revenue[]> {
    return Array.from(this.revenues.values()).filter(
      (revenue) => revenue.artistId === artistId
    );
  }
  
  async createRevenue(revenue: InsertRevenue): Promise<Revenue> {
    const id = this.currentIds.revenue++;
    const date = new Date();
    const distributed = false;
    const newRevenue: Revenue = { ...revenue, id, date, distributed };
    this.revenues.set(id, newRevenue);
    return newRevenue;
  }
  
  async markRevenueDistributed(id: number): Promise<Revenue | undefined> {
    const revenue = this.revenues.get(id);
    if (!revenue) return undefined;
    
    const updatedRevenue: Revenue = { ...revenue, distributed: true };
    this.revenues.set(id, updatedRevenue);
    return updatedRevenue;
  }
  
  // Earnings operations
  async getUserEarnings(userId: number): Promise<Earning[]> {
    return Array.from(this.earnings.values()).filter(
      (earning) => earning.userId === userId
    );
  }
  
  async getArtistEarnings(artistId: number): Promise<Earning[]> {
    return Array.from(this.earnings.values()).filter(
      (earning) => earning.artistId === artistId
    );
  }
  
  async createEarning(earning: InsertEarning): Promise<Earning> {
    const id = this.currentIds.earning++;
    const date = new Date();
    const newEarning: Earning = { ...earning, id, date };
    this.earnings.set(id, newEarning);
    return newEarning;
  }
}

export const storage = new MemStorage();
