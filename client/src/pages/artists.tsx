import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArtistProfile } from "@/components/artists/ArtistProfile";
import { Input } from "@/components/ui/input";
import { Artist } from "@/types";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ArtistsPageProps {
  userId?: number;
}

export default function Artists({ userId }: ArtistsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch all artists
  const { data: artists, isLoading } = useQuery<Artist[]>({
    queryKey: ['/api/artists'],
  });
  
  // Filter artists based on search term
  const filteredArtists = artists?.filter(artist => 
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.genres?.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    artist.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Discover Artists</h1>
          <p className="mt-1 text-gray-500">Find and invest in talented artists on the ArtistDAO platform</p>
        </div>
        
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search by name, genre, or location..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="flex">
                  <div className="h-48 w-48 bg-gray-200 rounded"></div>
                  <div className="ml-6 flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredArtists && filteredArtists.length > 0 ? (
          <div className="space-y-8">
            {filteredArtists.map((artist) => (
              <ArtistProfile key={artist.id} artist={artist} userId={userId} />
            ))}
          </div>
        ) : searchTerm ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-500">
              No artists match your search for "{searchTerm}". Try a different search term.
            </p>
            <Button onClick={() => setSearchTerm("")} className="mt-4">
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Artists Available</h3>
            <p className="text-gray-500">
              There are no artists on the platform yet. Check back soon or be the first to join as an artist!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
