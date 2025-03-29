import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Artist, CreateProposalFormData } from "@/types";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  artistId: z.coerce.number().positive("Please select an artist"),
  creatorId: z.coerce.number().positive("User ID is required"),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.string().min(1, "Please select a proposal type"),
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options are required"),
  endDate: z.date().refine(date => date > new Date(), "End date must be in the future"),
});

interface ProposalFormProps {
  userId: number;
  onSuccess?: () => void;
}

export function ProposalForm({ userId, onSuccess }: ProposalFormProps) {
  const [options, setOptions] = useState<string[]>(["", ""]);
  const { toast } = useToast();
  
  // Fetch artists for the dropdown
  const { data: artists, isLoading: isLoadingArtists } = useQuery<Artist[]>({
    queryKey: ['/api/artists'],
  });
  
  const form = useForm<CreateProposalFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creatorId: userId,
      title: "",
      description: "",
      type: "",
      options: ["", ""],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
    },
  });
  
  const proposalMutation = useMutation({
    mutationFn: async (data: CreateProposalFormData) => {
      return apiRequest("POST", "/api/proposals", data);
    },
    onSuccess: () => {
      toast({
        title: "Proposal Created",
        description: "Your proposal has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/proposals/active'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to Create Proposal",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
      });
    },
  });
  
  const onSubmit = (data: CreateProposalFormData) => {
    // Filter out any empty options
    const filteredOptions = data.options.filter(option => option.trim() !== "");
    
    if (filteredOptions.length < 2) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "At least 2 non-empty options are required.",
      });
      return;
    }
    
    const formattedData = {
      ...data,
      options: filteredOptions,
    };
    
    proposalMutation.mutate(formattedData);
  };
  
  const addOption = () => {
    setOptions([...options, ""]);
    form.setValue("options", [...form.getValues("options"), ""]);
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    
    const formOptions = [...form.getValues("options")];
    formOptions[index] = value;
    form.setValue("options", formOptions);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="artistId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Artist</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an artist" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingArtists ? (
                    <SelectItem value="loading" disabled>Loading artists...</SelectItem>
                  ) : (
                    artists?.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id.toString()}>
                        {artist.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                The artist this proposal is for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="E.g., New Album Theme Direction" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                A clear, concise title for your proposal.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your proposal in detail..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide detailed information about your proposal.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select proposal type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="creative">Creative Direction</SelectItem>
                  <SelectItem value="business">Business Decision</SelectItem>
                  <SelectItem value="release">Release Strategy</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="treasury">Treasury Use</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Categorize your proposal to help token holders understand its purpose.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Voting Options</FormLabel>
          <FormDescription className="mt-1 mb-2">
            Provide at least two options for token holders to vote on.
          </FormDescription>
          
          {options.map((option, index) => (
            <div key={index} className="flex rounded-md shadow-sm mb-2">
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            className="mt-1 border-primary/60 text-primary hover:text-white hover:bg-primary/20 font-medium"
          >
            + ADD OPTION
          </Button>
          
          {form.formState.errors.options && (
            <p className="text-sm font-medium text-destructive mt-2">
              {form.formState.errors.options.message}
            </p>
          )}
        </div>
        
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voting Duration</FormLabel>
              <Select 
                onValueChange={(value) => {
                  const days = parseInt(value);
                  const endDate = new Date();
                  endDate.setDate(endDate.getDate() + days);
                  field.onChange(endDate);
                }}
                defaultValue="7"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How long token holders will have to vote on this proposal.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-primary text-white border-glow btn-hover-effect font-bold uppercase"
          disabled={proposalMutation.isPending}
        >
          {proposalMutation.isPending ? "SUBMITTING..." : "FORCE YOUR CHANGE"}
        </Button>
      </form>
    </Form>
  );
}
