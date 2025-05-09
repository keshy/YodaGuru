import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RELIGIONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { insertContributionSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const formSchema = insertContributionSchema.pick({
  title: true,
  description: true,
  content: true,
  religion: true,
  festival: true
}).extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().optional(),
  religion: z.string().min(1, "Religion is required"),
  festival: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: festivals } = useQuery({
    queryKey: ['/api/festivals'],
    enabled: true
  });
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      religion: "",
      festival: ""
    }
  });
  
  const watchedReligion = watch("religion");
  
  const filteredFestivals = watchedReligion 
    ? festivals?.filter((festival: any) => 
        festival.religion.toLowerCase() === watchedReligion.toLowerCase()
      )
    : [];
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF, DOC, DOCX, or TXT file",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(droppedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF, DOC, DOCX, or TXT file",
          variant: "destructive"
        });
        return;
      }
      
      setFile(droppedFile);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    try {
      // In a real implementation, we would upload the file to the server
      // For now, we'll just send the form data
      
      await apiRequest("POST", "/api/contributions", {
        ...data,
        status: "pending"
      });
      
      toast({
        title: "Contribution submitted",
        description: "Your contribution has been submitted for review",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/contributions'] });
      reset();
      setFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit contribution",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="font-heading text-xl font-semibold mb-4">Upload Ritual Documentation</h3>
          <p className="mb-6">
            Share ritual procedures, hymns, or religious texts to help our community. Our system will automatically categorize and tag your contribution.
          </p>
          
          <div 
            className={`border-2 border-dashed ${isDragging ? 'border-primary' : 'border-neutral-DEFAULT'} rounded-lg p-8 text-center mb-6 cursor-pointer`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <span className="material-icons text-primary text-4xl mb-2">description</span>
                <h4 className="font-medium mb-2">{file.name}</h4>
                <p className="text-sm text-neutral-darker mb-4">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  Remove File
                </Button>
              </div>
            ) : (
              <>
                <span className="material-icons text-neutral-darker text-4xl mb-2">cloud_upload</span>
                <h4 className="font-medium mb-2">Drag files here or click to upload</h4>
                <p className="text-sm text-neutral-darker mb-4">Supports PDF, DOC, TXT (Max 10MB)</p>
                <Button type="button">
                  Choose File
                </Button>
              </>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="ritual-title" className="block font-medium mb-2">Title</label>
            <Input
              id="ritual-title"
              placeholder="e.g., Ganesh Chaturthi Puja Vidhi"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="ritual-description" className="block font-medium mb-2">Description</label>
            <Textarea
              id="ritual-description"
              rows={4}
              placeholder="Brief description of the ritual..."
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="religion" className="block font-medium mb-2">Religion</label>
              <Select
                onValueChange={(value) => setValue("religion", value)}
                defaultValue={watchedReligion}
              >
                <SelectTrigger className={errors.religion ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select Religion" />
                </SelectTrigger>
                <SelectContent>
                  {RELIGIONS.map((religion) => (
                    <SelectItem key={religion.value} value={religion.value}>
                      {religion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.religion && (
                <p className="text-destructive text-sm mt-1">{errors.religion.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="festival" className="block font-medium mb-2">Associated Festival/Occasion</label>
              <Select
                onValueChange={(value) => setValue("festival", value)}
                defaultValue=""
                disabled={!watchedReligion || filteredFestivals?.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select or Type Festival Name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select Festival</SelectItem>
                  {filteredFestivals?.map((festival: any) => (
                    <SelectItem key={festival.id} value={festival.name}>
                      {festival.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other (Please specify)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="mr-4"
              onClick={() => {
                reset();
                setFile(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Contribution"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
