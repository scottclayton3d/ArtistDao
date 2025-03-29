import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type Jurisdiction = {
  id: string;
  name: string;
  countryCode: string;
  flagEmoji: string;
  regulatoryLevel: "high" | "medium" | "low";
  supportedFeatures: string[];
  restrictedFeatures: string[];
  requiresKYC: boolean;
  tokenSaleRestrictions: string;
  documentationRequired: string[];
};

const jurisdictions: Jurisdiction[] = [
  {
    id: "usa",
    name: "United States",
    countryCode: "US",
    flagEmoji: "🇺🇸",
    regulatoryLevel: "high",
    supportedFeatures: ["Fan governance with restrictions", "Token ownership", "Secondary transfers with limitations"],
    restrictedFeatures: ["Public token sales", "Unregistered securities", "Profit sharing without SEC exemptions"],
    requiresKYC: true,
    tokenSaleRestrictions: "Only to accredited investors unless registered or exempt",
    documentationRequired: ["SEC Filing or Exemption Documentation", "AML Policy", "Privacy Policy", "Terms of Service"],
  },
  {
    id: "eu",
    name: "European Union",
    countryCode: "EU",
    flagEmoji: "🇪🇺",
    regulatoryLevel: "high",
    supportedFeatures: ["Fan governance", "Token ownership", "Secondary markets with compliance"],
    restrictedFeatures: ["Unregulated token offerings", "Non-compliant data processing"],
    requiresKYC: true,
    tokenSaleRestrictions: "Must comply with MiCA regulation and local securities laws",
    documentationRequired: ["MiCA Compliance Documentation", "GDPR Privacy Policy", "AML/KYC Policy", "Terms of Service"],
  },
  {
    id: "uk",
    name: "United Kingdom",
    countryCode: "UK",
    flagEmoji: "🇬🇧",
    regulatoryLevel: "high",
    supportedFeatures: ["Fan governance", "Token ownership", "Secondary markets with FCA compliance"],
    restrictedFeatures: ["Unregulated token offerings", "Non-compliant promotions"],
    requiresKYC: true,
    tokenSaleRestrictions: "Must comply with Financial Conduct Authority guidelines",
    documentationRequired: ["FCA Registration or Exemption", "KYC/AML Policy", "Privacy Policy", "Terms of Service"],
  },
  {
    id: "singapore",
    name: "Singapore",
    countryCode: "SG",
    flagEmoji: "🇸🇬",
    regulatoryLevel: "medium",
    supportedFeatures: ["Fan governance", "Token ownership", "Secondary markets with MAS compliance"],
    restrictedFeatures: ["Non-compliant token offerings"],
    requiresKYC: true,
    tokenSaleRestrictions: "Must comply with Monetary Authority of Singapore guidelines",
    documentationRequired: ["MAS Compliance Documentation", "AML Policy", "Privacy Policy", "Terms of Service"],
  },
  {
    id: "japan",
    name: "Japan",
    countryCode: "JP",
    flagEmoji: "🇯🇵",
    regulatoryLevel: "high",
    supportedFeatures: ["Fan governance with restrictions", "Token ownership", "Licensed exchanges only"],
    restrictedFeatures: ["Unlicensed exchanges", "Non-registered tokens"],
    requiresKYC: true,
    tokenSaleRestrictions: "Must register with Financial Services Agency",
    documentationRequired: ["FSA Registration", "AML Policy", "Privacy Policy", "Terms of Service"],
  },
  {
    id: "switzerland",
    name: "Switzerland",
    countryCode: "CH",
    flagEmoji: "🇨🇭",
    regulatoryLevel: "medium",
    supportedFeatures: ["Fan governance", "Token ownership", "Secondary markets", "Innovative regulatory sandbox"],
    restrictedFeatures: ["Non-compliant financial services"],
    requiresKYC: true,
    tokenSaleRestrictions: "Must comply with FINMA guidelines, more permissive framework",
    documentationRequired: ["FINMA Compliance Documentation", "AML Policy", "Privacy Policy", "Terms of Service"],
  },
  {
    id: "dubai",
    name: "Dubai (DIFC)",
    countryCode: "AE",
    flagEmoji: "🇦🇪",
    regulatoryLevel: "medium",
    supportedFeatures: ["Fan governance", "Token ownership", "Secondary markets", "Crypto-friendly regulations"],
    restrictedFeatures: ["Operations outside of regulatory framework"],
    requiresKYC: true,
    tokenSaleRestrictions: "Must comply with DFSA regulations within DIFC",
    documentationRequired: ["DFSA Compliance Documentation", "AML Policy", "Privacy Policy", "Terms of Service"],
  },
  {
    id: "australia",
    name: "Australia",
    countryCode: "AU",
    flagEmoji: "🇦🇺",
    regulatoryLevel: "medium",
    supportedFeatures: ["Fan governance", "Token ownership", "Secondary markets with ASIC compliance"],
    restrictedFeatures: ["Unregulated financial products"],
    requiresKYC: true,
    tokenSaleRestrictions: "Must comply with Australian Securities and Investments Commission",
    documentationRequired: ["ASIC Compliance Documentation", "AML/CTF Policy", "Privacy Policy", "Terms of Service"],
  },
  {
    id: "canada",
    name: "Canada",
    countryCode: "CA",
    flagEmoji: "🇨🇦",
    regulatoryLevel: "high",
    supportedFeatures: ["Fan governance with restrictions", "Token ownership", "Regulated secondary markets"],
    restrictedFeatures: ["Unregistered securities offerings"],
    requiresKYC: true,
    tokenSaleRestrictions: "Must comply with provincial securities regulations",
    documentationRequired: ["Securities Commission Filings", "AML Policy", "Privacy Policy", "Terms of Service"],
  },
  {
    id: "south-korea",
    name: "South Korea",
    countryCode: "KR",
    flagEmoji: "🇰🇷",
    regulatoryLevel: "high",
    supportedFeatures: ["Fan governance with restrictions", "Token ownership", "Licensed exchanges only"],
    restrictedFeatures: ["Unlicensed exchanges", "Non-compliant tokens"],
    requiresKYC: true,
    tokenSaleRestrictions: "Must comply with Financial Services Commission regulations",
    documentationRequired: ["FSC Compliance Documentation", "AML Policy", "Privacy Policy", "Terms of Service"],
  }
];

