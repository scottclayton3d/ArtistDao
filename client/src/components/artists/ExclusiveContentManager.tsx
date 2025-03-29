import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertCircle, 
  FileText, 
  Music, 
  Image, 
  Video, 
  Upload, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Clock, 
  Users,
  Lock
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types for exclusive content
interface ExclusiveContent {
  id: number;
  artistId: number;
  title: string;
  description: string;
  contentType: 'audio' | 'video' | 'image' | 'text';
  contentUrl: string;
  thumbnailUrl: string;
  tokenThreshold: number; // Minimum number of tokens required to access
  isPublished: boolean;
  releaseDate: string;
  expirationDate?: string;
  createdAt: string;
  stats: {
    views: number;
    likes: number;
    uniqueViewers: number;
  };
}

interface ExclusiveContentManagerProps {
  artistId: number;
}

// Form validation schema
const contentFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  contentType: z.enum(['audio', 'video', 'image', 'text']),
  contentUrl: z.string().url({ message: "Please enter a valid URL" }),
  thumbnailUrl: z.string().url({ message: "Please enter a valid thumbnail URL" }),
  tokenThreshold: z.coerce.number().int().min(1, { message: "Threshold must be at least 1 token" }),
  isPublished: z.boolean().default(false),
  releaseDate: z.date(),
  expirationDate: z.date().optional().nullable(),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

