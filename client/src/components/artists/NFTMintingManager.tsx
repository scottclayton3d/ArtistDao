import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/use-web3";
import { queryClient, apiRequest } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, FileImage, ArrowRight, Plus, RefreshCw } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// NFT types from backend
interface NFT {
  id: number;
  artistId: number;
  name: string;
  description: string;
  imageUrl: string;
  contractAddress?: string;
  tokenId?: string;
  tokenType: 'ERC721' | 'ERC1155';
  supply: number;
  remaining: number;
  price: number;
  createdAt: string;
  mintedAt?: string;
  status: 'draft' | 'minting' | 'minted' | 'on_sale';
}

interface NFTMintingManagerProps {
  artistId: number;
}

// Form validation schema for creating NFTs
const nftFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  imageUrl: z.string().url({ message: "Please enter a valid URL for your image" }),
  tokenType: z.enum(['ERC721', 'ERC1155']),
  supply: z.coerce.number().int().min(1, { message: "Supply must be at least 1" }),
  price: z.coerce.number().min(0, { message: "Price must be greater than or equal to 0" }),
});

type NFTFormValues = z.infer<typeof nftFormSchema>;

export function NFTMintingManager({ artistId }: NFTMintingManagerProps) {
  const [activeTab, setActiveTab] = useState("drafts");
  const { toast } = useToast();
  const { isConnected, address } = useWeb3();
  
  // Get the artist's NFTs
  const { data: nfts, isLoading: isLoadingNFTs } = useQuery<NFT[]>({
    queryKey: [`/api/artists/${artistId}/nfts`],
    // Mock data for now
    queryFn: async () => {
      // In a real implementation, this would fetch from the backend
      const mockNFTs: NFT[] = [
        {
          id: 1,
          artistId,
          name: "Northern Lights Special Edition",
          description: "Exclusive NFT for the Northern Lights album release. Owners get access to a private concert.",
          imageUrl: "https://placehold.co/600x600/333/white?text=NFT",
          tokenType: "ERC721",
          supply: 100,
          remaining: 87,
          price: 0.1,
          createdAt: "2025-02-15T12:00:00Z",
          mintedAt: "2025-02-20T15:30:00Z",
          status: "minted"
        },
        {
          id: 2,
          artistId,
          name: "Backstage Pass Collection",
          description: "Lifetime backstage access NFT for all concerts.",
          imageUrl: "https://placehold.co/600x600/333/white?text=VIP",
          tokenType: "ERC1155",
          supply: 25,
          remaining: 25,
          price: 0.5,
          createdAt: "2025-03-01T09:15:00Z",
          status: "draft"
        }
      ];
      
      return mockNFTs;
    }
  });
  
  // Form for creating new NFTs
  const form = useForm<NFTFormValues>({
    resolver: zodResolver(nftFormSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      tokenType: "ERC721",
      supply: 1,
      price: 0.1,
    },
  });
  
  // Filter NFTs by status based on active tab
  const filteredNFTs = nfts?.filter(nft => {
    if (activeTab === "drafts") return nft.status === "draft";
    if (activeTab === "minted") return nft.status === "minted" || nft.status === "on_sale";
    if (activeTab === "minting") return nft.status === "minting";
    return true;
  });
  
  // Create new NFT mutation
  const createNFTMutation = useMutation({
    mutationFn: async (data: NFTFormValues) => {
      // In a real implementation, this would post to the backend
      return apiRequest("POST", `/api/artists/${artistId}/nfts`, {
        ...data,
        status: "draft"
      });
    },
    onSuccess: () => {
      toast({
        title: "NFT Created",
        description: "Your NFT has been created as a draft.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/artists/${artistId}/nfts`] });
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error Creating NFT",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // Mint NFT mutation
  const mintNFTMutation = useMutation({
    mutationFn: async (nftId: number) => {
      // This would integrate with the blockchain in a real implementation
      return apiRequest("POST", `/api/artists/${artistId}/nfts/${nftId}/mint`, {});
    },
    onSuccess: () => {
      toast({
        title: "Minting Started",
        description: "Your NFT is being minted on the blockchain.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/artists/${artistId}/nfts`] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // List NFT for sale mutation
  const listForSaleMutation = useMutation({
    mutationFn: async (nftId: number) => {
      return apiRequest("POST", `/api/artists/${artistId}/nfts/${nftId}/list`, {});
    },
    onSuccess: () => {
      toast({
        title: "NFT Listed",
        description: "Your NFT is now available for purchase.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/artists/${artistId}/nfts`] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Listing Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // Submit form handler
  const onSubmit = (values: NFTFormValues) => {
    createNFTMutation.mutate(values);
  };
  
  // Helper function to get status badge
  const getStatusBadge = (status: NFT['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">Draft</Badge>;
      case 'minting':
        return <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-500">Minting</Badge>;
      case 'minted':
        return <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-500">Minted</Badge>;
      case 'on_sale':
        return <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-500">On Sale</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h2 className="text-2xl font-bold text-white uppercase font-heading mb-4 md:mb-0">NFT Collection Manager</h2>
          <TabsList className="bg-black/50">
            <TabsTrigger value="drafts" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Drafts
            </TabsTrigger>
            <TabsTrigger value="minting" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Minting
            </TabsTrigger>
            <TabsTrigger value="minted" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Minted
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Create New
            </TabsTrigger>
          </TabsList>
        </div>
        
        {!isConnected && (
          <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/50 text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connect Your Wallet</AlertTitle>
            <AlertDescription>
              You need to connect your wallet to mint NFTs on the blockchain.
            </AlertDescription>
          </Alert>
        )}
        
        <TabsContent value="create">
          <Card className="bg-black/50 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white">Create New NFT</CardTitle>
              <CardDescription className="text-white/70">
                Set up a new NFT to mint for your fans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">NFT Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Northern Lights Special Edition" 
                                {...field} 
                                className="bg-black/50 border-primary/30 text-white"
                              />
                            </FormControl>
                            <FormDescription className="text-white/50">
                              The name of your NFT collection
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe what makes this NFT special..." 
                                {...field} 
                                className="bg-black/50 border-primary/30 text-white min-h-[120px]"
                              />
                            </FormControl>
                            <FormDescription className="text-white/50">
                              Explain the benefits and uniqueness of this NFT
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="tokenType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Token Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-black/50 border-primary/30 text-white">
                                    <SelectValue placeholder="Select token type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="ERC721">ERC-721 (Unique)</SelectItem>
                                  <SelectItem value="ERC1155">ERC-1155 (Multiple)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-white/50">
                                NFT token standard
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="supply"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Supply</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  {...field} 
                                  className="bg-black/50 border-primary/30 text-white"
                                />
                              </FormControl>
                              <FormDescription className="text-white/50">
                                Number to mint
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Price (ETH)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                {...field} 
                                className="bg-black/50 border-primary/30 text-white"
                              />
                            </FormControl>
                            <FormDescription className="text-white/50">
                              Sale price in ETH
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">NFT Image URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://..." 
                                {...field} 
                                className="bg-black/50 border-primary/30 text-white"
                              />
                            </FormControl>
                            <FormDescription className="text-white/50">
                              URL of the image for this NFT
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="mt-2 border-2 border-dashed border-primary/30 rounded-lg p-6 h-[300px] flex flex-col items-center justify-center">
                        {form.watch("imageUrl") ? (
                          <div className="w-full h-full flex flex-col items-center">
                            <div className="relative w-full h-[220px] mb-4">
                              <img 
                                src={form.watch("imageUrl")} 
                                alt="NFT Preview" 
                                className="w-full h-full object-contain rounded" 
                                onError={() => {
                                  toast({
                                    variant: "destructive",
                                    title: "Image Error",
                                    description: "Could not load the image. Please check the URL.",
                                  });
                                }}
                              />
                            </div>
                            <Button 
                              variant="outline" 
                              type="button" 
                              onClick={() => form.setValue("imageUrl", "")}
                              className="mt-auto border-primary/60 text-primary hover:text-white hover:bg-primary/20"
                            >
                              Change Image
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <FileImage className="h-12 w-12 text-primary/60 mx-auto mb-4" />
                            <p className="text-white/70 mb-4">Enter a URL above to preview your NFT image</p>
                            <p className="text-white/50 text-sm">Recommended size: 1000x1000px</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white border-glow btn-hover-effect font-bold uppercase"
                    disabled={createNFTMutation.isPending}
                  >
                    {createNFTMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create NFT Draft
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="drafts">
          {isLoadingNFTs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-black/50 border-primary/30 animate-pulse">
                  <div className="h-[200px] bg-primary/10 w-full"></div>
                  <CardContent className="mt-4">
                    <div className="h-6 bg-primary/10 w-3/4 mb-2"></div>
                    <div className="h-4 bg-primary/10 w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNFTs && filteredNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNFTs.map(nft => (
                <Card key={nft.id} className="bg-black/50 border-primary/30 overflow-hidden">
                  <div className="relative">
                    <img src={nft.imageUrl} alt={nft.name} className="w-full h-[200px] object-cover" />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(nft.status)}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-white font-bold text-lg mb-2">{nft.name}</h3>
                    <p className="text-white/70 text-sm mb-4 line-clamp-3">{nft.description}</p>
                    <div className="flex justify-between text-white/70 text-xs mb-4">
                      <span>Type: {nft.tokenType}</span>
                      <span>Supply: {nft.supply}</span>
                      <span>Price: {nft.price} ETH</span>
                    </div>
                    
                    <Button 
                      onClick={() => mintNFTMutation.mutate(nft.id)}
                      disabled={!isConnected || mintNFTMutation.isPending}
                      className="w-full bg-primary text-white btn-hover-effect font-medium"
                    >
                      {mintNFTMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Minting...
                        </>
                      ) : (
                        <>
                          Mint on Blockchain <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-black/50 border-primary/30">
              <CardContent className="p-12 text-center">
                <div className="text-white/70 mb-6">
                  You don't have any NFT drafts yet. Create your first NFT to get started.
                </div>
                <Button 
                  onClick={() => setActiveTab("create")}
                  className="bg-primary text-white border-glow font-medium"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First NFT
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="minting">
          {filteredNFTs && filteredNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNFTs.map(nft => (
                <Card key={nft.id} className="bg-black/50 border-primary/30 overflow-hidden">
                  <div className="relative">
                    <img src={nft.imageUrl} alt={nft.name} className="w-full h-[200px] object-cover" />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(nft.status)}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-white font-bold text-lg mb-2">{nft.name}</h3>
                    <p className="text-white/70 text-sm mb-4 line-clamp-3">{nft.description}</p>
                    <div className="flex justify-between text-white/70 text-xs mb-4">
                      <span>Type: {nft.tokenType}</span>
                      <span>Supply: {nft.supply}</span>
                      <span>Price: {nft.price} ETH</span>
                    </div>
                    
                    <Alert className="mb-4 bg-yellow-500/10 border-yellow-500/30">
                      <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
                      <AlertDescription className="text-yellow-500 text-xs">
                        Minting in progress. Please wait...
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-black/50 border-primary/30">
              <CardContent className="p-12 text-center">
                <div className="text-white/70">
                  No NFTs currently minting.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="minted">
          {filteredNFTs && filteredNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNFTs.map(nft => (
                <Card key={nft.id} className="bg-black/50 border-primary/30 overflow-hidden">
                  <div className="relative">
                    <img src={nft.imageUrl} alt={nft.name} className="w-full h-[200px] object-cover" />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(nft.status)}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-white font-bold text-lg mb-2">{nft.name}</h3>
                    <p className="text-white/70 text-sm mb-4 line-clamp-3">{nft.description}</p>
                    <div className="flex justify-between text-white/70 text-xs mb-4">
                      <span>Type: {nft.tokenType}</span>
                      <span>Sold: {nft.supply - nft.remaining}/{nft.supply}</span>
                      <span>Price: {nft.price} ETH</span>
                    </div>
                    
                    {nft.status === "minted" && (
                      <Button 
                        onClick={() => listForSaleMutation.mutate(nft.id)}
                        disabled={listForSaleMutation.isPending}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white btn-hover-effect font-medium"
                      >
                        {listForSaleMutation.isPending ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Listing...
                          </>
                        ) : (
                          <>
                            List for Sale <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                    
                    {nft.status === "on_sale" && (
                      <Alert className="mb-0 bg-green-500/10 border-green-500/30">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-500 text-xs">
                          Listed for sale! {nft.supply - nft.remaining} sold of {nft.supply}.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-black/50 border-primary/30">
              <CardContent className="p-12 text-center">
                <div className="text-white/70 mb-6">
                  You don't have any minted NFTs yet.
                </div>
                <Button 
                  onClick={() => setActiveTab("drafts")}
                  className="bg-primary text-white border-glow font-medium"
                >
                  View Your Drafts
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}