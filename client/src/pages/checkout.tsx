import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

// Load Stripe outside of component render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required environment variable: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  artistName: string;
  tokenSymbol: string;
  tokenAmount: number;
  priceUSD: number;
}

function CheckoutForm({ artistName, tokenSymbol, tokenAmount, priceUSD }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/portfolio',
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed. You'll be redirected soon.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-4">
        <PaymentElement />
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${(tokenAmount * priceUSD).toFixed(2)}`
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

interface CheckoutParams {
  artistId?: string;
  amount?: string;
  priceUSD?: string;
}

export default function Checkout() {
  const [searchParams, _setSearchParams] = useState<URLSearchParams>(() => 
    new URLSearchParams(window.location.search)
  );
  const [clientSecret, setClientSecret] = useState("");
  const [checkoutDetails, setCheckoutDetails] = useState<{
    artistId: number;
    artistName: string;
    tokenSymbol: string;
    tokenAmount: number;
    priceUSD: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Extract parameters from URL
  useEffect(() => {
    const artistId = searchParams.get('artistId');
    const amount = searchParams.get('amount');
    const priceUSD = searchParams.get('priceUSD');

    if (!artistId || !amount || !priceUSD) {
      setError("Missing required parameters");
      return;
    }

    // Fetch artist details and create payment intent
    const fetchArtistAndCreateIntent = async () => {
      try {
        // Get artist details
        const artistResponse = await apiRequest("GET", `/api/artists/${artistId}`);
        const artist = await artistResponse.json();

        const tokenAmount = parseFloat(amount);
        const tokenPrice = parseFloat(priceUSD);

        if (isNaN(tokenAmount) || isNaN(tokenPrice)) {
          throw new Error("Invalid amount or price");
        }

        // Create payment intent
        const response = await apiRequest("POST", `/api/artists/${artistId}/buy-tokens-usd`, {
          amount: tokenAmount,
          priceUSD: tokenPrice,
        });

        const data = await response.json();

        if (response.ok) {
          setClientSecret(data.clientSecret);
          setCheckoutDetails({
            artistId: parseInt(artistId),
            artistName: artist.name,
            tokenSymbol: artist.tokenSymbol,
            tokenAmount,
            priceUSD: tokenPrice,
          });
        } else {
          throw new Error(data.message || "Failed to create payment intent");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred during checkout setup");
        toast({
          title: "Checkout Error",
          description: err.message || "An error occurred during checkout setup",
          variant: "destructive",
        });
      }
    };

    fetchArtistAndCreateIntent();
  }, [searchParams]);

  const handleBackToArtist = () => {
    if (checkoutDetails) {
      setLocation(`/artist/${checkoutDetails.artistId}`);
    } else {
      setLocation('/artists');
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Checkout Error</CardTitle>
            <CardDescription>We encountered a problem with your checkout</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-destructive mb-6">{error}</div>
            <Button onClick={() => setLocation('/artists')}>
              Back to Artists
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret || !checkoutDetails) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0f172a',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Purchase</CardTitle>
          <CardDescription>
            Buying {checkoutDetails.tokenAmount} {checkoutDetails.tokenSymbol} tokens from {checkoutDetails.artistName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex justify-between">
              <span>Token Amount:</span>
              <span className="font-medium">{checkoutDetails.tokenAmount} {checkoutDetails.tokenSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Price per Token:</span>
              <span className="font-medium">${checkoutDetails.priceUSD.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-bold">Total:</span>
              <span className="font-bold">${(checkoutDetails.tokenAmount * checkoutDetails.priceUSD).toFixed(2)}</span>
            </div>
          </div>

          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm 
              artistName={checkoutDetails.artistName}
              tokenSymbol={checkoutDetails.tokenSymbol}
              tokenAmount={checkoutDetails.tokenAmount}
              priceUSD={checkoutDetails.priceUSD}
            />
          </Elements>
        </CardContent>
        <CardFooter className="flex justify-start">
          <Button variant="outline" onClick={handleBackToArtist}>
            Cancel and Return
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}