import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Jurisdiction } from "./JurisdictionSelector";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";

interface ComplianceCheckerProps {
  jurisdiction: Jurisdiction;
  className?: string;
}

type ComplianceCategory = {
  id: string;
  name: string;
  description: string;
  requirements: ComplianceRequirement[];
};

type ComplianceRequirement = {
  id: string;
  description: string;
  required: boolean;
  details: string;
  links?: { text: string; url: string }[];
  status?: "passed" | "failed" | "warning" | "not-checked";
};

export function ComplianceChecker({ jurisdiction, className }: ComplianceCheckerProps) {
  // Generate compliance categories based on jurisdiction
  const [complianceCategories, setComplianceCategories] = useState<ComplianceCategory[]>(
    generateComplianceRequirements(jurisdiction)
  );
  
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [checkInProgress, setCheckInProgress] = useState(false);
  const [checkResults, setCheckResults] = useState<{
    passed: number;
    failed: number;
    warnings: number;
  }>({ passed: 0, failed: 0, warnings: 0 });
  
  const handleRequirementSelect = (requirementId: string) => {
    if (selectedRequirements.includes(requirementId)) {
      setSelectedRequirements(selectedRequirements.filter(id => id !== requirementId));
    } else {
      setSelectedRequirements([...selectedRequirements, requirementId]);
    }
  };
  
  const runComplianceCheck = () => {
    setCheckInProgress(true);
    
    // Simulate check with timeout
    setTimeout(() => {
      // Update categories with random statuses for selected requirements
      const updatedCategories = complianceCategories.map(category => {
        return {
          ...category,
          requirements: category.requirements.map(req => {
            if (!selectedRequirements.includes(req.id)) {
              return { ...req, status: undefined };
            }
            
            // Assign a random status (for demo purposes)
            // In real implementation, this would be based on actual checks
            const randomStatus = Math.random();
            let status: "passed" | "failed" | "warning" = "passed";
            
            if (randomStatus < 0.2) {
              status = "failed";
            } else if (randomStatus < 0.4) {
              status = "warning";
            }
            
            return { ...req, status };
          })
        };
      });
      
      setComplianceCategories(updatedCategories);
      
      // Count results
      let passed = 0;
      let failed = 0;
      let warnings = 0;
      
      updatedCategories.forEach(category => {
        category.requirements.forEach(req => {
          if (req.status === "passed") passed++;
          else if (req.status === "failed") failed++;
          else if (req.status === "warning") warnings++;
        });
      });
      
      setCheckResults({ passed, failed, warnings });
      setCheckInProgress(false);
    }, 2000);
  };
  
  const clearResults = () => {
    const updatedCategories = complianceCategories.map(category => {
      return {
        ...category,
        requirements: category.requirements.map(req => ({ ...req, status: undefined }))
      };
    });
    
    setComplianceCategories(updatedCategories);
    setSelectedRequirements([]);
    setCheckResults({ passed: 0, failed: 0, warnings: 0 });
  };

  const getStatusIcon = (status?: "passed" | "failed" | "warning" | "not-checked") => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="text-green-500 h-5 w-5" />;
      case "failed":
        return <XCircle className="text-red-500 h-5 w-5" />;
      case "warning":
        return <AlertCircle className="text-amber-500 h-5 w-5" />;
      default:
        return <HelpCircle className="text-muted-foreground h-5 w-5" />;
    }
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Compliance Checker</CardTitle>
          <CardDescription>
            Verify compliance with {jurisdiction.name} regulations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Results summary */}
          {(checkResults.passed > 0 || checkResults.failed > 0 || checkResults.warnings > 0) && (
            <div className="mb-6">
              <Alert variant={checkResults.failed > 0 ? "destructive" : undefined}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Compliance Check Results</AlertTitle>
                <AlertDescription>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center">
                      <CheckCircle2 className="text-green-500 h-5 w-5 mr-1" />
                      <span>{checkResults.passed} passed</span>
                    </div>
                    <div className="flex items-center">
                      <AlertCircle className="text-amber-500 h-5 w-5 mr-1" />
                      <span>{checkResults.warnings} warnings</span>
                    </div>
                    <div className="flex items-center">
                      <XCircle className="text-red-500 h-5 w-5 mr-1" />
                      <span>{checkResults.failed} failed</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="space-y-1.5 mb-4">
                <h3 className="font-medium">Select Compliance Categories</h3>
                <p className="text-sm text-muted-foreground">Choose which regulations to check</p>
              </div>
              
              <div className="space-y-4">
                {complianceCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">{category.description}</div>
                    
                    {category.requirements.map((req) => (
                      <div key={req.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={req.id} 
                          checked={selectedRequirements.includes(req.id)}
                          onCheckedChange={() => handleRequirementSelect(req.id)}
                        />
                        <div className="space-y-1">
                          <Label 
                            htmlFor={req.id} 
                            className="text-sm"
                          >
                            {req.description}
                          </Label>
                          {req.status && (
                            <div className="flex items-center text-xs">
                              {getStatusIcon(req.status)}
                              <span className="ml-1">
                                {req.status === "passed" && "Compliant"}
                                {req.status === "failed" && "Non-compliant"}
                                {req.status === "warning" && "Requires attention"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {category !== complianceCategories[complianceCategories.length - 1] && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={runComplianceCheck}
                  disabled={checkInProgress || selectedRequirements.length === 0}
                  className="flex-1"
                >
                  {checkInProgress ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-current animate-spin mr-2"></div>
                      Checking...
                    </>
                  ) : "Run Compliance Check"}
                </Button>
                
                {(checkResults.passed > 0 || checkResults.failed > 0 || checkResults.warnings > 0) && (
                  <Button
                    variant="outline"
                    onClick={clearResults}
                    disabled={checkInProgress}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <div className="space-y-1.5 mb-4">
                <h3 className="font-medium">Compliance Details</h3>
                <p className="text-sm text-muted-foreground">Regulatory requirements for {jurisdiction.name}</p>
              </div>
              
              <Accordion type="single" collapsible className="space-y-4">
                {complianceCategories.map((category) => (
                  <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-2">
                    <AccordionTrigger className="px-2 hover:no-underline">
                      <div className="flex text-left">
                        <span>{category.name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2">
                      <div className="space-y-4">
                        {category.requirements.map((req) => (
                          <div key={req.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              {req.status && getStatusIcon(req.status)}
                              <h4 className="font-medium">{req.description}</h4>
                            </div>
                            <p className="text-sm">{req.details}</p>
                            
                            {req.status === "failed" && (
                              <Alert variant="destructive" className="mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Non-compliant</AlertTitle>
                                <AlertDescription>
                                  This requirement is not met based on the current setup.
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            {req.status === "warning" && (
                              <Alert className="mt-2 border-amber-500">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <AlertTitle className="text-amber-500">Needs Attention</AlertTitle>
                                <AlertDescription>
                                  Additional documentation or verification may be required.
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            {req.links && req.links.length > 0 && (
                              <div className="pt-1">
                                <span className="text-xs font-medium">Relevant Resources:</span>
                                <ul className="text-xs text-primary pt-1 space-y-1">
                                  {req.links.map((link, index) => (
                                    <li key={index}>
                                      <a href={link.url} target="_blank" rel="noreferrer" className="hover:underline">
                                        {link.text}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Disclaimer: This compliance checker provides guidance based on our understanding of regulations in {jurisdiction.name}.
            It is not a substitute for professional legal advice. Regulations may change over time.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function generateComplianceRequirements(jurisdiction: Jurisdiction): ComplianceCategory[] {
  const baseCategories: ComplianceCategory[] = [
    {
      id: "entity-formation",
      name: "Legal Entity Structure",
      description: "Requirements for business structure and registration",
      requirements: [
        {
          id: "entity-registration",
          description: "Business Registration",
          required: true,
          details: `Register a legal entity in ${jurisdiction.name} or ensure your foreign entity is properly registered to do business locally.`,
          links: [
            {
              text: `${jurisdiction.name} Business Registry`,
              url: "#"
            }
          ]
        },
        {
          id: "blockchain-license",
          description: "Blockchain Activity License",
          required: jurisdiction.regulatoryLevel === "high",
          details: `${jurisdiction.regulatoryLevel === "high" ? 
            `Obtain specific licenses for blockchain-related activities in ${jurisdiction.name}.` : 
            `${jurisdiction.name} may not require specific blockchain activity licenses, but general business permits may apply.`}`,
          links: [
            {
              text: "Regulatory Guidelines",
              url: "#"
            }
          ]
        }
      ]
    },
    {
      id: "token-issuance",
      name: "Token Issuance Compliance",
      description: "Requirements for issuing blockchain tokens",
      requirements: [
        {
          id: "token-classification",
          description: "Token Classification Analysis",
          required: true,
          details: `Conduct a legal analysis to determine if your artist tokens would be classified as securities, utility tokens, or another regulated category in ${jurisdiction.name}.`,
          links: [
            {
              text: "Token Classification Framework",
              url: "#"
            }
          ]
        },
        {
          id: "prospectus-requirements",
          description: "Disclosure Documents",
          required: jurisdiction.regulatoryLevel !== "low",
          details: jurisdiction.id === "usa" ? 
            "Prepare offering documents compliant with SEC requirements, or ensure your token offering qualifies for an exemption like Reg D, Reg S, or Reg A+." : 
            `Prepare appropriate disclosure documents for token purchasers in compliance with ${jurisdiction.name} requirements.`,
          links: [
            {
              text: "Disclosure Requirements Guide",
              url: "#"
            }
          ]
        }
      ]
    },
    {
      id: "aml-kyc",
      name: "AML & KYC Procedures",
      description: "Anti-Money Laundering and Know Your Customer requirements",
      requirements: [
        {
          id: "kyc-procedures",
          description: "KYC Implementation",
          required: jurisdiction.requiresKYC,
          details: `Implement Know Your Customer procedures to verify the identity of token purchasers in compliance with ${jurisdiction.name} regulations.`,
          links: [
            {
              text: "KYC Best Practices",
              url: "#"
            }
          ]
        },
        {
          id: "aml-program",
          description: "AML Compliance Program",
          required: jurisdiction.regulatoryLevel !== "low",
          details: `Establish a comprehensive Anti-Money Laundering program including risk assessment, transaction monitoring, and suspicious activity reporting in accordance with ${jurisdiction.name} laws.`,
          links: [
            {
              text: "AML Program Guidelines",
              url: "#"
            }
          ]
        }
      ]
    },
    {
      id: "data-privacy",
      name: "Data Privacy & Protection",
      description: "Requirements for handling user data",
      requirements: [
        {
          id: "privacy-policy",
          description: "Privacy Policy Compliance",
          required: true,
          details: jurisdiction.id === "eu" ? 
            "Implement a GDPR-compliant privacy policy covering data collection, processing, storage, and user rights." : 
            `Maintain a privacy policy that complies with ${jurisdiction.name} data protection laws.`,
          links: [
            {
              text: "Privacy Policy Template",
              url: "#"
            }
          ]
        },
        {
          id: "data-subject-rights",
          description: "Data Subject Rights",
          required: jurisdiction.id === "eu" || jurisdiction.id === "uk",
          details: "Implement processes to handle data subject requests including right to access, right to be forgotten, and data portability.",
          links: [
            {
              text: "Data Subject Rights Guide",
              url: "#"
            }
          ]
        }
      ]
    },
    {
      id: "consumer-protection",
      name: "Consumer Protection",
      description: "Requirements for protecting token buyers",
      requirements: [
        {
          id: "clear-disclosures",
          description: "Risk Disclosures",
          required: true,
          details: "Provide clear disclosures about the risks associated with purchasing and holding artist tokens.",
          links: [
            {
              text: "Risk Disclosure Examples",
              url: "#"
            }
          ]
        },
        {
          id: "cancellation-rights",
          description: "Cooling-off Period",
          required: jurisdiction.id === "eu" || jurisdiction.id === "uk",
          details: "Provide token purchasers with a cooling-off period during which they can cancel their purchase without penalty.",
          links: [
            {
              text: "Consumer Rights Guide",
              url: "#"
            }
          ]
        }
      ]
    }
  ];

  // Add jurisdiction-specific categories
  if (jurisdiction.id === "usa") {
    baseCategories.push({
      id: "us-specific",
      name: "U.S. Specific Requirements",
      description: "Federal and state-specific compliance needs",
      requirements: [
        {
          id: "state-registration",
          description: "State Money Transmitter Licenses",
          required: true,
          details: "Determine if your token platform requires money transmitter licenses in specific states where you operate.",
          links: [
            {
              text: "State Licensing Requirements",
              url: "#"
            }
          ]
        },
        {
          id: "accredited-investors",
          description: "Accredited Investor Verification",
          required: true,
          details: "If relying on Regulation D exemptions, implement procedures to verify accredited investor status of token purchasers.",
          links: [
            {
              text: "SEC Accredited Investor Guide",
              url: "#"
            }
          ]
        }
      ]
    });
  }

  if (jurisdiction.id === "eu") {
    baseCategories.push({
      id: "eu-specific",
      name: "EU Specific Requirements",
      description: "MiCA and EU-wide compliance needs",
      requirements: [
        {
          id: "mica-compliance",
          description: "MiCA Regulation Compliance",
          required: true,
          details: "Ensure compliance with Markets in Crypto-Assets (MiCA) regulation requirements for token offerings and platform operation.",
          links: [
            {
              text: "MiCA Compliance Framework",
              url: "#"
            }
          ]
        },
        {
          id: "cross-border-provisions",
          description: "Cross-Border Service Provision",
          required: true,
          details: "Register with relevant authorities for providing crypto-asset services across EU member states.",
          links: [
            {
              text: "Cross-Border Registration Guide",
              url: "#"
            }
          ]
        }
      ]
    });
  }
  
  return baseCategories;
}