import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Portfolio } from "@/types";

interface PortfolioCardProps {
  userId: number;
}

export function PortfolioCard({ userId }: PortfolioCardProps) {
  const { data: portfolio, isLoading, error } = useQuery<Portfolio>({
    queryKey: [`/api/users/${userId}/portfolio`],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex justify-between items-center mt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="mt-6">
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !portfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Portfolio</CardTitle>
          <CardDescription>Failed to load portfolio data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Something went wrong. Please try again."}
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Total Value</span>
          <span className="text-lg font-semibold text-secondary">{portfolio.totalValue} ETH</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-medium text-gray-500">24h Change</span>
          <span 
            className={`text-sm font-semibold ${
              parseFloat(portfolio.dailyChange) >= 0
                ? "text-green-500" 
                : "text-red-500"
            }`}
          >
            {parseFloat(portfolio.dailyChange) >= 0 ? "+" : ""}{portfolio.dailyChange}%
          </span>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Your Artist Tokens</h4>
          
          {portfolio.tokens.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No tokens in your portfolio</p>
              <Link href="/artists">
                <Button variant="link" className="mt-2">
                  Browse Artists to Invest
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolio.tokens.slice(0, 3).map((token) => (
                <div
                  key={token.tokenId}
                  className="bg-gray-50 rounded-md p-3 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Link href={`/artists/${token.artistId}`}>
                      <a className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-bold text-sm">
                          {token.artistName.slice(0, 1)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{token.tokenName}</p>
                          <p className="text-xs text-gray-500">{token.amount} tokens</p>
                        </div>
                      </a>
                    </Link>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{token.value} ETH</p>
                    <p 
                      className={`text-xs ${
                        parseFloat(token.dailyChange) >= 0
                          ? "text-green-500" 
                          : "text-red-500"
                      }`}
                    >
                      {parseFloat(token.dailyChange) >= 0 ? "+" : ""}{token.dailyChange}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/portfolio">View All Tokens</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
