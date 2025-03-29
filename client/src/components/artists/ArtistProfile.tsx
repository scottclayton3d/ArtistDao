import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";
import { User, Token } from "@/types";

// Import types
import { Artist as BaseArtist } from "@shared/schema";

// Create a custom Artist type that has all the properties needed
interface ArtistData extends BaseArtist {
  username?: string;
  profileImage?: string; 
  bio?: string;
  walletAddress?: string;
  tokenDistribution?: number;
  
  // Frontend properties that may not be in the database
  genre?: string; // Primary genre derived from genres array
  coverImageUrl?: string; // Alias for bannerImage
  verified?: boolean;
  tags?: string[];
  updates?: { id: number; title: string; content: string; date: string; category: string; }[];
}
import { queryClient, apiRequest } from "@/lib/queryClient";
import { buyTokens } from "@/lib/web3";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Input 
} from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dices,
  Music,
  Share2,
  Star,
  TrendingUp,
  Users,
  Wallet,
  RefreshCw,
  MessageSquare,
  Bell,
  BellOff,
  BarChart3,
  Image,
  Newspaper,
  Filter,
  CreditCard
} from "lucide-react";

import { ArtistWorkPreview } from "./ArtistWorkPreview";
import { ArtistAnalytics } from "./ArtistAnalytics";
import { NFTMintingManager } from "./NFTMintingManager";
import { ExclusiveContentManager } from "./ExclusiveContentManager";
import { BuyTokensUSD } from "./BuyTokensUSD";

interface ArtistProfileProps {
  artist: ArtistData;
  userId?: number;
}