interface JurisdictionSelectorProps {
  selectedJurisdiction: string | null;
  onJurisdictionChange: (jurisdiction: string) => void;
  className?: string;
}

export function JurisdictionSelector({ 
  selectedJurisdiction, 
  onJurisdictionChange,
  className 
}: JurisdictionSelectorProps) {
  const [regulationFilter, setRegulationFilter] = useState<"high" | "medium" | "low" | "all">("all");
  const [requiresKYCFilter, setRequiresKYCFilter] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredJurisdictions = jurisdictions.filter(jurisdiction => {
    // Apply regulatory level filter
    if (regulationFilter !== "all" && jurisdiction.regulatoryLevel !== regulationFilter) {
      return false;
    }
    
    // Apply KYC filter
    if (requiresKYCFilter !== null && jurisdiction.requiresKYC !== requiresKYCFilter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery && !jurisdiction.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  const handleJurisdictionSelect = (jurisdictionId: string) => {
    onJurisdictionChange(jurisdictionId);
  };
  
  // Get the selected jurisdiction details
  const selectedJurisdictionDetails = selectedJurisdiction 
    ? jurisdictions.find(j => j.id === selectedJurisdiction) 
    : null;
  
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full sm:w-1/3 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Filter Jurisdictions</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Regulatory Level</h4>
                  <RadioGroup 
                    value={regulationFilter} 
                    onValueChange={(value) => setRegulationFilter(value as any)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">All levels</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high">High regulation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium regulation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low">Low regulation</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">KYC Requirements</h4>
                  <RadioGroup 
                    value={requiresKYCFilter === null ? "all" : requiresKYCFilter ? "yes" : "no"} 
                    onValueChange={(value) => {
                      if (value === "all") setRequiresKYCFilter(null);
                      else if (value === "yes") setRequiresKYCFilter(true);
                      else setRequiresKYCFilter(false);
                    }}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="kyc-all" />
                      <Label htmlFor="kyc-all">All</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="kyc-yes" />
                      <Label htmlFor="kyc-yes">KYC required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="kyc-no" />
                      <Label htmlFor="kyc-no">KYC not required</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full sm:w-2/3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJurisdictions.map((jurisdiction) => (
              <Card key={jurisdiction.id} className={cn(
                "cursor-pointer transition-all hover:border-primary",
                selectedJurisdiction === jurisdiction.id && "border-2 border-primary"
              )}>
                <CardContent className="p-4">
                  <div 
                    className="flex items-center" 
                    onClick={() => handleJurisdictionSelect(jurisdiction.id)}
                  >
                    <div className="text-2xl mr-2">{jurisdiction.flagEmoji}</div>
                    <div>
                      <h3 className="font-medium">{jurisdiction.name}</h3>
                      <div className="text-xs text-muted-foreground">
                        {jurisdiction.regulatoryLevel === "high" && "High regulation"}
                        {jurisdiction.regulatoryLevel === "medium" && "Medium regulation"}
                        {jurisdiction.regulatoryLevel === "low" && "Low regulation"}
                        {jurisdiction.requiresKYC && " • KYC required"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredJurisdictions.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p>No jurisdictions match your filter criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {selectedJurisdictionDetails && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">{selectedJurisdictionDetails.flagEmoji}</div>
              <h2 className="text-2xl font-bold">{selectedJurisdictionDetails.name}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Supported Features</h3>
                <ul className="space-y-1">
                  {selectedJurisdictionDetails.supportedFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                
                <h3 className="font-semibold text-lg mt-4 mb-2">Restricted Features</h3>
                <ul className="space-y-1">
                  {selectedJurisdictionDetails.restrictedFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">✕</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Token Sale Restrictions</h3>
                <p className="text-sm mb-4">{selectedJurisdictionDetails.tokenSaleRestrictions}</p>
                
                <h3 className="font-semibold text-lg mb-2">Required Documentation</h3>
                <ul className="space-y-1">
                  {selectedJurisdictionDetails.documentationRequired.map((doc, index) => (
                    <li key={index} className="text-sm">{doc}</li>
                  ))}
                </ul>
                
                <Button className="mt-4 w-full">Generate Compliance Documents</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}