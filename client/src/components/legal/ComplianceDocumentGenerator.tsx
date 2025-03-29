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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Jurisdiction } from "./JurisdictionSelector";

interface ComplianceDocumentGeneratorProps {
  jurisdiction: Jurisdiction;
  artistName?: string;
  companyName?: string;
  tokenName?: string;
  tokenSymbol?: string;
}

type DocumentType = "termsOfService" | "privacyPolicy" | "amlPolicy" | "tokenDisclaimer";

interface DocumentStatus {
  id: DocumentType;
  name: string;
  description: string;
  required: boolean;
  generatedContent?: string;
  isDownloading?: boolean;
  downloadProgress?: number;
}

export function ComplianceDocumentGenerator({
  jurisdiction,
  artistName = "",
  companyName = "",
  tokenName = "",
  tokenSymbol = ""
}: ComplianceDocumentGeneratorProps) {
  const [companyInfo, setCompanyInfo] = useState({
    artistName: artistName,
    companyName: companyName || `${artistName} DAO`,
    companyAddress: "",
    companyEmail: "",
    companyWebsite: "",
    tokenName: tokenName,
    tokenSymbol: tokenSymbol,
  });

  const [documents, setDocuments] = useState<DocumentStatus[]>([
    {
      id: "termsOfService",
      name: "Terms of Service",
      description: "Legal agreement between your platform and users",
      required: true,
    },
    {
      id: "privacyPolicy",
      name: "Privacy Policy",
      description: "How user data is collected, used, and protected",
      required: true,
    },
    {
      id: "amlPolicy",
      name: "AML/KYC Policy",
      description: "Anti-money laundering and Know Your Customer procedures",
      required: jurisdiction.requiresKYC,
    },
    {
      id: "tokenDisclaimer",
      name: "Token Sale Disclaimer",
      description: "Legal disclaimers for token sales specific to jurisdiction",
      required: true,
    },
  ]);

  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
  };

  const generateDocument = (documentType: DocumentType) => {
    setSelectedDocumentType(documentType);
    setIsGenerating(true);
    
    // Simulate document generation
    setTimeout(() => {
      const updatedDocuments = documents.map(doc => {
        if (doc.id === documentType) {
          return {
            ...doc,
            generatedContent: generatePlaceholderText(documentType, jurisdiction, companyInfo),
          };
        }
        return doc;
      });
      
      setDocuments(updatedDocuments);
      setIsGenerating(false);
    }, 1500);
  };

  const downloadDocument = (documentType: DocumentType) => {
    // Find the document
    const document = documents.find(doc => doc.id === documentType);
    if (!document?.generatedContent) return;

    // Update document status to downloading
    setDocuments(documents.map(doc => {
      if (doc.id === documentType) {
        return { ...doc, isDownloading: true, downloadProgress: 0 };
      }
      return doc;
    }));

    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentType) {
          return { ...doc, downloadProgress: progress };
        }
        return doc;
      }));

      if (progress >= 100) {
        clearInterval(interval);
        
        // Create the download
        const blob = new Blob([document.generatedContent || ''], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${documentType}-${jurisdiction.countryCode}.txt`;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Reset download status
        setTimeout(() => {
          setDocuments(prev => prev.map(doc => {
            if (doc.id === documentType) {
              return { ...doc, isDownloading: false, downloadProgress: undefined };
            }
            return doc;
          }));
        }, 500);
      }
    }, 200);
  };

  const selectedDocument = selectedDocumentType ? documents.find(doc => doc.id === selectedDocumentType) : null;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Document Generator</CardTitle>
          <CardDescription>
            Create legal documents tailored for {jurisdiction.name} regulations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="artistName">Artist/Creator Name</Label>
                <Input 
                  id="artistName"
                  name="artistName"
                  value={companyInfo.artistName}
                  onChange={handleInputChange}
                  placeholder="Jane Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName">Legal Entity Name</Label>
                <Input 
                  id="companyName"
                  name="companyName"
                  value={companyInfo.companyName}
                  onChange={handleInputChange}
                  placeholder="Jane Doe DAO"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Registered Address</Label>
                <Input 
                  id="companyAddress"
                  name="companyAddress"
                  value={companyInfo.companyAddress}
                  onChange={handleInputChange}
                  placeholder="123 Blockchain Street, Web3 City"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Contact Email</Label>
                <Input 
                  id="companyEmail"
                  name="companyEmail"
                  value={companyInfo.companyEmail}
                  onChange={handleInputChange}
                  placeholder="contact@janedoe.dao"
                  type="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tokenName">Token Name</Label>
                <Input 
                  id="tokenName"
                  name="tokenName"
                  value={companyInfo.tokenName}
                  onChange={handleInputChange}
                  placeholder="Jane Doe Token"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tokenSymbol">Token Symbol</Label>
                <Input 
                  id="tokenSymbol"
                  name="tokenSymbol"
                  value={companyInfo.tokenSymbol}
                  onChange={handleInputChange}
                  placeholder="JDT"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Documents</CardTitle>
              <CardDescription>
                Based on {jurisdiction.name} regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map(document => (
                  <div key={document.id} className="flex items-start space-x-3">
                    <Checkbox id={document.id} checked={document.required} disabled />
                    <div className="space-y-1">
                      <Label 
                        htmlFor={document.id} 
                        className={`font-medium ${document.required ? '' : 'text-muted-foreground'}`}
                      >
                        {document.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">{document.description}</p>
                      
                      {document.generatedContent ? (
                        <div className="pt-1 flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setSelectedDocumentType(document.id as DocumentType)}
                            className="h-7 px-2"
                          >
                            Preview
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => downloadDocument(document.id as DocumentType)}
                            className="h-7 px-2"
                            disabled={document.isDownloading}
                          >
                            {document.isDownloading ? (
                              <>
                                <div className="w-3 h-3 rounded-full border-2 border-t-transparent border-primary animate-spin mr-1"></div>
                                {document.downloadProgress}%
                              </>
                            ) : "Download"}
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => generateDocument(document.id as DocumentType)}
                          className="mt-1 h-7"
                          disabled={isGenerating && selectedDocumentType === document.id}
                        >
                          {isGenerating && selectedDocumentType === document.id ? (
                            <>
                              <div className="w-3 h-3 rounded-full border-2 border-t-transparent border-primary animate-spin mr-1"></div>
                              Generating...
                            </>
                          ) : "Generate"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {selectedDocument && selectedDocument.generatedContent ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedDocument.name}</CardTitle>
                  <CardDescription>Generated for {jurisdiction.name}</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => downloadDocument(selectedDocumentType as DocumentType)}
                  disabled={selectedDocument.isDownloading}
                >
                  {selectedDocument.isDownloading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-primary animate-spin mr-2"></div>
                      {selectedDocument.downloadProgress}%
                    </>
                  ) : "Download"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-md p-4 max-h-[500px] overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {selectedDocument.generatedContent}
                  </pre>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <p>
                  This document is a template and should be reviewed by legal counsel before use.
                  Regulations in {jurisdiction.name} may change over time.
                </p>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-medium mb-2">Document Preview</h3>
                <p className="text-muted-foreground">
                  Generate a document from the list to preview it here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function generatePlaceholderText(
  documentType: DocumentType, 
  jurisdiction: Jurisdiction, 
  companyInfo: any
): string {
  const { 
    artistName, 
    companyName, 
    companyAddress, 
    companyEmail,
    tokenName,
    tokenSymbol
  } = companyInfo;
  
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  switch (documentType) {
    case "termsOfService":
      return `TERMS OF SERVICE FOR ${companyName.toUpperCase()} - ${tokenName.toUpperCase()} (${tokenSymbol})
Last Updated: ${formattedDate}

IMPORTANT NOTICE: These Terms of Service have been specifically designed for operations in ${jurisdiction.name} and comply with local regulatory requirements.

1. INTRODUCTION

${companyName} ("we," "us," or "our") provides a blockchain-based platform that enables fans to own and govern aspects of ${artistName}'s creative direction through tokenized ownership (the "${tokenName}" or "${tokenSymbol}").

By accessing or using our Services, you agree to be bound by these Terms of Service. Please read them carefully.

2. ELIGIBILITY

To use our Services, you must:
- Be at least 18 years old
- Have the legal capacity to enter into these Terms
- Comply with all applicable laws in ${jurisdiction.name}
${jurisdiction.requiresKYC ? '- Complete our Know Your Customer (KYC) verification process\n- Comply with Anti-Money Laundering (AML) requirements' : ''}

3. TOKEN OWNERSHIP

${tokenName} (${tokenSymbol}) tokens represent a limited right to participate in governance decisions related to ${artistName}'s creative direction, as further detailed in our governance documentation.

${jurisdiction.restrictedFeatures.map(feature => `IMPORTANT: ${feature} is restricted or prohibited in ${jurisdiction.name}.\n`).join('')}

4. GOVERNANCE RIGHTS

Token holders may:
- Vote on proposals related to ${artistName}'s creative direction
- Submit proposals according to governance rules
- Participate in community discussions

${jurisdiction.id === 'usa' ? 'IMPORTANT FOR U.S. USERS: These governance rights do not constitute voting rights in a legal entity or corporation. Tokens are not shares, stocks, or securities.' : ''}

5. DISCLAIMERS AND LIMITATIONS

- ${tokenName} ARE NOT INVESTMENTS OR SECURITIES
- NO GUARANTEED RETURNS OR PROFITS
- BLOCKCHAIN TECHNOLOGY RISKS APPLY

In accordance with ${jurisdiction.name} regulations, we explicitly state that:
${jurisdiction.tokenSaleRestrictions}

/* Document continues with legal terms customized for the jurisdiction */`;

    case "privacyPolicy":
      return `PRIVACY POLICY FOR ${companyName.toUpperCase()}
Last Updated: ${formattedDate}

This Privacy Policy has been specifically designed to comply with privacy regulations in ${jurisdiction.name}.

1. INTRODUCTION

At ${companyName}, we respect your privacy and are committed to protecting your personal data. This Privacy Policy will inform you about how we look after your personal data when you visit our platform and tell you about your privacy rights according to the laws of ${jurisdiction.name}.

2. DATA WE COLLECT

We may collect, use, store, and transfer different kinds of personal data about you:

- Identity Data: name, username, blockchain wallet addresses
- Contact Data: email address, physical address
- Technical Data: IP address, browser information, device information
- Transaction Data: details about token purchases and transfers
${jurisdiction.requiresKYC ? '- KYC Data: government-issued identification, proof of address, and other information required for regulatory compliance\n' : ''}

3. HOW WE USE YOUR DATA

We use your personal data only for legitimate purposes, including:
- Providing access to our platform
- Processing token purchases and transfers
- Communicating with you about platform updates
- Complying with legal obligations in ${jurisdiction.name}
${jurisdiction.id === 'eu' ? '- In accordance with GDPR, we process your data based on: consent, contractual necessity, legal obligation, and legitimate interests\n' : ''}

4. DATA RETENTION

We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements in ${jurisdiction.name}.

5. YOUR RIGHTS

Depending on your location and ${jurisdiction.name} laws, you may have the following rights:
${jurisdiction.id === 'eu' || jurisdiction.id === 'uk' ? '- Right to access, correct, update or request deletion of personal information\n- Right to object to processing and restrict processing of personal information\n- Right to data portability\n- Right to withdraw consent\n' : '- Right to access your personal information\n- Right to request deletion of personal information subject to legal requirements\n'}

/* Privacy Policy continues with terms specific to the jurisdiction */`;

    case "amlPolicy":
      return `ANTI-MONEY LAUNDERING (AML) AND KNOW YOUR CUSTOMER (KYC) POLICY
FOR ${companyName.toUpperCase()}
Last Updated: ${formattedDate}

This AML/KYC Policy has been designed to comply with the regulatory requirements of ${jurisdiction.name}.

1. INTRODUCTION

${companyName} is committed to preventing money laundering, terrorist financing, and other illicit activities. This policy outlines our procedures for identifying, verifying, and monitoring users to ensure compliance with ${jurisdiction.name} regulations.

2. KYC REQUIREMENTS

All users must complete our KYC process before purchasing ${tokenName} (${tokenSymbol}) tokens. The process includes:

- Verification of identity through government-issued identification
- Proof of address verification
- Source of funds declaration for purchases above threshold amounts
${jurisdiction.id === 'usa' ? '- Additional verification for accredited investor status when required\n' : ''}

3. RISK-BASED APPROACH

We implement a risk-based approach to customer due diligence, classifying users as:
- Low-risk: Basic KYC requirements
- Medium-risk: Enhanced documentation and monitoring
- High-risk: Comprehensive due diligence and ongoing monitoring

4. TRANSACTION MONITORING

We monitor transactions for suspicious activities, including:
- Unusual transaction patterns
- Transactions above certain thresholds
- Transactions involving high-risk jurisdictions
- Multiple transactions in short time periods

5. REGULATORY COMPLIANCE

We comply with all applicable laws and regulations in ${jurisdiction.name}, including:
${jurisdiction.id === 'usa' ? '- Bank Secrecy Act (BSA)\n- USA PATRIOT Act\n- FinCEN guidance on virtual currencies\n' : 
  jurisdiction.id === 'eu' ? '- 5th Anti-Money Laundering Directive (AMLD5)\n- MiCA regulations for crypto-assets\n' : 
  jurisdiction.id === 'uk' ? '- Money Laundering, Terrorist Financing and Transfer of Funds Regulations 2017\n- FCA guidance on cryptoassets\n' : 
  '- Local anti-money laundering regulations\n- Financial intelligence unit requirements\n'}

/* AML/KYC Policy continues with specific regulatory requirements */`;

    case "tokenDisclaimer":
      return `TOKEN SALE DISCLAIMER FOR ${tokenName.toUpperCase()} (${tokenSymbol})
Last Updated: ${formattedDate}

This Token Sale Disclaimer has been specifically designed for token sales in ${jurisdiction.name}.

1. LEGAL STATUS OF TOKENS

${tokenName} (${tokenSymbol}) tokens are governance tokens designed to allow fans to participate in certain decisions related to ${artistName}'s creative direction. These tokens:

- DO NOT represent securities, investments, or financial instruments
- DO NOT guarantee any returns, dividends, or profits
- DO NOT represent ownership in ${companyName} or any legal entity
- DO represent a limited right to participate in the platform's governance system

2. REGULATORY COMPLIANCE

This token sale is being conducted in compliance with the laws of ${jurisdiction.name}, specifically:

${jurisdiction.id === 'usa' ? 
  '- Tokens are only offered to verified accredited investors under Regulation D exemption\n- Tokens are subject to transfer restrictions\n- This offering has not been registered with the Securities and Exchange Commission\n' : 
  jurisdiction.id === 'eu' ? 
  '- Complies with Markets in Crypto-Assets (MiCA) regulation\n- Adheres to relevant EU member state requirements\n- White paper has been prepared in accordance with EU regulations\n' : 
  jurisdiction.id === 'singapore' ? 
  '- Complies with Monetary Authority of Singapore guidelines\n- Tokens do not constitute capital markets products under the Securities and Futures Act\n' : 
  '- Complies with local securities and token offering regulations\n'}

3. RISKS

Purchasing ${tokenName} tokens involves significant risks, including but not limited to:

- Regulatory uncertainty and changing legal landscape in ${jurisdiction.name}
- Blockchain technology risks including smart contract vulnerabilities
- Market volatility and potential lack of liquidity
- Project failure risks

4. RESTRICTIONS

${jurisdiction.tokenSaleRestrictions}

5. TAX CONSIDERATIONS

Purchasers are solely responsible for determining what, if any, taxes apply to their ${tokenName} token transactions. ${companyName} is not responsible for determining the taxes that apply to token transactions in ${jurisdiction.name} or elsewhere.

/* Token Disclaimer continues with additional legal information */`;

    default:
      return "Document content could not be generated.";
  }
}