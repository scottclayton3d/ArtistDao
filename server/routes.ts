import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertArtistSchema,
  insertTokenSchema,
  insertProposalSchema,
  insertVoteSchema,
  insertRevenueSchema,
  insertEarningSchema
} from "@shared/schema";

// Initialize Stripe with the secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";
  
  // Parse raw body for Stripe webhooks
  app.use((req, res, next) => {
    if (req.originalUrl === `${apiPrefix}/stripe-webhook`) {
      let data = '';
      const contentType = req.headers['content-type'] || '';
      
      // Skip parsing JSON for Stripe webhook endpoint to get the raw body
      if (contentType.includes('application/json')) {
        req.setEncoding('utf8');
        req.on('data', (chunk) => {
          data += chunk;
        });
        req.on('end', () => {
          req.body = data;
          next();
        });
      } else {
        next();
      }
    } else {
      next();
    }
  });
  
  // Get all artists
  app.get(`${apiPrefix}/artists`, async (req, res) => {
    try {
      const artists = await storage.getAllArtists();
      
      // Get user details for each artist
      const userIds = artists.map(artist => artist.userId);
      const users = await storage.getUsersByIds(userIds);
      
      // Combine artist data with user data
      const artistsWithDetails = artists.map(artist => {
        const user = users.find(u => u.id === artist.userId);
        return {
          ...artist,
          username: user?.username,
          profileImage: user?.profileImage,
          bio: user?.bio,
          walletAddress: user?.walletAddress
        };
      });
      
      res.json(artistsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Error fetching artists" });
    }
  });
  
  // Get specific artist
  app.get(`${apiPrefix}/artists/:id`, async (req, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const artist = await storage.getArtist(artistId);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      const user = await storage.getUser(artist.userId);
      
      if (!user) {
        return res.status(404).json({ message: "Artist user not found" });
      }
      
      // Get token distribution data
      const tokens = await storage.getArtistTokens(artistId);
      
      res.json({
        ...artist,
        username: user.username,
        profileImage: user.profileImage,
        bio: user.bio,
        walletAddress: user.walletAddress,
        tokenDistribution: tokens.length
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching artist" });
    }
  });
  
  // Create a new artist
  app.post(`${apiPrefix}/artists`, async (req, res) => {
    try {
      const artistData = insertArtistSchema.parse(req.body);
      const artist = await storage.createArtist(artistData);
      res.status(201).json(artist);
    } catch (error) {
      res.status(400).json({ message: "Invalid artist data" });
    }
  });
  
  // Get active proposals
  app.get(`${apiPrefix}/proposals/active`, async (req, res) => {
    try {
      const proposals = await storage.getActiveProposals();
      
      // Get artist details for each proposal
      const artistIdSet = new Set<number>();
      proposals.forEach(proposal => artistIdSet.add(proposal.artistId));
      const artistIds = Array.from(artistIdSet);
      const artists = await Promise.all(
        artistIds.map(id => storage.getArtist(id))
      );
      
      const artistMap = new Map();
      artists.forEach(artist => {
        if (artist) {
          artistMap.set(artist.id, artist);
        }
      });
      
      // Get vote counts for each proposal
      const proposalsWithDetails = await Promise.all(
        proposals.map(async proposal => {
          const votes = await storage.getProposalVotes(proposal.id);
          
          // Calculate vote distribution
          const options = proposal.options as string[];
          const optionVotes = Array(options.length).fill(0);
          
          votes.forEach(vote => {
            optionVotes[vote.optionIndex] += vote.weight;
          });
          
          const totalVotes = optionVotes.reduce((a, b) => a + b, 0);
          
          // Calculate percentages
          const votePercentages = optionVotes.map(count => 
            totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          );
          
          // Find artist
          const artist = artistMap.get(proposal.artistId);
          
          return {
            ...proposal,
            artistName: artist ? artist.name : "Unknown Artist",
            tokenSymbol: artist ? artist.tokenSymbol : "UNKNOWN",
            votes: {
              options: options,
              counts: optionVotes,
              percentages: votePercentages,
              total: totalVotes
            }
          };
        })
      );
      
      res.json(proposalsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active proposals" });
    }
  });
  
  // Get proposals for a specific artist
  app.get(`${apiPrefix}/artists/:id/proposals`, async (req, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const proposals = await storage.getArtistProposals(artistId);
      
      // Get artist details
      const artist = await storage.getArtist(artistId);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      // Get vote counts for each proposal
      const proposalsWithDetails = await Promise.all(
        proposals.map(async proposal => {
          const votes = await storage.getProposalVotes(proposal.id);
          
          // Calculate vote distribution
          const options = proposal.options as string[];
          const optionVotes = Array(options.length).fill(0);
          
          votes.forEach(vote => {
            optionVotes[vote.optionIndex] += vote.weight;
          });
          
          const totalVotes = optionVotes.reduce((a, b) => a + b, 0);
          
          // Calculate percentages
          const votePercentages = optionVotes.map(count => 
            totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          );
          
          return {
            ...proposal,
            artistName: artist.name,
            tokenSymbol: artist.tokenSymbol,
            votes: {
              options: options,
              counts: optionVotes,
              percentages: votePercentages,
              total: totalVotes
            }
          };
        })
      );
      
      res.json(proposalsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Error fetching artist proposals" });
    }
  });
  
  // Create a new proposal
  app.post(`${apiPrefix}/proposals`, async (req, res) => {
    try {
      const proposalData = insertProposalSchema.parse(req.body);
      const proposal = await storage.createProposal(proposalData);
      res.status(201).json(proposal);
    } catch (error) {
      res.status(400).json({ message: "Invalid proposal data" });
    }
  });
  
  // Vote on a proposal
  app.post(`${apiPrefix}/proposals/:id/vote`, async (req, res) => {
    try {
      const proposalId = parseInt(req.params.id);
      const proposal = await storage.getProposal(proposalId);
      
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      
      const voteData = insertVoteSchema.parse({
        ...req.body,
        proposalId
      });
      
      // Check if the user has tokens for this artist
      const userTokens = await storage.getUserTokens(voteData.userId);
      const artistTokens = userTokens.filter(token => token.artistId === proposal.artistId);
      
      if (artistTokens.length === 0) {
        return res.status(403).json({ message: "User does not hold tokens for this artist" });
      }
      
      // Use token amount as voting weight
      const tokenAmount = artistTokens.reduce((sum, token) => sum + token.amount, 0);
      
      const vote = await storage.createVote({
        ...voteData,
        weight: tokenAmount
      });
      
      res.status(201).json(vote);
    } catch (error) {
      res.status(400).json({ message: "Invalid vote data" });
    }
  });
  
  // Get portfolio for a user
  app.get(`${apiPrefix}/users/:id/portfolio`, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get all user tokens
      const userTokens = await storage.getUserTokens(userId);
      
      // Get artist details for each token
      const artistIdSet = new Set<number>();
      userTokens.forEach(token => artistIdSet.add(token.artistId));
      const artistIds = Array.from(artistIdSet);
      const artists = await Promise.all(
        artistIds.map(id => storage.getArtist(id))
      );
      
      const artistMap = new Map();
      artists.forEach(artist => {
        if (artist) {
          artistMap.set(artist.id, artist);
        }
      });
      
      // Calculate portfolio value (mock values for demo)
      const ethPrice = 1800; // Mock ETH price in USD
      
      const portfolio = userTokens.map(token => {
        const artist = artistMap.get(token.artistId);
        
        // Mock token value calculations
        const tokenValue = token.amount * 0.001 * ethPrice;
        const dailyChange = (Math.random() * 5) - 1; // Random value between -1% and 4%
        
        return {
          tokenId: token.id,
          artistId: token.artistId,
          artistName: artist ? artist.name : "Unknown Artist",
          tokenName: artist ? artist.tokenName : "Unknown Token",
          tokenSymbol: artist ? artist.tokenSymbol : "UNKNOWN",
          amount: token.amount,
          value: tokenValue.toFixed(2),
          dailyChange: dailyChange.toFixed(1)
        };
      });
      
      // Calculate total portfolio value
      const totalValue = portfolio.reduce((sum, item) => sum + parseFloat(item.value), 0);
      
      // Calculate 24h change (weighted average)
      const weightedChanges = portfolio.map(item => 
        parseFloat(item.dailyChange) * (parseFloat(item.value) / totalValue)
      );
      
      const totalChange = weightedChanges.reduce((sum, change) => sum + change, 0);
      
      res.json({
        userId,
        username: user.username,
        totalValue: totalValue.toFixed(2),
        dailyChange: totalChange.toFixed(2),
        tokens: portfolio
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching portfolio" });
    }
  });
  
  // Get revenue data for an artist
  app.get(`${apiPrefix}/artists/:id/revenue`, async (req, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const artist = await storage.getArtist(artistId);
      
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      // Get all revenue for this artist
      const revenues = await storage.getArtistRevenues(artistId);
      
      // Group revenues by month
      const monthlyRevenues = revenues.reduce((acc, revenue) => {
        // Ensure revenue.date is not null before using it
        const date = revenue.date || new Date();
        const month = new Date(date).toLocaleDateString('en-US', { month: 'short' });
        
        if (!acc[month]) {
          acc[month] = 0;
        }
        
        acc[month] += revenue.amount;
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate total earnings
      const totalEarnings = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
      
      // Calculate distribution based on shares
      const artistAmount = totalEarnings * (artist.artistShare / 100);
      const tokenHolderAmount = totalEarnings * (artist.tokenHolderShare / 100);
      const treasuryAmount = totalEarnings * (artist.treasuryShare / 100);
      
      // Get last month's earnings
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStr = lastMonth.toLocaleDateString('en-US', { month: 'short' });
      const lastMonthEarnings = monthlyRevenues[lastMonthStr] || 0;
      
      res.json({
        artistId,
        artistName: artist.name,
        totalEarnings,
        lastMonthEarnings,
        monthlyData: monthlyRevenues,
        distribution: {
          artist: {
            percentage: artist.artistShare,
            amount: artistAmount
          },
          tokenHolders: {
            percentage: artist.tokenHolderShare,
            amount: tokenHolderAmount
          },
          treasury: {
            percentage: artist.treasuryShare,
            amount: treasuryAmount
          }
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching revenue data" });
    }
  });
  
  // Create a new user
  app.post(`${apiPrefix}/users`, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  
  // Login user (basic implementation)
  app.post(`${apiPrefix}/auth/login`, async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if user is an artist
      let artistProfile = null;
      if (user.isArtist) {
        artistProfile = await storage.getArtistByUserId(user.id);
      }
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        user: userWithoutPassword,
        artist: artistProfile,
        token: "mock-jwt-token" // In a real app, this would be a JWT token
      });
    } catch (error) {
      res.status(500).json({ message: "Error during login" });
    }
  });
  
  // Logout user
  app.post(`${apiPrefix}/auth/logout`, async (req, res) => {
    try {
      // In a real app, this would invalidate the JWT token or session
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error during logout" });
    }
  });

  // Get current user (for persistent sessions)
  app.get(`${apiPrefix}/auth/current-user`, async (req, res) => {
    try {
      // In a real app, this would validate a JWT token or session
      // For now, we'll return a mock user as if they're logged in
      // In production, this endpoint would check req.session
      
      // For demo purposes, we're returning a mock user
      // This is where session validation would happen in a real app
      const mockUserId = 1; // Use an existing user ID from the database
      const user = await storage.getUser(mockUserId);
      
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Check if user is an artist
      let artistProfile = null;
      if (user.isArtist) {
        artistProfile = await storage.getArtistByUserId(user.id);
      }
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        artist: artistProfile,
        token: "mock-jwt-token" // In a real app, this would be a JWT token
      });
    } catch (error) {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // Create a new token purchase
  app.post(`${apiPrefix}/tokens`, async (req, res) => {
    try {
      const tokenData = insertTokenSchema.parse(req.body);
      const token = await storage.createToken(tokenData);
      res.status(201).json(token);
    } catch (error) {
      res.status(400).json({ message: "Invalid token data" });
    }
  });
  
  // Create a new revenue entry
  app.post(`${apiPrefix}/revenues`, async (req, res) => {
    try {
      const revenueData = insertRevenueSchema.parse(req.body);
      const revenue = await storage.createRevenue(revenueData);
      res.status(201).json(revenue);
    } catch (error) {
      res.status(400).json({ message: "Invalid revenue data" });
    }
  });

  // Create Stripe checkout session for artist token purchase with USD
  app.post(`${apiPrefix}/artists/:id/buy-tokens-usd`, async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ 
          message: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." 
        });
      }

      const { amount, priceUSD, userId } = req.body;
      const artistId = parseInt(req.params.id);
      
      if (!amount || !priceUSD || isNaN(amount) || isNaN(priceUSD)) {
        return res.status(400).json({ message: "Invalid amount or price" });
      }
      
      // Get artist details
      const artist = await storage.getArtist(artistId);
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      
      // The total price in USD cents
      const totalAmount = Math.round(amount * priceUSD * 100);
      
      // Create a checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${artist.tokenName} (${artist.tokenSymbol})`,
                description: `Purchase ${amount} ${artist.tokenSymbol} tokens for ${artist.name}`,
              },
              unit_amount: totalAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/artist/${artistId}?purchase=success`,
        cancel_url: `${req.headers.origin}/artist/${artistId}?purchase=canceled`,
        metadata: {
          artistId: artistId.toString(),
          tokenAmount: amount.toString(),
          pricePerToken: priceUSD.toString(),
          userId: userId ? userId.toString() : '',
        },
      });
      
      res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ 
        message: `Error creating checkout session: ${error.message}` 
      });
    }
  });

  // Stripe webhook endpoint to handle successful payments
  app.post(`${apiPrefix}/stripe-webhook`, async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // For development testing, we'll handle the webhook without requiring a secret
    // In production, always use a webhook secret
    
    let event;
    
    try {
      if (webhookSecret) {
        const signature = req.headers['stripe-signature'] as string;
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } else {
        // For development, parse the JSON directly
        // Check if req.body is already an object (parsed by express) or a string
        if (typeof req.body === 'string') {
          event = JSON.parse(req.body);
        } else {
          event = req.body;
        }
      }
      
      console.log(`Received Stripe webhook: ${event.type}`);
    } catch (error: any) {
      console.error(`Webhook error: ${error.message}`);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract metadata
      const artistId = parseInt(session.metadata?.artistId || '0');
      const tokenAmount = parseInt(session.metadata?.tokenAmount || '0');
      const userId = parseInt(session.metadata?.userId || '0');
      
      if (artistId && tokenAmount) {
        try {
          // Get artist details for the contract address
          const artist = await storage.getArtist(artistId);
          
          if (!artist || !artist.contractAddress) {
            console.error(`Artist not found or has no contract address: ${artistId}`);
          } 
          else {
            // 1. Record the token purchase in our database
            await storage.createToken({
              userId,
              artistId, 
              amount: tokenAmount,
              txHash: session.id, // Use Stripe session ID as transaction hash
              method: 'usd',
            });
            
            console.log(`Token purchase recorded in database: ${tokenAmount} tokens for artist ${artistId}`);
            
            // 2. For a production implementation, this is where you would:
            //    - Call a serverless function to mint tokens on Polygon
            //    - Use a service account private key to sign transactions
            //    - Queue up transactions if they can't be processed immediately
            
            // Example of minting on Polygon (pseudocode)
            // const provider = new JsonRpcProvider(POLYGON_RPC_URL);
            // const wallet = new Wallet(SERVER_PRIVATE_KEY, provider);
            // const contract = new Contract(artist.contractAddress, ARTIST_TOKEN_ABI, wallet);
            // const tx = await contract.mint(userWalletAddress, tokenAmount);
            // await tx.wait();
            
            // In our demo implementation, we'll skip the actual blockchain transaction
            // and just simulate it with a success message
          }
        } catch (error: any) {
          console.error('Error processing token purchase:', error.message);
        }
      }
    }

    res.json({ received: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
