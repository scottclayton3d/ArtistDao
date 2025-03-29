import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard } from 'lucide-react';
import { buyTokensWithUSD } from '@/lib/web3';

interface BuyTokensUSDProps {
  artistId: number;
  tokenSymbol: string;
  buttonText?: string;
  defaultAmount?: number;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
  userId?: number;
}

export function BuyTokensUSD({
  artistId,
  tokenSymbol,
  buttonText = 'Buy with USD',
  defaultAmount = 10,
  buttonVariant = 'default',
  buttonSize = 'default',
  fullWidth = false,
  userId,
}: BuyTokensUSDProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Fixed price for demo purposes - in a real app this would be dynamic
  const priceUSD = 5;
  
  const handleBuyWithUSD = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid token amount',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if Stripe public key is configured
    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      toast({
        title: 'Payment Setup Required',
        description: 'Stripe payment is not configured. Please contact the administrator.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Create a Stripe checkout session by using our web3 helper
      const result = await buyTokensWithUSD(artistId, amount, priceUSD, userId);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.checkoutUrl) {
        setIsOpen(false);
        window.location.href = result.checkoutUrl;
        return;
      }
      
      throw new Error('No checkout URL returned');
    } catch (error: any) {
      toast({
        title: 'Checkout Error',
        description: error.message || 'An error occurred while creating checkout session',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize}
          className={fullWidth ? 'w-full' : ''}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase {tokenSymbol} Tokens</DialogTitle>
          <DialogDescription>
            Enter the amount of tokens you want to buy with USD.
            Each token costs ${priceUSD.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              min="1"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Total</Label>
            <div className="col-span-3 font-medium">
              ${(amount * priceUSD).toFixed(2)} USD
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleBuyWithUSD}>
            Proceed to Checkout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}