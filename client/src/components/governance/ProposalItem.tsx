import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { castVote } from "@/lib/web3";
import { Proposal } from "@/types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ProposalItemProps {
  proposal: Proposal;
  userId: number;
  contractAddress?: string;
  compact?: boolean;
}

export function ProposalItem({ proposal, userId, contractAddress, compact = false }: ProposalItemProps) {
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };
  
  // Calculate time remaining
  const timeRemaining = () => {
    const end = new Date(proposal.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day";
    if (diffDays > 1) return `${diffDays} days`;
    
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return `${diffHours} hours`;
  };
  
  // Handle vote submission
  const voteMutation = useMutation({
    mutationFn: async (optionIndex: number) => {
      // First submit the vote to the API
      await apiRequest("POST", `/api/proposals/${proposal.id}/vote`, {
        userId,
        optionIndex,
      });
      
      // If there's a contract address, also submit the vote on-chain
      if (contractAddress) {
        await castVote(contractAddress, proposal.id, optionIndex);
      }
    },
    onSuccess: () => {
      toast({
        title: "Vote Submitted",
        description: "Your vote has been successfully recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/proposals/active'] });
      setIsVoteModalOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Vote Failed",
        description: error instanceof Error ? error.message : "Failed to submit your vote. Please try again.",
      });
    },
  });
  
  const handleVote = () => {
    if (selectedOption === null) {
      toast({
        variant: "destructive",
        title: "No Option Selected",
        description: "Please select an option to vote.",
      });
      return;
    }
    
    voteMutation.mutate(selectedOption);
  };
  
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">{proposal.title}</CardTitle>
              <CardDescription className="text-xs">
                {proposal.artistName} • Ends in {timeRemaining()}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
              Voting
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-xs font-medium text-gray-500 mb-1">Current Results</div>
          
          {proposal.votes?.options.slice(0, 2).map((option, index) => (
            <div key={index} className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>{option}</span>
                <span>{proposal.votes?.percentages[index]}%</span>
              </div>
              <Progress value={proposal.votes?.percentages[index]} className="h-2" />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full text-primary border-primary hover:bg-primary-50"
            size="sm"
            onClick={() => setIsVoteModalOpen(true)}
          >
            Cast Your Vote
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{proposal.title}</CardTitle>
            <CardDescription>
              Created by {proposal.creatorId === userId ? "you" : "another user"} • {formatDate(proposal.startDate)}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Voting
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Artist</span>
            <span className="text-sm">{proposal.artistName} ({proposal.tokenSymbol})</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Type</span>
            <span className="text-sm capitalize">{proposal.type} Decision</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Ends In</span>
            <span className="text-sm">{timeRemaining()}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Total Votes</span>
            <span className="text-sm">{proposal.votes?.total || 0} tokens</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-gray-600">{proposal.description}</p>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium mb-2">Current Results</h3>
          
          {proposal.votes?.options.map((option, index) => (
            <div key={index} className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{option}</span>
                <span>{proposal.votes?.percentages[index]}%</span>
              </div>
              <Progress value={proposal.votes?.percentages[index]} className="h-2.5" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => setIsVoteModalOpen(true)}>
          Cast Your Vote
        </Button>
      </CardFooter>
      
      <Dialog open={isVoteModalOpen} onOpenChange={setIsVoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vote on Proposal</DialogTitle>
            <DialogDescription>
              {proposal.title} - Cast your vote using your token holdings. Your voting power is proportional to the amount of {proposal.tokenSymbol} tokens you hold.
            </DialogDescription>
          </DialogHeader>
          
          <RadioGroup
            value={selectedOption?.toString()}
            onValueChange={(value) => setSelectedOption(parseInt(value))}
            className="mt-2"
          >
            {proposal.votes?.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2 p-2 border border-gray-200 rounded-md">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVoteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleVote}
              disabled={voteMutation.isPending || selectedOption === null}
            >
              {voteMutation.isPending ? "Submitting..." : "Submit Vote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
