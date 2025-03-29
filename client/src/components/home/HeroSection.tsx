import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Music, Sparkles, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <div className="bg-black py-16 md:py-24 border-b border-accent-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-1/2">
            <div className="mb-6 inline-flex items-center rounded-full border border-accent-500/40 bg-accent-500/10 px-3 py-1">
              <Sparkles className="mr-2 h-4 w-4 text-accent-400" />
              <span className="text-xs font-medium text-accent-400">The Music Revolution Is Here</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-white leading-tight">
              BREAK THE <span className="text-primary text-glow">CHAINS</span>
              <br />
              TAKE THE <span className="text-primary text-glow">POWER</span>
            </h1>
            
            <p className="mt-6 text-xl md:text-2xl text-white/80 max-w-lg font-medium">
              Screw the labels. Own your favorite artists, vote on their future, and profit when they succeed.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/artists">
                <Button size="lg" variant="default" className="w-full sm:w-auto btn-hover-effect bg-primary hover:bg-primary/90 text-white font-bold border-glow">
                  JOIN THE REVOLUTION <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register?type=artist">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:text-white hover:bg-primary/20 font-bold">
                  BECOME AN ARTIST
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex items-center space-x-4 text-white/60">
              <div className="flex items-center">
                <Zap className="mr-1 h-4 w-4" />
                <span className="text-sm">100+ Artists</span>
              </div>
              <div className="h-4 w-px bg-white/20"></div>
              <div className="flex items-center">
                <Music className="mr-1 h-4 w-4" />
                <span className="text-sm">10K+ Token Holders</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block md:w-1/2 ml-8 mt-8 md:mt-0">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent-500/20 p-8 rounded-lg border border-primary/30 border-glow text-white">
              <div className="space-y-6">
                <div className="text-2xl font-bold text-primary">DISRUPT THE INDUSTRY</div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-base md:text-lg">Artist tokens = your voice + your share of the future</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-base md:text-lg">Vote on music, visuals, tours & collabs - real power, not just likes</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-base md:text-lg">Get paid when they blow up - no more giving $ to corporate execs</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-base md:text-lg">All on-chain, transparent AF - no industry BS or hidden deals</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