export function ArtistProfile({ artist, userId }: ArtistProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isConnected, address, chainId } = useWeb3();

  // Check if the user is the artist owner
  const isArtistOwner = userId === artist.userId;
  
  // Get user tokens for this artist
  const { data: userTokens, isLoading: isLoadingTokens } = useQuery<Token[]>({
    queryKey: [`/api/users/${userId}/tokens/${artist.id}`],
    enabled: !!userId && !!artist.id,
  });
  
  // Calculate how many tokens the user owns for this artist
  const tokenCount = userTokens?.reduce((total, token) => total + token.amount, 0) || 0;
  
  // Whether the user owns any tokens at all
  const ownsTokens = tokenCount > 0;
  
  // Get artist token price
  const { data: tokenPrice } = useQuery<{ price: number }>({
    queryKey: [`/api/artists/${artist.id}/token-price`],
    // Mock implementation
    queryFn: async () => {
      // In a real implementation, this would query the blockchain or API
      return { price: 0.01 };
    }
  });
  
  // Buy tokens mutation
  const buyTokensMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!isConnected || !artist.contractAddress) {
        throw new Error("Wallet not connected or artist contract not deployed");
      }
      
      try {
        // Call blockchain function to buy tokens
        const result = await buyTokens(artist.contractAddress, amount, tokenPrice?.price || 0.01);
        
        // Then record the purchase in our database
        if (result.success) {
          return await apiRequest("POST", `/api/artists/${artist.id}/buy-tokens`, {
            userId,
            amount,
            price: tokenPrice?.price || 0.01
          });
        }
        
        throw new Error("Transaction failed");
      } catch (error) {
        console.error("Error buying tokens:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Tokens Purchased!",
        description: `You've successfully purchased ${tokenAmount} tokens for ${artist.name}.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/tokens/${artist.id}`] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // Follow artist mutation
  const followArtistMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not logged in");
      return apiRequest("POST", `/api/users/${userId}/follow-artist/${artist.id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Following Artist",
        description: `You're now following ${artist.name}. You'll receive updates on their new content.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error Following Artist",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // Format token balance
  const formattedTokenCount = new Intl.NumberFormat().format(tokenCount);
  
  // Calculate token total price
  const totalPrice = tokenAmount * (tokenPrice?.price || 0.01);
  const formattedTotalPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalPrice);
  
  // Handle token purchase
  const handleBuyTokens = () => {
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase tokens.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to purchase tokens.",
        variant: "destructive",
      });
      return;
    }
    
    buyTokensMutation.mutate(tokenAmount);
  };
  
  // Handle token amount change
  const handleTokenAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setTokenAmount(1);
    } else {
      setTokenAmount(value);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Artist Info Card */}
        <Card className="bg-black/50 border-primary/30">
          <div className="relative h-48 w-full overflow-hidden">
            <img 
              src={artist.coverImageUrl || "https://placehold.co/600x400/333/white?text=Artist+Cover"} 
              alt={`${artist.name} cover`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <h3 className="text-white text-xl font-bold">{artist.name}</h3>
              <div className="flex space-x-2">
                <Badge className="bg-primary text-white">{artist.genre}</Badge>
                {artist.verified && (
                  <Badge className="bg-blue-500 text-white">Verified</Badge>
                )}
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="mb-6">
              <p className="text-white/80 mb-4">{artist.bio || "Artist bio not available"}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {artist.genres && artist.genres.map((genre, index) => (
                  <Badge key={index} variant="outline" className="border-primary/40 text-white/80">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center mb-6">
              <div className="bg-black/30 rounded-md p-2">
                <div className="text-white font-semibold">{50 /* Using a mock count */}</div>
                <div className="text-white/60 text-xs">Token Holders</div>
              </div>
              <div className="bg-black/30 rounded-md p-2">
                <div className="text-white font-semibold">{artist.tokenSupply || 10000}</div>
                <div className="text-white/60 text-xs">Total Tokens</div>
              </div>
              <div className="bg-black/30 rounded-md p-2">
                <div className="text-white font-semibold">${(artist.tokenSupply || 10000) * 0.01}</div>
                <div className="text-white/60 text-xs">Market Cap</div>
              </div>
            </div>
            
            {!isArtistOwner && (
              <div className="space-y-4">
                {ownsTokens ? (
                  <div className="bg-primary/20 border border-primary/30 rounded-lg p-4 text-center">
                    <p className="text-white font-semibold mb-1">
                      Your Balance: {formattedTokenCount} Tokens
                    </p>
                    <p className="text-primary/80 text-sm">
                      You own approximately {((tokenCount / (artist.tokenSupply || 10000)) * 100).toFixed(2)}% of this artist
                    </p>
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-primary text-white font-medium"
                    onClick={() => setActiveTab("invest")}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Become a Token Holder
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full border-primary/60 text-primary hover:bg-primary/20"
                  onClick={() => followArtistMutation.mutate()}
                  disabled={followArtistMutation.isPending}
                >
                  {followArtistMutation.isPending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bell className="mr-2 h-4 w-4" />
                  )}
                  Follow Artist
                </Button>
              </div>
            )}
            
            {isArtistOwner && (
              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <p className="text-green-500 font-semibold mb-1">
                    This is your artist profile
                  </p>
                  <p className="text-white/80 text-sm">
                    Use the tabs to manage your content
                  </p>
                </div>
                
                <Button 
                  className="w-full bg-primary text-white font-medium"
                  onClick={() => setActiveTab("analytics")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-black/50 flex flex-wrap h-auto p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Star className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="works" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Music className="mr-2 h-4 w-4" />
                Works
              </TabsTrigger>
              {!isArtistOwner && (
                <TabsTrigger value="invest" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Invest
                </TabsTrigger>
              )}
              {isArtistOwner && (
                <>
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="nfts" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <Image className="mr-2 h-4 w-4" />
                    NFTs
                  </TabsTrigger>
                  <TabsTrigger value="exclusive" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    <Filter className="mr-2 h-4 w-4" />
                    Exclusive
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger value="community" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Users className="mr-2 h-4 w-4" />
                Community
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-black/50 border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Artist Background</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-white/80">
                      <p>
                        <strong>Location:</strong> {artist.location || "Unknown"}
                      </p>
                      <p>
                        <strong>Started:</strong> {2020 /* Mock start year */}
                      </p>
                      <p>
                        <strong>Style:</strong> {artist.genres ? artist.genres[0] : "Electronic"}{artist.genres && artist.genres.length > 1 ? `, ${artist.genres.slice(1).join(", ")}` : ""}
                      </p>
                      <p>
                        <strong>Influences:</strong> Various Artists
                      </p>
                      <p>
                        <strong>Labels:</strong> Independent (Fan-owned)
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-black/50 border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Recent Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {artist.updates?.slice(0, 3).map((update, index) => (
                        <div key={index} className="border-b border-primary/20 pb-4 last:border-0">
                          <p className="text-white font-medium mb-1">{update.title}</p>
                          <p className="text-white/70 text-sm mb-2">{update.content}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-primary/80 text-xs">
                              {new Date(update.date).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs border-primary/40 text-white/80">
                              {update.category}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {!artist.updates?.length && (
                        <p className="text-white/70 text-center py-6">No recent updates.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <ArtistWorkPreview 
                artistId={artist.id} 
                userOwnsTokens={ownsTokens} 
              />
            </TabsContent>
            
            {/* Works Tab */}
            <TabsContent value="works">
              <ArtistWorkPreview 
                artistId={artist.id} 
                userOwnsTokens={ownsTokens} 
              />
            </TabsContent>
            
            {/* Invest Tab */}
            <TabsContent value="invest">
              <Card className="bg-black/50 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-white">Invest in {artist.name}</CardTitle>
                  <CardDescription className="text-white/70">
                    Purchase governance tokens to earn royalties and vote on proposals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <div className="mb-6">
                        <h3 className="text-white font-semibold mb-2">Token Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-black/30 p-3 rounded-md">
                            <div className="text-white/70">Token Price</div>
                            <div className="text-white font-medium">${tokenPrice?.price || 0.01}</div>
                          </div>
                          <div className="bg-black/30 p-3 rounded-md">
                            <div className="text-white/70">Total Supply</div>
                            <div className="text-white font-medium">{artist.tokenSupply || 10000}</div>
                          </div>
                          <div className="bg-black/30 p-3 rounded-md">
                            <div className="text-white/70">Holders</div>
                            <div className="text-white font-medium">{50 /* Mock holder count */}</div>
                          </div>
                          <div className="bg-black/30 p-3 rounded-md">
                            <div className="text-white/70">Market Cap</div>
                            <div className="text-white font-medium">${(artist.tokenSupply || 10000) * 0.01}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-white font-semibold mb-2">Token Utility</h3>
                        <ul className="space-y-2 text-white/80 text-sm">
                          <li className="flex items-start">
                            <Dices className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                            Vote on career decisions and proposals
                          </li>
                          <li className="flex items-start">
                            <TrendingUp className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                            Earn royalties from streaming, sales, and performances
                          </li>
                          <li className="flex items-start">
                            <Filter className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                            Access exclusive content and early releases
                          </li>
                          <li className="flex items-start">
                            <Star className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                            Special access to events and backstage passes
                          </li>
                        </ul>
                      </div>
                      
                      {ownsTokens && (
                        <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                          <h3 className="text-white font-semibold mb-2">Your Current Investment</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-white/70">Token Holdings</div>
                              <div className="text-white font-medium">{formattedTokenCount}</div>
                            </div>
                            <div>
                              <div className="text-white/70">Ownership Percentage</div>
                              <div className="text-white font-medium">
                                {((tokenCount / (artist.tokenSupply || 10000)) * 100).toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                        <h3 className="text-white font-semibold mb-4">Purchase Tokens</h3>
                        
                        {!isConnected && (
                          <Alert className="mb-6 bg-primary/10 border-primary/30">
                            <AlertDescription className="text-white/80">
                              Connect your wallet to purchase tokens. Tokens are stored on-chain for maximum security and transparency.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="mb-6">
                          <label className="block text-white/70 mb-2 text-sm">Amount of Tokens</label>
                          <Input 
                            type="number" 
                            min="1" 
                            value={tokenAmount}
                            onChange={handleTokenAmountChange}
                            className="bg-black/50 border-primary/30 text-white mb-1"
                          />
                          <div className="flex justify-between text-xs text-white/60">
                            <span>Min: 1 token</span>
                            {ownsTokens && <span>Current: {formattedTokenCount} tokens</span>}
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex justify-between text-white mb-2">
                            <span>Total Cost:</span>
                            <span className="font-bold">{formattedTotalPrice}</span>
                          </div>
                          
                          <div className="text-xs text-white/60 mb-4">
                            <div className="flex justify-between mb-1">
                              <span>Token Price:</span>
                              <span>${tokenPrice?.price || 0.01} × {tokenAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Network Fee:</span>
                              <span>~$0.50 (varies)</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-primary text-white border-glow font-bold uppercase mb-3"
                          disabled={!isConnected || buyTokensMutation.isPending}
                          onClick={handleBuyTokens}
                        >
                          {buyTokensMutation.isPending ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Wallet className="mr-2 h-4 w-4" />
                          )}
                          {buyTokensMutation.isPending ? "Processing..." : "Buy Tokens with ETH"}
                        </Button>
                        
                        <div className="relative mb-3">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-black/50 px-2 text-xs text-white/60">OR</span>
                          </div>
                        </div>
                        
                        <BuyTokensUSD 
                          artistId={artist.id} 
                          tokenSymbol={artist.tokenSymbol} 
                          buttonText="Buy Tokens with USD" 
                          buttonVariant="outline"
                          fullWidth={true}
                          userId={userId}
                        />
                      </div>
                      
                      <div className="text-white/70 text-xs space-y-2">
                        <p>
                          <strong>Note:</strong> Tokens are minted on the blockchain and represent 
                          partial ownership of the artist's revenue streams and governance rights.
                        </p>
                        <p>
                          By purchasing tokens, you agree to the terms of the artist's smart contract.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Analytics Tab (Artist Owner Only) */}
            <TabsContent value="analytics">
              {isArtistOwner ? (
                <ArtistAnalytics artistId={artist.id} isArtistOwner={true} />
              ) : (
                <Card className="bg-black/50 border-primary/30">
                  <CardContent className="p-12 text-center">
                    <div className="text-white/70">
                      Analytics are only available to the artist.
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* NFTs Tab (Artist Owner Only) */}
            <TabsContent value="nfts">
              {isArtistOwner ? (
                <NFTMintingManager artistId={artist.id} />
              ) : (
                <Card className="bg-black/50 border-primary/30">
                  <CardContent className="p-12 text-center">
                    <div className="text-white/70">
                      NFT management is only available to the artist.
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Exclusive Content Tab (Artist Owner Only) */}
            <TabsContent value="exclusive">
              {isArtistOwner ? (
                <ExclusiveContentManager artistId={artist.id} />
              ) : (
                <Card className="bg-black/50 border-primary/30">
                  <CardContent className="p-12 text-center">
                    <div className="text-white/70">
                      Exclusive content management is only available to the artist.
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Community Tab */}
            <TabsContent value="community">
              <div className="space-y-6">
                <Card className="bg-black/50 border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-white">Community Discussion</CardTitle>
                    <CardDescription className="text-white/70">
                      Connect with other fans and token holders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10">
                      <MessageSquare className="h-12 w-12 text-primary/60 mx-auto mb-4" />
                      <p className="text-white/70 mb-6">
                        Community discussions are coming soon!
                      </p>
                      <Button className="bg-primary text-white">
                        Get Notified When Available
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-black/50 border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-white">Token Holders</CardTitle>
                    <CardDescription className="text-white/70">
                      Top investors in {artist.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(5)].map((_, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between border-b border-primary/20 pb-3 last:border-0"
                        >
                          <div className="flex items-center">
                            <div className="bg-primary/20 h-10 w-10 rounded-full flex items-center justify-center text-primary mr-3">
                              {index === 0 ? "A" : index === 1 ? "B" : index === 2 ? "C" : index === 3 ? "D" : "E"}
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {index === 0 ? "Alex876" : index === 1 ? "BlockchainBob" : index === 2 ? "CryptoCarol" : index === 3 ? "DaveDeFi" : "EtherEmma"}
                              </div>
                              <div className="text-white/60 text-xs">
                                Holder since {index === 0 ? "Jan 2025" : index === 1 ? "Feb 2025" : index === 2 ? "Feb 2025" : index === 3 ? "Mar 2025" : "Mar 2025"}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">
                              {index === 0 ? "5,000" : index === 1 ? "3,750" : index === 2 ? "2,500" : index === 3 ? "1,200" : "950"} tokens
                            </div>
                            <div className="text-white/60 text-xs">
                              {index === 0 ? "5%" : index === 1 ? "3.75%" : index === 2 ? "2.5%" : index === 3 ? "1.2%" : "0.95%"} ownership
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}