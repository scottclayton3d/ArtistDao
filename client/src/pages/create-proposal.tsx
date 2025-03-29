import { useEffect } from "react";
import { useLocation } from "wouter";
import { ProposalForm } from "@/components/governance/ProposalForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CreateProposalProps {
  userId?: number;
}

export default function CreateProposal({ userId }: CreateProposalProps) {
  const [, navigate] = useLocation();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);
  
  if (!userId) {
    return null; // Will redirect to login
  }
  
  const handleSuccess = () => {
    navigate("/governance");
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create a New Proposal</CardTitle>
            <CardDescription>
              Submit a proposal for token holders to vote on. Proposals can be about creative direction, 
              business decisions, release strategies, partnerships, or treasury usage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProposalForm userId={userId} onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
