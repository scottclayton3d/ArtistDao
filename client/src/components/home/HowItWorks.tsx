import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HowItWorks() {
  return (
    <div className="py-16 bg-background border-y border-accent-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wider font-heading">HOW IT WORKS</h2>
          <p className="mt-3 text-xl text-white/70 max-w-2xl mx-auto">Power back to the people, profits back to the music makers</p>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-black rounded-lg p-8 text-center border border-primary/30 hover:border-primary/60 transition-all duration-300">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white mx-auto font-bold text-2xl border-glow">
              01
            </div>
            <h3 className="mt-6 text-xl font-bold text-white uppercase font-heading">Buy Artist Tokens</h3>
            <p className="mt-4 text-white/70">
              Grab tokens for your favorite artists. The earlier you buy in, the more power & profit you get.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="bg-black rounded-lg p-8 text-center border border-primary/30 hover:border-primary/60 transition-all duration-300">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white mx-auto font-bold text-2xl border-glow">
              02
            </div>
            <h3 className="mt-6 text-xl font-bold text-white uppercase font-heading">Vote On Everything</h3>
            <p className="mt-4 text-white/70">
              Music direction, tour decisions, merch, collabs - your tokens = your vote on their next move.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="bg-black rounded-lg p-8 text-center border border-primary/30 hover:border-primary/60 transition-all duration-300">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white mx-auto font-bold text-2xl border-glow">
              03
            </div>
            <h3 className="mt-6 text-xl font-bold text-white uppercase font-heading">Get Paid When They Win</h3>
            <p className="mt-4 text-white/70">
              Your share of streaming, merch, and ticket sales goes straight to your wallet - not to record execs.
            </p>
          </div>
        </div>
        
        <div className="mt-14 text-center">
          <Link href="/how-it-works">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:text-white hover:bg-primary/20 font-bold uppercase">
              Full Tokenomics Breakdown <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
