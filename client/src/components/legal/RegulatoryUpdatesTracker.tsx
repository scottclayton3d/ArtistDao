import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Jurisdiction } from "./JurisdictionSelector";

interface RegulatoryUpdatesTrackerProps {
  jurisdiction: Jurisdiction;
  className?: string;
}

type RegulatoryUpdate = {
  id: string;
  title: string;
  date: string;
  category: "cryptocurrency" | "securities" | "data-privacy" | "consumer-protection" | "taxation";
  severity: "high" | "medium" | "low";
  summary: string;
  fullText?: string;
  source: string;
  sourceUrl: string;
  status: "proposed" | "approved" | "in-effect" | "repealed";
  affectedAreas: string[];
  actionRequired?: string;
};

export function RegulatoryUpdatesTracker({ jurisdiction, className }: RegulatoryUpdatesTrackerProps) {
  const [timeframe, setTimeframe] = useState<"recent" | "upcoming" | "all">("recent");
  const [category, setCategory] = useState<string>("all");
  
  const regulatoryUpdates = getRegulationsForJurisdiction(jurisdiction.id);
  
  const filteredUpdates = regulatoryUpdates.filter(update => {
    if (timeframe === "recent") {
      // Filter for updates in the last 3 months
      const updateDate = new Date(update.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      if (updateDate < threeMonthsAgo) return false;
    }
    
    if (timeframe === "upcoming" && update.status !== "proposed") {
      return false;
    }
    
    if (category !== "all" && update.category !== category) {
      return false;
    }
    
    return true;
  });
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800 hover:bg-red-100/80";
      case "medium": return "bg-amber-100 text-amber-800 hover:bg-amber-100/80";
      case "low": return "bg-green-100 text-green-800 hover:bg-green-100/80";
      default: return "";
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-effect": return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "approved": return "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
      case "proposed": return "bg-orange-100 text-orange-800 hover:bg-orange-100/80";
      case "repealed": return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
      default: return "";
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Regulatory Updates for {jurisdiction.name}</CardTitle>
        <CardDescription>
          Stay informed about recent and upcoming regulatory changes affecting blockchain and crypto assets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div>
            <Select
              value={timeframe}
              onValueChange={(value) => setTimeframe(value as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent Changes</SelectItem>
                <SelectItem value="upcoming">Upcoming Changes</SelectItem>
                <SelectItem value="all">All Updates</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                <SelectItem value="securities">Securities Regulation</SelectItem>
                <SelectItem value="data-privacy">Data Privacy</SelectItem>
                <SelectItem value="consumer-protection">Consumer Protection</SelectItem>
                <SelectItem value="taxation">Taxation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {filteredUpdates.length > 0 ? (
          <div className="space-y-4">
            {filteredUpdates.map((update) => (
              <Card key={update.id} className="overflow-hidden">
                <div className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h3 className="font-medium text-lg">{update.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getSeverityColor(update.severity)}>
                        {update.severity === "high" ? "High Impact" : 
                         update.severity === "medium" ? "Medium Impact" : "Low Impact"}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(update.status)}>
                        {update.status === "in-effect" ? "In Effect" : 
                         update.status === "approved" ? "Approved" : 
                         update.status === "proposed" ? "Proposed" : "Repealed"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-4">
                    <span className="font-medium">Date:</span> {update.date} | 
                    <span className="font-medium ml-2">Source:</span> <a href={update.sourceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{update.source}</a>
                  </div>
                  
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="mb-2">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="details">Full Details</TabsTrigger>
                      <TabsTrigger value="impact">Business Impact</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="summary" className="space-y-2">
                      <p>{update.summary}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {update.affectedAreas.map((area, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{area}</Badge>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details">
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{update.fullText || "Full regulatory text not available yet."}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="impact">
                      <div className="space-y-2">
                        <h4 className="font-medium">Affected Platform Areas:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {update.affectedAreas.map((area, index) => (
                            <li key={index}>{area}</li>
                          ))}
                        </ul>
                        
                        {update.actionRequired && (
                          <>
                            <h4 className="font-medium mt-4">Required Actions:</h4>
                            <p>{update.actionRequired}</p>
                          </>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No regulatory updates found for the selected filters.</p>
          </div>
        )}
        
        <Button variant="outline" className="mt-6 w-full">
          Subscribe to Regulatory Alerts
        </Button>
      </CardContent>
    </Card>
  );
}

function getRegulationsForJurisdiction(jurisdictionId: string): RegulatoryUpdate[] {
  // Base updates that apply to most jurisdictions
  const baseUpdates: RegulatoryUpdate[] = [
    {
      id: "global-fatf-2024",
      title: "FATF Updates Crypto Travel Rule Implementation Guidelines",
      date: "2024-02-15",
      category: "cryptocurrency",
      severity: "high",
      summary: "The Financial Action Task Force has updated its implementation guidelines for the Crypto Travel Rule, affecting how virtual asset service providers must handle user information during transactions.",
      source: "FATF",
      sourceUrl: "#",
      status: "in-effect",
      affectedAreas: ["KYC Procedures", "Transaction Monitoring", "Cross-border Transfers"],
      actionRequired: "Update transaction monitoring systems to capture and transmit required originator and beneficiary information for crypto transactions."
    }
  ];
  
  // Jurisdiction-specific updates
  const jurisdictionUpdates: Record<string, RegulatoryUpdate[]> = {
    usa: [
      {
        id: "usa-sec-2024-01",
        title: "SEC Adopts Final Rules for Crypto Asset Securities",
        date: "2024-01-20",
        category: "securities",
        severity: "high",
        summary: "The Securities and Exchange Commission has adopted final rules classifying certain crypto assets as securities and establishing registration requirements for platforms trading these assets.",
        fullText: "The Securities and Exchange Commission today announced that it adopted final rules to enhance investor protections for crypto asset securities. The new rules clarify that platforms offering trading of crypto asset securities must register as exchanges or alternative trading systems.\n\nUnder the new rules, crypto asset securities would be defined based on the application of the Howey test and other relevant legal standards. The rules establish a framework for determining whether tokens represent investment contracts, with factors including:\n\n1. The expectation of profit derived from the efforts of others\n2. The presence of a common enterprise\n3. The degree of decentralization in network governance\n4. The primary use case and utility of the token\n\nPlatforms have 180 days from the effective date to come into compliance with the new requirements.",
        source: "U.S. Securities and Exchange Commission",
        sourceUrl: "#",
        status: "approved",
        affectedAreas: ["Token Classification", "Platform Registration", "Securities Offering", "Secondary Trading"],
        actionRequired: "Conduct token classification analysis against the new framework. Register as an ATS if platform facilitates trading of tokens classified as securities."
      },
      {
        id: "usa-fincen-2024-03",
        title: "FinCEN Proposes Enhanced KYC Requirements for Crypto Wallets",
        date: "2024-03-05",
        category: "cryptocurrency",
        severity: "high",
        summary: "Financial Crimes Enforcement Network has proposed new rules requiring stronger KYC procedures for non-custodial wallet transfers, including verification of wallet ownership.",
        source: "FinCEN",
        sourceUrl: "#",
        status: "proposed",
        affectedAreas: ["KYC Procedures", "Wallet Transfers", "Compliance Reporting"],
        actionRequired: "Prepare systems for potential implementation of enhanced wallet verification requirements."
      },
      {
        id: "usa-tax-2023-12",
        title: "IRS Issues Final Guidance on Crypto Tax Reporting",
        date: "2023-12-10",
        category: "taxation",
        severity: "medium",
        summary: "The Internal Revenue Service has issued final guidance on reporting requirements for cryptocurrency transactions, clarifying treatment of various events including staking rewards.",
        source: "Internal Revenue Service",
        sourceUrl: "#",
        status: "in-effect",
        affectedAreas: ["Tax Reporting", "User Notifications", "Record Keeping"],
        actionRequired: "Update tax reporting systems and user notifications to comply with new guidance."
      }
    ],
    eu: [
      {
        id: "eu-mica-2023-11",
        title: "MiCA Regulation Implementation Timeline Announced",
        date: "2023-11-25",
        category: "cryptocurrency",
        severity: "high",
        summary: "The European Commission has published the implementation timeline for the Markets in Crypto-Assets (MiCA) regulation, with phased compliance requirements beginning in 2024.",
        fullText: "The European Commission has published the official implementation timeline for the Markets in Crypto-Assets (MiCA) regulation. The comprehensive regulatory framework will be implemented in phases:\n\nPhase 1 (Q2 2024): Registration requirements for Crypto Asset Service Providers (CASPs)\nPhase 2 (Q4 2024): Stablecoin provisions and reserve requirements\nPhase 3 (Q2 2025): Full compliance with all provisions including consumer protection, market integrity, and environmental impact disclosure\n\nThe regulation establishes a unified EU-wide framework for crypto-assets, replacing the current patchwork of national regulations. Key provisions include:\n\n- Mandatory white paper for crypto-asset issuances\n- Capital requirements for CASPs\n- Market abuse prevention measures\n- Specific requirements for significant stablecoins\n- Environmental impact disclosures for consensus mechanisms",
        source: "European Commission",
        sourceUrl: "#",
        status: "approved",
        affectedAreas: ["Platform Registration", "Stablecoin Operations", "Disclosure Requirements", "Cross-border Services"],
        actionRequired: "Begin registration process as a Crypto Asset Service Provider and prepare compliance documentation for all MiCA requirements."
      },
      {
        id: "eu-dora-2024-01",
        title: "Digital Operational Resilience Act Affects Crypto Platforms",
        date: "2024-01-15",
        category: "data-privacy",
        severity: "medium",
        summary: "The EU's Digital Operational Resilience Act (DORA) has been extended to include crypto-asset service providers, requiring enhanced cybersecurity measures and incident reporting.",
        source: "European Banking Authority",
        sourceUrl: "#",
        status: "in-effect",
        affectedAreas: ["Cybersecurity", "Incident Reporting", "Third-party Risk Management"],
        actionRequired: "Implement enhanced cybersecurity controls and develop incident response procedures compliant with DORA requirements."
      }
    ],
    uk: [
      {
        id: "uk-fca-2024-02",
        title: "FCA Finalizes Crypto Promotion Rules",
        date: "2024-02-20",
        category: "consumer-protection",
        severity: "high",
        summary: "The Financial Conduct Authority has finalized rules for crypto asset promotions, requiring clear risk warnings and banning incentives for new users.",
        source: "Financial Conduct Authority",
        sourceUrl: "#",
        status: "in-effect",
        affectedAreas: ["Marketing Materials", "User Onboarding", "Risk Disclosures"],
        actionRequired: "Update all marketing materials and user acquisition funnels to comply with new promotion requirements."
      }
    ],
    switzerland: [
      {
        id: "ch-finma-2023-09",
        title: "FINMA Updates DLT Trading Facility Guidelines",
        date: "2023-09-30",
        category: "securities",
        severity: "medium",
        summary: "The Swiss Financial Market Supervisory Authority has updated guidelines for DLT trading facilities, clarifying licensing requirements and operational standards.",
        source: "FINMA",
        sourceUrl: "#",
        status: "in-effect",
        affectedAreas: ["Platform Licensing", "Trading Rules", "Settlement Procedures"],
        actionRequired: "Review updated guidelines and ensure compliance with new operational standards."
      }
    ],
    singapore: [
      {
        id: "sg-mas-2024-04",
        title: "MAS Proposes New Framework for Stablecoin Regulation",
        date: "2024-04-01",
        category: "cryptocurrency",
        severity: "high",
        summary: "The Monetary Authority of Singapore has proposed a new regulatory framework for stablecoins, requiring issuers to maintain adequate reserves and obtain specific licenses.",
        source: "Monetary Authority of Singapore",
        sourceUrl: "#",
        status: "proposed",
        affectedAreas: ["Stablecoin Operations", "Reserve Management", "Licensing"],
        actionRequired: "Monitor development of final regulations and prepare compliance strategy for stablecoin operations."
      }
    ],
    japan: [
      {
        id: "jp-fsa-2023-12",
        title: "Japan Amends Payment Services Act for Crypto Assets",
        date: "2023-12-15",
        category: "cryptocurrency",
        severity: "high",
        summary: "The Financial Services Agency has amended the Payment Services Act to enhance oversight of crypto asset exchanges and introduce new custody requirements.",
        source: "Financial Services Agency",
        sourceUrl: "#",
        status: "in-effect",
        affectedAreas: ["Exchange Operations", "Custody Arrangements", "Reporting Requirements"],
        actionRequired: "Update custody procedures and reporting systems to comply with amended legislation."
      }
    ],
    dubai: [
      {
        id: "ae-vara-2024-03",
        title: "VARA Issues Final Regulatory Framework for Virtual Assets",
        date: "2024-03-15",
        category: "cryptocurrency",
        severity: "medium",
        summary: "Dubai's Virtual Assets Regulatory Authority has issued its final regulatory framework, establishing licensing categories and operational requirements for VA providers.",
        source: "Virtual Assets Regulatory Authority",
        sourceUrl: "#",
        status: "in-effect",
        affectedAreas: ["Licensing", "Market Conduct", "Custody Arrangements"],
        actionRequired: "Apply for appropriate VARA license category based on service offerings."
      }
    ],
    australia: [
      {
        id: "au-asic-2024-02",
        title: "ASIC Releases Token Mapping Framework",
        date: "2024-02-10",
        category: "securities",
        severity: "medium",
        summary: "The Australian Securities and Investments Commission has released a token mapping framework to classify various crypto assets within the existing regulatory structure.",
        source: "Australian Securities and Investments Commission",
        sourceUrl: "#",
        status: "in-effect",
        affectedAreas: ["Token Classification", "Product Offerings", "Licensing Requirements"],
        actionRequired: "Review token offerings against the new mapping framework to determine applicable regulatory requirements."
      }
    ],
    canada: [
      {
        id: "ca-csa-2023-10",
        title: "CSA Strengthens Requirements for Crypto Trading Platforms",
        date: "2023-10-20",
        category: "securities",
        severity: "high",
        summary: "The Canadian Securities Administrators have strengthened requirements for crypto trading platforms, including enhanced custody arrangements and capital requirements.",
        source: "Canadian Securities Administrators",
        sourceUrl: "#",
        status: "in-effect",
        affectedAreas: ["Custody Arrangements", "Capital Requirements", "Investor Protection"],
        actionRequired: "Review and update custody arrangements and ensure compliance with enhanced capital requirements."
      }
    ],
    "south-korea": [
      {
        id: "kr-fsc-2024-01",
        title: "South Korea Implements New Virtual Asset User Protection Act",
        date: "2024-01-25",
        category: "consumer-protection",
        severity: "high",
        summary: "The Financial Services Commission has implemented the Virtual Asset User Protection Act, requiring exchanges to segregate customer assets and maintain insurance coverage.",
        source: "Financial Services Commission",
        sourceUrl: "#",
        status: "in-effect",
        affectedAreas: ["Customer Asset Protection", "Insurance Requirements", "Operational Controls"],
        actionRequired: "Implement segregated wallets for customer assets and obtain required insurance coverage."
      }
    ]
  };
  
  // Return base updates plus jurisdiction-specific updates if available
  return [
    ...baseUpdates,
    ...(jurisdictionUpdates[jurisdictionId] || [])
  ];
}