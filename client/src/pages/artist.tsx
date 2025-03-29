import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArtistProfile } from "@/components/artists/ArtistProfile";
import { ProposalItem } from "@/components/governance/ProposalItem";
import { RevenueCard } from "@/components/dashboard/RevenueCard";

// Define the same ArtistData type to match ArtistProfile component
interface ArtistData {
  id: number;
  userId: number;
  name: string;
  genres: string[];
  location: string;
  bannerImage: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: number;
  artistShare: number;
  tokenHolderShare: number;
  treasuryShare: number;
  contractAddress: string;
  
  // Frontend properties
  bio?: string;
  genre?: string;
  coverImageUrl?: string;
  verified?: boolean;
  tags?: string[];
  updates?: { id: number; title: string; content: string; date: string; category: string; }[];
}

interface ArtistPageProps {
  id: string;
  userId?: number;
}

export default function Artist({ id, userId }: ArtistPageProps) {
  const [, navigate] = useLocation();
  const artistId = parseInt(id);
  
  // Fetch artist data
  const { data: artist, isLoading, error } = useQuery<ArtistData>({
    queryKey: [`/api/artists/${artistId}`],
  });
  
  // Fetch artist proposals
  const { data: proposals } = useQuery<{
    id: number;
    title: string;
    description: string;
    type: string;
    status: string;
  }[]>({
    queryKey: [`/api/artists/${artistId}/proposals`],
    enabled: !!artistId,
  });
  
  // Redirect if artist not found
  useEffect(() => {
    if (!isLoading && !artist && error) {
      navigate("/artists");
    }
  }, [artist, isLoading, error, navigate]);

  if (isLoading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded w-full mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return null; // Will redirect to artists page
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Artist Profile Component - All content managed within the profile */}
      <ArtistProfile artist={artist} userId={userId} />
      </div>
    </div>
  );
}
