import { useState } from "react";
import DocumentUploader from "@/components/contribute/DocumentUploader";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Contribution } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function Contribute() {
  const [activeTab, setActiveTab] = useState<"upload" | "contributions">("upload");
  const { toast } = useToast();
  
  const { data: contributions, isLoading } = useQuery({
    queryKey: ['/api/contributions'],
    enabled: true
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-success/10 text-success";
      case "pending":
        return "bg-info/10 text-info";
      case "rejected":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-neutral-light text-neutral-darker";
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "verified":
        return "Verified";
      case "pending":
        return "Pending Review";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };
  
  const handleShareContribution = (contribution: Contribution) => {
    // In a real app, this would generate a shareable link
    navigator.clipboard.writeText(
      `Check out my contribution to Spiritual Connect: ${contribution.title}`
    );
    toast({
      title: "Copied to clipboard",
      description: "Link to your contribution has been copied"
    });
  };
  
  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold mb-6">Contribute</h2>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === "upload"
                ? "text-primary border-b-2 border-primary"
                : "text-neutral-darker hover:bg-neutral-light"
            }`}
            onClick={() => setActiveTab("upload")}
          >
            Upload Document
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === "contributions"
                ? "text-primary border-b-2 border-primary"
                : "text-neutral-darker hover:bg-neutral-light"
            }`}
            onClick={() => setActiveTab("contributions")}
          >
            Your Contributions
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === "upload" ? (
            <DocumentUploader />
          ) : (
            <div>
              <h3 className="font-heading text-xl font-semibold mb-4">Your Contributions</h3>
              
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
                </div>
              ) : !contributions || contributions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <span className="material-icons text-neutral-dark text-4xl mb-2">description</span>
                    <h4 className="font-medium mb-2">No Contributions Yet</h4>
                    <p className="text-neutral-darker mb-4">
                      You haven't uploaded any documents or contributions yet
                    </p>
                    <Button onClick={() => setActiveTab("upload")}>
                      Upload a Document
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {contributions.map((contribution: Contribution) => (
                    <div key={contribution.id} className="border border-neutral-DEFAULT rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{contribution.title}</h4>
                        <p className="text-sm text-neutral-darker">
                          Uploaded on {new Date(contribution.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })} • {contribution.religion} {contribution.festival ? `• ${contribution.festival}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium mr-4 ${getStatusColor(contribution.status)}`}>
                          {getStatusText(contribution.status)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <span className="material-icons">more_vert</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShareContribution(contribution)}>
                              <span className="material-icons mr-2 text-sm">share</span>
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <span className="material-icons mr-2 text-sm">edit</span>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <span className="material-icons mr-2 text-sm">delete</span>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
