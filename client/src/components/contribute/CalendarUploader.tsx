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
import { useQueryClient } from "@tanstack/react-query";

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
  festival: z.string().optional(),
  year: z.string().min(4, "Year must be at least 4 digits").max(4, "Year cannot exceed 4 digits")
});

type FormValues = z.infer<typeof formSchema>;

export default function CalendarUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear + i).toString());
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      religion: "",
      festival: "",
      year: currentYear.toString()
    }
  });
  
  const watchedReligion = watch("religion");
  
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
      
      if (!['application/json', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'].includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JSON, CSV, Excel, or TXT file",
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
      
      if (!['application/json', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'].includes(droppedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JSON, CSV, Excel, or TXT file",
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
        status: "pending",
        title: `${data.title} - ${data.year} Calendar`
      });
      
      toast({
        title: "Calendar submitted",
        description: "Your calendar data has been submitted for review",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/contributions'] });
      reset();
      setFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit calendar data",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="font-heading text-xl font-semibold mb-4">Upload Festival Calendar</h3>
          <p className="mb-6">
            Share festival dates and information to help keep our community calendar accurate and up-to-date. Calendars are organized by religion and year.
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
              accept=".json,.csv,.xlsx,.xls,.txt"
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <span className="material-icons text-primary text-4xl mb-2">calendar_month</span>
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
                <span className="material-icons text-neutral-darker text-4xl mb-2">calendar_month</span>
                <h4 className="font-medium mb-2">Drag calendar file here or click to upload</h4>
                <p className="text-sm text-neutral-darker mb-4">Supports JSON, CSV, Excel (Max 10MB)</p>
                <Button type="button">
                  Choose File
                </Button>
              </>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="calendar-title" className="block font-medium mb-2">Calendar Title</label>
            <Input
              id="calendar-title"
              placeholder="e.g., Hindu Festival Calendar"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="calendar-description" className="block font-medium mb-2">Description</label>
            <Textarea
              id="calendar-description"
              rows={4}
              placeholder="Brief description of the calendar contents..."
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              <label htmlFor="year" className="block font-medium mb-2">Calendar Year</label>
              <Select
                onValueChange={(value) => setValue("year", value)}
                defaultValue={currentYear.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="format" className="block font-medium mb-2">Calendar Format</label>
              <Select defaultValue="standard">
                <SelectTrigger>
                  <SelectValue placeholder="Standard Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Format</SelectItem>
                  <SelectItem value="gregorian">Gregorian Calendar</SelectItem>
                  <SelectItem value="lunar">Lunar Calendar</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-darker mt-1">Our system will auto-convert as needed</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h4 className="text-blue-700 font-medium flex items-center gap-2 mb-2">
              <span className="material-icons text-blue-700">info</span>
              Calendar Format Guide
            </h4>
            <p className="text-sm text-blue-700 mb-2">
              For best results, please follow our standard format:
            </p>
            <ul className="text-xs text-blue-700 list-disc pl-5 space-y-1">
              <li>JSON format: array of {'{name, date, description, religion}'} objects</li>
              <li>CSV format: columns for "name,date,description,religion"</li>
              <li>Date format: YYYY-MM-DD (ISO 8601)</li>
            </ul>
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
              {isSubmitting ? "Submitting..." : "Submit Calendar"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}