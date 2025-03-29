import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Wallet } from "lucide-react";

interface HeaderProps {
  user?: {
    id: number;
    username: string;
    profileImage?: string;
  } | null;
  onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const [location] = useLocation();
  const { connect, disconnect, address, isConnected, shortenAddress, isConnecting } = useWeb3();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleConnectWallet = async () => {
    try {
      await connect();
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to your wallet. Please try again.",
      });
    }
  };

  const handleDisconnectWallet = async () => {
    await disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Discover", path: "/artists" },
    { name: "My Portfolio", path: "/portfolio" },
    { name: "Governance", path: "/governance" },
    { name: "Legal", path: "/legal-compliance" },
  ];

  return (
    <header className="bg-background border-b border-accent-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <div className="relative h-10 w-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent-600 rounded-md"></div>
                    <svg className="absolute inset-0 h-10 w-10 text-white p-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="ml-3 text-xl font-heading font-semibold text-primary">ArtistDAO</span>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div 
                    className={`px-1 pt-1 font-medium cursor-pointer uppercase tracking-wide ${
                      location === item.path 
                        ? "text-primary border-b-2 border-primary" 
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center">
            {/* Wallet Button */}
            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="mr-2">
                    <Wallet className="mr-2 h-4 w-4" />
                    {shortenAddress(address)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Wallet</DropdownMenuLabel>
                  <DropdownMenuItem className="text-xs">{address}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDisconnectWallet}>
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleConnectWallet} 
                disabled={isConnecting}
                className="mr-2 bg-primary text-white border-glow btn-hover-effect font-bold"
              >
                <Wallet className="mr-2 h-4 w-4" />
                {isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
              </Button>
            )}
            
            {/* User Profile */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                    <Avatar>
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/portfolio">
                    <DropdownMenuItem className="cursor-pointer">
                      My Portfolio
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-3">
                <Link href="/login">
                  <Button variant="outline" className="border-primary/70 text-white font-medium hover:bg-primary/10">LOGIN</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary text-white border-glow btn-hover-effect font-bold">SIGN UP</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="text-2xl font-bold text-primary">MENU</SheetTitle>
                  <SheetDescription>
                    Take control of the music industry
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <nav className="flex flex-col space-y-5">
                    {navItems.map((item) => (
                      <Link key={item.path} href={item.path}>
                        <div 
                          className={`px-3 py-2 rounded-md font-bold cursor-pointer uppercase tracking-wide text-lg ${
                            location === item.path 
                              ? "bg-primary/20 text-primary border-l-4 border-primary" 
                              : "text-white/80 hover:text-white hover:bg-white/5"
                          }`}
                          onClick={closeMobileMenu}
                        >
                          {item.name}
                        </div>
                      </Link>
                    ))}
                  </nav>
                  
                  <div className="mt-8 pt-6 border-t border-accent-500/20">
                    <div className="flex flex-col space-y-3">
                      <Button 
                        onClick={handleConnectWallet}
                        disabled={isConnecting}
                        className="w-full bg-primary text-white border-glow btn-hover-effect font-bold uppercase"
                      >
                        {isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
