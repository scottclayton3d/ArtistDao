import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Proposal } from "@/types";

export function GovernanceCard() {
  const { data: proposals, isLoading, error } = useQuery<Proposal[]>({
    queryKey: ['/api/proposals/active'],
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
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="mt-4 space-y-4">
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !proposals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Governance</CardTitle>
          <CardDescription>Failed to load proposal data</CardDescription>
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

  // Calculate time remaining
  const timeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day";
    if (diffDays > 1) return `${diffDays} days`;
    
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return `${diffHours} hours`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Governance</CardTitle>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-medium text-gray-500">Active Proposals</span>
          {proposals.length > 0 && (
            <Badge variant="outline" className="bg-primary-100 text-primary-800 hover:bg-primary-100">
              {proposals.length} New
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {proposals.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No active proposals</p>
            <Link href="/create-proposal">
              <Button variant="link" className="mt-2">
                Create a New Proposal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.slice(0, 2).map((proposal) => (
              <div key={proposal.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{proposal.title}</h4>
                    <p className="text-xs text-gray-500">
                      {proposal.artistName} • Ends in {timeRemaining(proposal.endDate)}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Voting
                  </Badge>
                </div>
                
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">Current Results</div>
                  
                  {proposal.votes?.options.map((option, index) => (
                    <div key={index} className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{option}</span>
                        <span>{proposal.votes?.percentages[index]}%</span>
                      </div>
                      <Progress value={proposal.votes?.percentages[index]} className="h-2" />
                    </div>
                  ))}
                </div>
                
                <Link href={`/governance/proposals/${proposal.id}`}>
                  <Button variant="outline" className="mt-3 w-full text-primary border-primary hover:bg-primary-50" size="sm">
                    Cast Your Vote
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/governance">View All Proposals</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
