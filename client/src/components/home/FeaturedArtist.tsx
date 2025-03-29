import { Link } from "wouter";
import { ArtistProfile } from "@/components/artists/ArtistProfile";
import { Artist as BaseArtist } from "@shared/schema";

// Extended artist data type that's compatible with ArtistProfile
interface ArtistData extends BaseArtist {
  username?: string;
  profileImage?: string; 
  bio?: string;
  walletAddress?: string;
  tokenDistribution?: number;
  genre?: string;
  coverImageUrl?: string;
  verified?: boolean;
  tags?: string[];
  updates?: { id: number; title: string; content: string; date: string; category: string; }[];
}

interface FeaturedArtistProps {
  artist: ArtistData;
}

export function FeaturedArtist({ artist }: FeaturedArtistProps) {
  return (
    <div>
      <ArtistProfile artist={artist} />
      
      <div className="mt-6 text-center">
        <Link href={`/artists/${artist.id}`}>
          <span className="inline-flex items-center text-primary font-medium cursor-pointer">
            View Artist Details
            <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
}