export function ExclusiveContentManager({ artistId }: ExclusiveContentManagerProps) {
  const [activeTab, setActiveTab] = useState("published");
  const { toast } = useToast();
  
  // Fetch exclusive content for this artist
  const { data: exclusiveContent, isLoading } = useQuery<ExclusiveContent[]>({
    queryKey: [`/api/artists/${artistId}/exclusive-content`],
    // Mock implementation for now
    queryFn: async () => {
      // In a real implementation, this would fetch from the backend
      const mockContent: ExclusiveContent[] = [
        {
          id: 1,
          artistId,
          title: "Behind the Scenes - Northern Lights Recording",
          description: "Exclusive behind-the-scenes footage from the recording session of Northern Lights.",
          contentType: 'video',
          contentUrl: 'https://example.com/video.mp4',
          thumbnailUrl: 'https://placehold.co/600x400/333/white?text=BTS',
          tokenThreshold: 1,
          isPublished: true,
          releaseDate: '2025-02-20T00:00:00Z',
          createdAt: '2025-02-15T12:00:00Z',
          stats: {
            views: 143,
            likes: 98,
            uniqueViewers: 87
          }
        },
        {
          id: 2,
          artistId,
          title: "Early Access - New Album Demo",
          description: "Listen to the demo version of my upcoming album before anyone else.",
          contentType: 'audio',
          contentUrl: 'https://example.com/audio.mp3',
          thumbnailUrl: 'https://placehold.co/600x400/333/white?text=Demo',
          tokenThreshold: 5,
          isPublished: true,
          releaseDate: '2025-03-01T00:00:00Z',
          createdAt: '2025-02-28T09:15:00Z',
          stats: {
            views: 56,
            likes: 42,
            uniqueViewers: 39
          }
        },
        {
          id: 3,
          artistId,
          title: "Backstage Tour Photos",
          description: "Exclusive photos from my European tour.",
          contentType: 'image',
          contentUrl: 'https://example.com/gallery',
          thumbnailUrl: 'https://placehold.co/600x400/333/white?text=Tour',
          tokenThreshold: 2,
          isPublished: false,
          releaseDate: '2025-04-15T00:00:00Z',
          createdAt: '2025-03-10T14:20:00Z',
          stats: {
            views: 0,
            likes: 0,
            uniqueViewers: 0
          }
        }
      ];
      
      return mockContent;
    }
  });
  
  // Filter content based on active tab
  const filteredContent = exclusiveContent?.filter(content => {
    if (activeTab === "published") return content.isPublished;
    if (activeTab === "drafts") return !content.isPublished;
    // For "create" tab, we don't need to filter
    return true;
  });
  
  // Default form values
  const defaultValues: Partial<ContentFormValues> = {
    title: "",
    description: "",
    contentType: "audio",
    contentUrl: "",
    thumbnailUrl: "",
    tokenThreshold: 1,
    isPublished: false,
    releaseDate: new Date(Date.now() + 86400000), // Tomorrow
    expirationDate: null,
  };
  
  // Form for creating/editing content
  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues,
  });
  
  // Create content mutation
  const createContentMutation = useMutation({
    mutationFn: async (data: ContentFormValues) => {
      // Would call the backend API in a real implementation
      return apiRequest("POST", `/api/artists/${artistId}/exclusive-content`, {
        ...data,
        releaseDate: data.releaseDate.toISOString(),
        expirationDate: data.expirationDate ? data.expirationDate.toISOString() : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Content Created",
        description: form.getValues("isPublished") 
          ? "Your exclusive content has been published." 
          : "Your exclusive content has been saved as a draft.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/artists/${artistId}/exclusive-content`] });
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error Creating Content",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // Toggle publish status mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number, isPublished: boolean }) => {
      // Would call the backend API in a real implementation
      return apiRequest("PATCH", `/api/artists/${artistId}/exclusive-content/${id}`, {
        isPublished,
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.isPublished ? "Content Published" : "Content Unpublished",
        description: variables.isPublished 
          ? "Your content is now available to token holders." 
          : "Your content has been set to draft mode.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/artists/${artistId}/exclusive-content`] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error Updating Content",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // Delete content mutation
  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      // Would call the backend API in a real implementation
      return apiRequest("DELETE", `/api/artists/${artistId}/exclusive-content/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Content Deleted",
        description: "Your exclusive content has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/artists/${artistId}/exclusive-content`] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error Deleting Content",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });
  
  // Submit form handler
  const onSubmit = (values: ContentFormValues) => {
    createContentMutation.mutate(values);
  };
  
  // Helper to get content icon based on type
  const getContentIcon = (type: ExclusiveContent['contentType']) => {
    switch (type) {
      case 'audio':
        return <Music className="h-5 w-5 text-primary" />;
      case 'video':
        return <Video className="h-5 w-5 text-primary" />;
      case 'image':
        return <Image className="h-5 w-5 text-primary" />;
      case 'text':
        return <FileText className="h-5 w-5 text-primary" />;
      default:
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h2 className="text-2xl font-bold text-white uppercase font-heading mb-4 md:mb-0">Exclusive Content</h2>
          <TabsList className="bg-black/50">
            <TabsTrigger value="published" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Published
            </TabsTrigger>
            <TabsTrigger value="drafts" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Drafts
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Create New
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="create">
          <Card className="bg-black/50 border-primary/30">
            <CardHeader>
              <CardTitle className="text-white">Create Exclusive Content</CardTitle>
              <CardDescription className="text-white/70">
                Create special content for your token holders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Behind the Scenes - Studio Session" 
                                {...field} 
                                className="bg-black/50 border-primary/30 text-white"
                              />
                            </FormControl>
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
                                placeholder="Describe this exclusive content..." 
                                {...field} 
                                className="bg-black/50 border-primary/30 text-white min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contentType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Content Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-black/50 border-primary/30 text-white">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="audio">Audio</SelectItem>
                                  <SelectItem value="video">Video</SelectItem>
                                  <SelectItem value="image">Image</SelectItem>
                                  <SelectItem value="text">Text</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="tokenThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Tokens Required</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  {...field} 
                                  className="bg-black/50 border-primary/30 text-white"
                                />
                              </FormControl>
                              <FormDescription className="text-white/50 text-xs">
                                Min. tokens to access
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="contentUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Content URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://..." 
                                {...field} 
                                className="bg-black/50 border-primary/30 text-white"
                              />
                            </FormControl>
                            <FormDescription className="text-white/50 text-xs">
                              Link to your content (audio, video, image, or text)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="thumbnailUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Thumbnail URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://..." 
                                {...field} 
                                className="bg-black/50 border-primary/30 text-white"
                              />
                            </FormControl>
                            <FormDescription className="text-white/50 text-xs">
                              Preview image URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-6">
                      <div className="border border-primary/30 rounded-lg p-4 bg-black/30">
                        <h3 className="text-white font-medium mb-4">Publishing Options</h3>
                        
                        <FormField
                          control={form.control}
                          name="releaseDate"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-white">Release Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field} 
                                  value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : ''}
                                  onChange={(e) => {
                                    field.onChange(e.target.value ? new Date(e.target.value) : null);
                                  }}
                                  className="bg-black/50 border-primary/30 text-white"
                                />
                              </FormControl>
                              <FormDescription className="text-white/50 text-xs">
                                When this content becomes available
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="expirationDate"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-white">Expiration Date (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field} 
                                  value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : ''}
                                  onChange={(e) => {
                                    field.onChange(e.target.value ? new Date(e.target.value) : null);
                                  }}
                                  className="bg-black/50 border-primary/30 text-white"
                                />
                              </FormControl>
                              <FormDescription className="text-white/50 text-xs">
                                When this content expires (leave empty for no expiration)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isPublished"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-primary/20 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-white">Publish Immediately</FormLabel>
                                <FormDescription className="text-white/50 text-xs">
                                  Make available to token holders now
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-primary"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="border border-dashed border-primary/30 rounded-lg p-6 h-[220px] overflow-hidden">
                        {form.watch("thumbnailUrl") ? (
                          <div className="flex flex-col items-center h-full">
                            <div className="relative w-full h-[170px]">
                              <img 
                                src={form.watch("thumbnailUrl")} 
                                alt="Thumbnail Preview" 
                                className="w-full h-full object-contain rounded" 
                                onError={() => {
                                  toast({
                                    variant: "destructive",
                                    title: "Image Error",
                                    description: "Could not load the thumbnail. Please check the URL.",
                                  });
                                }}
                              />
                              {form.watch("contentType") === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-primary/80 rounded-full p-3">
                                    <Video className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                              )}
                              {form.watch("contentType") === 'audio' && (
                                <div className="absolute bottom-2 left-2 right-2">
                                  <div className="bg-primary/80 rounded-full p-2 inline-flex items-center">
                                    <Music className="h-4 w-4 text-white mr-2" />
                                    <span className="text-white text-xs">{form.watch("title") || "Audio Preview"}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            <Upload className="h-10 w-10 text-primary/60 mb-3" />
                            <p className="text-white/70 text-center">
                              Add thumbnail URL to preview your content
                            </p>
                            <p className="text-xs text-white/50 mt-2 text-center">
                              Select content type and add URLs above
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white border-glow btn-hover-effect font-bold uppercase"
                    disabled={createContentMutation.isPending}
                  >
                    {createContentMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        {form.watch("isPublished") ? "Publish Exclusive Content" : "Save as Draft"}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="published">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <Card key={i} className="bg-black/50 border-primary/30 animate-pulse">
                  <div className="h-[200px] bg-primary/10 w-full"></div>
                  <CardContent className="mt-4">
                    <div className="h-6 bg-primary/10 w-3/4 mb-2"></div>
                    <div className="h-4 bg-primary/10 w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredContent && filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredContent.map(content => (
                <Card key={content.id} className="bg-black/50 border-primary/30 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={content.thumbnailUrl} 
                      alt={content.title} 
                      className="w-full h-[200px] object-cover" 
                    />
                    {content.contentType === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/30 rounded-full p-3">
                          <Video className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-green-500/20 border-green-500/30 text-green-500">
                        <Eye className="mr-1 h-3 w-3" /> Published
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="outline" className="bg-primary/20 border-primary/30 text-white">
                        <Lock className="mr-1 h-3 w-3" /> {content.tokenThreshold}+ Tokens
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {getContentIcon(content.contentType)}
                        <h3 className="text-white font-bold text-lg ml-2 line-clamp-1">{content.title}</h3>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">{content.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div className="border border-primary/20 rounded-md p-2 bg-black/20">
                        <div className="text-white text-lg font-semibold">{content.stats.views}</div>
                        <div className="text-white/60 text-xs">Views</div>
                      </div>
                      <div className="border border-primary/20 rounded-md p-2 bg-black/20">
                        <div className="text-white text-lg font-semibold">{content.stats.uniqueViewers}</div>
                        <div className="text-white/60 text-xs">Viewers</div>
                      </div>
                      <div className="border border-primary/20 rounded-md p-2 bg-black/20">
                        <div className="text-white text-lg font-semibold">{content.stats.likes}</div>
                        <div className="text-white/60 text-xs">Likes</div>
                      </div>
                    </div>
                    
                    <div className="flex text-white/70 text-xs mb-4 space-x-3">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>Released: {new Date(content.releaseDate).toLocaleDateString()}</span>
                      </div>
                      {content.expirationDate && (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>Expires: {new Date(content.expirationDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="default" 
                        className="flex-1 bg-primary/80 hover:bg-primary"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-primary/60 text-primary hover:text-white hover:bg-primary/20"
                        onClick={() => togglePublishMutation.mutate({ id: content.id, isPublished: false })}
                        disabled={togglePublishMutation.isPending}
                      >
                        <EyeOff className="mr-2 h-4 w-4" />
                        Unpublish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-black/50 border-primary/30">
              <CardContent className="p-12 text-center">
                <div className="text-white/70 mb-6">
                  You don't have any published exclusive content yet.
                </div>
                <Button 
                  onClick={() => setActiveTab("create")}
                  className="bg-primary text-white border-glow font-medium"
                >
                  Create Exclusive Content
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="drafts">
          {filteredContent && filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredContent.map(content => (
                <Card key={content.id} className="bg-black/50 border-primary/30 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={content.thumbnailUrl} 
                      alt={content.title} 
                      className="w-full h-[200px] object-cover" 
                    />
                    {content.contentType === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/30 rounded-full p-3">
                          <Video className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-yellow-500/20 border-yellow-500/30 text-yellow-500">
                        <EyeOff className="mr-1 h-3 w-3" /> Draft
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="outline" className="bg-primary/20 border-primary/30 text-white">
                        <Lock className="mr-1 h-3 w-3" /> {content.tokenThreshold}+ Tokens
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {getContentIcon(content.contentType)}
                        <h3 className="text-white font-bold text-lg ml-2 line-clamp-1">{content.title}</h3>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">{content.description}</p>
                    
                    <div className="flex text-white/70 text-xs mb-4 space-x-3">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>Scheduled for: {new Date(content.releaseDate).toLocaleDateString()}</span>
                      </div>
                      {content.expirationDate && (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>Will expire: {new Date(content.expirationDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="default" 
                        className="flex-1 bg-primary/80 hover:bg-primary"
                        onClick={() => togglePublishMutation.mutate({ id: content.id, isPublished: true })}
                        disabled={togglePublishMutation.isPending}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Publish Now
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-red-500/60 text-red-500 hover:text-white hover:bg-red-500/20"
                        onClick={() => deleteContentMutation.mutate(content.id)}
                        disabled={deleteContentMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-black/50 border-primary/30">
              <CardContent className="p-12 text-center">
                <div className="text-white/70 mb-6">
                  You don't have any draft exclusive content yet.
                </div>
                <Button 
                  onClick={() => setActiveTab("create")}
                  className="bg-primary text-white border-glow font-medium"
                >
                  Create Exclusive Content
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <Alert className="bg-primary/10 border-primary/30">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle className="text-white">Exclusive Content for Token Holders</AlertTitle>
        <AlertDescription className="text-white/70">
          Fans need to own at least the minimum number of tokens to access your exclusive content. 
          This incentivizes token holding and rewards your most dedicated supporters.
        </AlertDescription>
      </Alert>
    </div>
  );
}