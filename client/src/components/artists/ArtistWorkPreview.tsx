import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Music, Image, FileText, Lock } from "lucide-react";

interface ArtistWork {
  id: number;
  type: 'music' | 'image' | 'video' | 'text';
  title: string;
  description: string;
  coverUrl: string;
  contentUrl: string;
  isExclusive: boolean;
  dateCreated: string;
  tags: string[];
}

interface ArtistWorkPreviewProps {
  artistId: number;
  userOwnsTokens?: boolean;
}

export function ArtistWorkPreview({ artistId, userOwnsTokens = false }: ArtistWorkPreviewProps) {
  const [activeTab, setActiveTab] = useState("music");
  
  // Mock query - this would be replaced with an actual endpoint
  const { data: artistWorks, isLoading } = useQuery<ArtistWork[]>({
    queryKey: [`/api/artists/${artistId}/works`],
    // For now, return mock data since we don't have this API endpoint yet
    queryFn: async () => {
      // In a real implementation, this would actually fetch from the backend
      // This is just mock data for the UI prototype
      const mockWorks: ArtistWork[] = [
        {
          id: 1,
          type: 'music',
          title: 'Northern Lights',
          description: 'Latest single from the upcoming album',
          coverUrl: 'https://placehold.co/300x300/333/white?text=Cover',
          contentUrl: '#',
          isExclusive: true,
          dateCreated: '2025-02-15',
          tags: ['electronic', 'ambient']
        },
        {
          id: 2,
          type: 'music',
          title: 'Midnight Echo',
          description: 'Collaboration with Nebula',
          coverUrl: 'https://placehold.co/300x300/333/white?text=Cover',
          contentUrl: '#',
          isExclusive: false,
          dateCreated: '2025-01-20',
          tags: ['electronic', 'collaboration']
        },
        {
          id: 3,
          type: 'image',
          title: 'Album Artwork Concept',
          description: 'Preview of the new album artwork',
          coverUrl: 'https://placehold.co/500x500/333/white?text=Artwork',
          contentUrl: '#',
          isExclusive: true,
          dateCreated: '2025-03-01',
          tags: ['artwork', 'concept']
        },
        {
          id: 4,
          type: 'text',
          title: 'Lyric Sheet - Northern Lights',
          description: 'Official lyrics for the latest single',
          coverUrl: 'https://placehold.co/300x400/333/white?text=Lyrics',
          contentUrl: '#',
          isExclusive: false,
          dateCreated: '2025-02-16',
          tags: ['lyrics', 'official']
        }
      ];
      
      return mockWorks;
    }
  });
  
  const filteredWorks = artistWorks?.filter(work => 
    (work.type === activeTab) && (userOwnsTokens || !work.isExclusive)
  );

  return (
    <div className="bg-background border border-primary/20 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6 uppercase font-heading">Artist Works</h2>
      
      <Tabs defaultValue="music" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-black/50">
          <TabsTrigger value="music" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Music className="mr-2 h-4 w-4" />
            Music
          </TabsTrigger>
          <TabsTrigger value="image" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Image className="mr-2 h-4 w-4" />
            Artwork
          </TabsTrigger>
          <TabsTrigger value="video" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Play className="mr-2 h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="text" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredWorks && filteredWorks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map(work => (
              <Card key={work.id} className="bg-black/50 border-primary/20 overflow-hidden">
                <div className="relative">
                  <img 
                    src={work.coverUrl} 
                    alt={work.title} 
                    className="w-full h-48 object-cover" 
                  />
                  {work.isExclusive && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-white">
                        <Lock className="h-3 w-3 mr-1" /> Exclusive
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-white text-lg mb-1">{work.title}</h3>
                  <p className="text-white/70 text-sm mb-3">{work.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {work.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="border-primary/40 text-white/80">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant={work.isExclusive && !userOwnsTokens ? "outline" : "default"}
                    className={work.isExclusive && !userOwnsTokens 
                      ? "w-full border-primary/60 text-primary hover:bg-primary/20" 
                      : "w-full bg-primary hover:bg-primary/90"
                    }
                    disabled={work.isExclusive && !userOwnsTokens}
                  >
                    {work.isExclusive && !userOwnsTokens 
                      ? "Token Holders Only" 
                      : work.type === 'music' 
                        ? "Play Track" 
                        : work.type === 'image' 
                          ? "View Full Size" 
                          : work.type === 'video' 
                            ? "Watch Video" 
                            : "View Document"
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-black/30 rounded-lg p-8 text-center">
            <p className="text-white/70 mb-4">
              {activeTab === 'music' 
                ? "No music tracks available." 
                : activeTab === 'image' 
                  ? "No artwork available." 
                  : activeTab === 'video' 
                    ? "No videos available." 
                    : "No documents available."
              }
            </p>
            {userOwnsTokens && (
              <p className="text-primary/80">
                Check back soon for new exclusive content!
              </p>
            )}
          </div>
        )}
      </Tabs>
      
      {!userOwnsTokens && (
        <div className="mt-8 p-4 border border-primary/30 rounded bg-primary/10 text-center">
          <p className="text-white mb-3">
            Own artist tokens to unlock exclusive content and early releases
          </p>
          <Button className="bg-primary text-white border-glow font-medium">
            Buy Tokens to Access Exclusives
          </Button>
        </div>
      )}
    </div>
  );
}