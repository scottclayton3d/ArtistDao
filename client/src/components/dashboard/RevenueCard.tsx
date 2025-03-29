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
import { ArtistRevenue } from "@/types";

interface RevenueCardProps {
  artistId: number;
}

export function RevenueCard({ artistId }: RevenueCardProps) {
  const { data: revenue, isLoading, error } = useQuery<ArtistRevenue>({
    queryKey: [`/api/artists/${artistId}/revenue`],
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
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex justify-between items-center mt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="mt-6">
            <Skeleton className="h-4 w-40 mb-4" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !revenue) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Distribution</CardTitle>
          <CardDescription>Failed to load revenue data</CardDescription>
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

  // Get the data for the chart
  const months = Object.keys(revenue.monthlyData);
  const values = Object.values(revenue.monthlyData);
  const maxValue = Math.max(...values);

  // Calculate the height percentages for the chart bars
  const getHeight = (value: number) => {
    return Math.round((value / maxValue) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">Total Earnings</span>
          <span className="text-lg font-semibold text-secondary">{revenue.totalEarnings.toFixed(2)} ETH</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-medium text-gray-500">Last Month</span>
          <span className="text-sm font-semibold text-green-500">
            +{revenue.lastMonthEarnings.toFixed(1)} ETH
          </span>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Earnings Breakdown</h4>
          
          <div className="h-[200px] flex items-end justify-around py-2 relative">
            {months.slice(-4).map((month, index) => {
              const value = revenue.monthlyData[month];
              const height = getHeight(value);
              const bgClass = index === 0 
                ? "bg-primary-300" 
                : index === 1 
                  ? "bg-primary-400" 
                  : index === 2 
                    ? "bg-primary-500" 
                    : "bg-primary-600";
              
              return (
                <div 
                  key={month} 
                  className={`w-8 rounded-t-md transition-all duration-500 ${bgClass}`} 
                  style={{ height: `${height}%` }}
                  title={`${month}: ${value.toFixed(1)} ETH`}
                />
              );
            })}
          </div>
          
          <div className="flex justify-around text-xs text-gray-500 mt-2">
            {months.slice(-4).map(month => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Revenue Distribution</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary mr-2" />
                <span className="text-sm text-gray-700">
                  Artist Share ({revenue.distribution.artist.percentage}%)
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {revenue.distribution.artist.amount.toFixed(2)} ETH
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-accent-400 mr-2" />
                <span className="text-sm text-gray-700">
                  Token Holders ({revenue.distribution.tokenHolders.percentage}%)
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {revenue.distribution.tokenHolders.amount.toFixed(2)} ETH
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-secondary mr-2" />
                <span className="text-sm text-gray-700">
                  DAO Treasury ({revenue.distribution.treasury.percentage}%)
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {revenue.distribution.treasury.amount.toFixed(2)} ETH
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/artists/${artistId}/revenue`}>View Full Reports</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
