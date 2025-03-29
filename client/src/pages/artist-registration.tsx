import { useState } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { insertArtistSchema } from '../../../shared/schema';
import { queryClient, apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/use-auth';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Slider } from '../components/ui/slider';
import { Loader2, MusicIcon, Info } from 'lucide-react';

// Create a custom schema that extends the insert schema
const formSchema = insertArtistSchema.extend({
  tokenSupply: z.coerce.number().min(1000, {
    message: "Token supply must be at least 1,000",
  }).max(1000000, {
    message: "Token supply cannot exceed 1,000,000",
  }),
  artistShare: z.coerce.number().min(10, {
    message: "Artist share must be at least 10%",
  }).max(70, {
    message: "Artist share cannot exceed 70%",
  }),
  tokenHolderShare: z.coerce.number().min(20, {
    message: "Token holder share must be at least 20%",
  }).max(70, {
    message: "Token holder share cannot exceed 70%",
  }),
  treasuryShare: z.coerce.number().min(5, {
    message: "Treasury share must be at least 5%",
  }).max(20, {
    message: "Treasury share cannot exceed 20%",
  }),
  // Add validation to ensure shares sum to 100%
}).refine((data) => {
  return data.artistShare + data.tokenHolderShare + data.treasuryShare === 100;
}, {
  message: "Revenue shares must sum to 100%",
  path: ["treasuryShare"],
});

// Musical genres options
const genreOptions = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Jazz', 
  'Classical', 'Country', 'Folk', 'Metal', 'Indie', 'Latin', 
  'Reggae', 'Blues', 'Soul', 'Funk', 'Punk', 'Alternative'
];

export default function ArtistRegistration() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');

  // Get the current user info
  const userData = auth.user;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: userData?.id || 0,
      name: userData?.username || '',
      genres: [],
      location: '',
      bannerImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
      tokenName: '',
      tokenSymbol: '',
      tokenSupply: 10000,
      artistShare: 50,
      tokenHolderShare: 40,
      treasuryShare: 10,
      contractAddress: '', // Will be generated later by smart contract
    },
  });

  // Handle share distribution with sliders
  const handleShareChange = (field: 'artistShare' | 'tokenHolderShare' | 'treasuryShare', value: number) => {
    const currentValues = form.getValues();
    const total = 100;
    
    // Set the changed field
    form.setValue(field, value);
    
    // Adjust other fields to maintain sum of 100
    if (field === 'artistShare') {
      const remaining = total - value;
      const ratio = currentValues.tokenHolderShare / (currentValues.tokenHolderShare + currentValues.treasuryShare);
      
      form.setValue('tokenHolderShare', Math.round(remaining * ratio));
      form.setValue('treasuryShare', total - value - Math.round(remaining * ratio));
    } else if (field === 'tokenHolderShare') {
      const remaining = total - value;
      const ratio = currentValues.artistShare / (currentValues.artistShare + currentValues.treasuryShare);
      
      form.setValue('artistShare', Math.round(remaining * ratio));
      form.setValue('treasuryShare', total - value - Math.round(remaining * ratio));
    } else {
      const remaining = total - value;
      const ratio = currentValues.artistShare / (currentValues.artistShare + currentValues.tokenHolderShare);
      
      form.setValue('artistShare', Math.round(remaining * ratio));
      form.setValue('tokenHolderShare', total - value - Math.round(remaining * ratio));
    }
  };

  // Add a genre to the selected list
  const addGenre = (genre: string) => {
    if (!genre || selectedGenres.includes(genre)) return;
    
    const newGenres = [...selectedGenres, genre];
    setSelectedGenres(newGenres);
    form.setValue('genres', newGenres);
    setGenreInput('');
  };

  // Remove a genre from the selected list
  const removeGenre = (genre: string) => {
    const newGenres = selectedGenres.filter(g => g !== genre);
    setSelectedGenres(newGenres);
    form.setValue('genres', newGenres);
  };

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userData) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to register as an artist.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format token symbol (uppercase, no spaces)
      values.tokenSymbol = values.tokenSymbol.toUpperCase().replace(/\s+/g, '');
      
      // Send the registration data to the server
      const result = await apiRequest('POST', '/api/artists', values);
      const newArtist = await result.json();
      
      // Update the user cache to reflect the artist status
      queryClient.setQueryData(['/api/auth/current'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            user: { ...oldData.user, isArtist: true },
            artist: newArtist
          };
        }
        return oldData;
      });
      
      toast({
        title: "Artist Profile Created",
        description: "Your artist profile has been successfully created!",
      });
      
      // Redirect to the artist dashboard
      setLocation(`/artist/${newArtist.id}`);
    } catch (error: any) {
      console.error("Artist registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create artist profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Artist Registration</CardTitle>
            <CardDescription>You need to be logged in to register as an artist.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/login')}>Log In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <MusicIcon className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">Artist Registration</CardTitle>
          </div>
          <CardDescription className="text-base">
            Create your artist profile and launch your token for fan governance and ownership
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="space-y-8">
              {/* Artist Profile Section */}
              <div className="space-y-4">
                <div className="text-xl font-bold flex items-center gap-2 border-b pb-2">
                  <span>Artist Profile</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Artist Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your stage name or band name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Your city or country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="genres"
                  render={() => (
                    <FormItem>
                      <FormLabel>Music Genres</FormLabel>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {selectedGenres.map((genre) => (
                            <div 
                              key={genre} 
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm flex items-center gap-1"
                            >
                              {genre}
                              <button 
                                type="button" 
                                onClick={() => removeGenre(genre)} 
                                className="ml-1 text-secondary-foreground/70 hover:text-secondary-foreground"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Select 
                            onValueChange={(value) => {
                              addGenre(value);
                            }}
                            value=""
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select genres" />
                            </SelectTrigger>
                            <SelectContent>
                              {genreOptions.filter(g => !selectedGenres.includes(g)).map((genre) => (
                                <SelectItem key={genre} value={genre}>
                                  {genre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            type="button" 
                            variant="outline" 
                            disabled={selectedGenres.length === 0}
                            onClick={() => setSelectedGenres([])}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bannerImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="URL to your banner image" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a link to a high-quality banner image (recommended size: 1200x400)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              {/* Token Details Section */}
              <div className="space-y-4">
                <div className="text-xl font-bold flex items-center gap-2 border-b pb-2">
                  <span>Token Details</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tokenName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Aurora Fan Token" {...field} />
                        </FormControl>
                        <FormDescription>
                          The full name of your fan token
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tokenSymbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. AURA" {...field} maxLength={6} />
                        </FormControl>
                        <FormDescription>
                          A short symbol (3-6 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tokenSupply"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Token Supply</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g. 10000" 
                            {...field} 
                            min={1000} 
                            max={1000000} 
                          />
                        </FormControl>
                        <FormDescription>
                          Total number of tokens to create (1,000 - 1,000,000)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Revenue Distribution Section */}
              <div className="space-y-4">
                <div className="text-xl font-bold flex items-center gap-2 border-b pb-2">
                  <span>Revenue Distribution</span>
                </div>
                
                <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Info size={16} />
                    <span>Set how revenue from your music and activities will be distributed. Total must equal 100%.</span>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="artistShare"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel>Artist Share: {field.value}%</FormLabel>
                        </div>
                        <FormControl>
                          <Slider
                            min={10}
                            max={70}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => handleShareChange('artistShare', value[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Percentage of revenue you'll receive directly
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tokenHolderShare"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel>Token Holder Share: {field.value}%</FormLabel>
                        </div>
                        <FormControl>
                          <Slider
                            min={20}
                            max={70}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => handleShareChange('tokenHolderShare', value[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Percentage distributed to your token holders
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="treasuryShare"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel>Treasury Share: {field.value}%</FormLabel>
                        </div>
                        <FormControl>
                          <Slider
                            min={5}
                            max={20}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => handleShareChange('treasuryShare', value[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Percentage allocated to community treasury for future initiatives
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <div className="w-full h-8 bg-primary/10 rounded-md overflow-hidden flex">
                      <div 
                        className="h-full bg-primary/80" 
                        style={{ width: `${form.watch('artistShare')}%` }}
                      >
                        <div className="flex h-full items-center justify-center text-xs font-medium">
                          {form.watch('artistShare')}%
                        </div>
                      </div>
                      <div 
                        className="h-full bg-secondary" 
                        style={{ width: `${form.watch('tokenHolderShare')}%` }}
                      >
                        <div className="flex h-full items-center justify-center text-xs font-medium">
                          {form.watch('tokenHolderShare')}%
                        </div>
                      </div>
                      <div 
                        className="h-full bg-accent" 
                        style={{ width: `${form.watch('treasuryShare')}%` }}
                      >
                        <div className="flex h-full items-center justify-center text-xs font-medium">
                          {form.watch('treasuryShare')}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center text-sm pt-2">
                    <div>
                      <div className="font-medium">Artist</div>
                      <div className="text-muted-foreground">You</div>
                    </div>
                    <div>
                      <div className="font-medium">Token Holders</div>
                      <div className="text-muted-foreground">Your fans</div>
                    </div>
                    <div>
                      <div className="font-medium">Treasury</div>
                      <div className="text-muted-foreground">Community fund</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => setLocation('/')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="px-8">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>Create Artist Profile</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}