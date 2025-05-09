import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPreferencesSchema } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { RELIGIONS, SECONDARY_INTERESTS, LANGUAGES, REMINDER_DAYS } from "@/lib/constants";

// Extend user preferences schema for form validation
const userPreferencesSchema = insertPreferencesSchema.pick({
  primaryReligion: true,
  secondaryInterests: true,
  languages: true,
  festivalReminderDays: true,
  notifyFestivals: true,
  notifyDailyContent: true,
  notifyNewContent: true,
  notifyCommunityUpdates: true,
  notifyEmails: true
});

const userProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type UserPreferencesFormValues = z.infer<typeof userPreferencesSchema>;
type UserProfileFormValues = z.infer<typeof userProfileSchema>;

export default function Preferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  
  // Load user preferences
  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
    queryKey: ['/api/preferences'],
    enabled: !!user
  });
  
  // Profile form
  const { 
    register: profileRegister, 
    handleSubmit: handleProfileSubmit, 
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    setValue: setProfileValue,
    reset: resetProfile
  } = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || ""
    }
  });
  
  // Preferences form
  const { 
    handleSubmit: handlePreferencesSubmit, 
    formState: { isSubmitting: isPreferencesSubmitting },
    setValue: setPreferencesValue,
    reset: resetPreferences
  } = useForm<UserPreferencesFormValues>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: {
      primaryReligion: "hinduism",
      secondaryInterests: [],
      languages: ["english"],
      festivalReminderDays: 3,
      notifyFestivals: true,
      notifyDailyContent: true,
      notifyNewContent: true,
      notifyCommunityUpdates: false,
      notifyEmails: true
    }
  });
  
  // Update forms when data loads
  useEffect(() => {
    if (user) {
      setProfileValue("firstName", user.firstName || "");
      setProfileValue("lastName", user.lastName || "");
    }
  }, [user, setProfileValue]);
  
  useEffect(() => {
    if (preferences) {
      setPreferencesValue("primaryReligion", preferences.primaryReligion);
      setPreferencesValue("secondaryInterests", preferences.secondaryInterests || []);
      setPreferencesValue("languages", preferences.languages || ["english"]);
      setPreferencesValue("festivalReminderDays", preferences.festivalReminderDays);
      setPreferencesValue("notifyFestivals", preferences.notifyFestivals);
      setPreferencesValue("notifyDailyContent", preferences.notifyDailyContent);
      setPreferencesValue("notifyNewContent", preferences.notifyNewContent);
      setPreferencesValue("notifyCommunityUpdates", preferences.notifyCommunityUpdates);
      setPreferencesValue("notifyEmails", preferences.notifyEmails);
      
      setSelectedInterests(preferences.secondaryInterests || []);
      setSelectedLanguages(preferences.languages || ["english"]);
    }
  }, [preferences, setPreferencesValue]);
  
  const onProfileSubmit = async (data: UserProfileFormValues) => {
    try {
      await apiRequest("PUT", "/api/user", data);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated"
      });
      
      queryClient.invalidateQueries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };
  
  const onPreferencesSubmit = async (data: UserPreferencesFormValues) => {
    try {
      // Ensure arrays are passed correctly
      const formData = {
        ...data,
        secondaryInterests: selectedInterests,
        languages: selectedLanguages
      };
      
      await apiRequest("PUT", "/api/preferences", formData);
      
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been successfully updated"
      });
      
      queryClient.invalidateQueries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      });
    }
  };
  
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };
  
  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };
  
  if (!user) return null;
  
  if (isLoadingPreferences) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-darker">Loading preferences...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <h2 className="font-heading text-2xl font-semibold">Preferences</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2">
          <h3 className="font-heading text-xl font-semibold mb-6">Profile</h3>
          
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <div className="flex items-center mb-8">
              <img 
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}`}
                alt="User profile" 
                className="w-20 h-20 rounded-full object-cover border"
              />
              <div className="ml-4">
                <Button
                  type="button"
                  className="px-4 py-2 text-sm"
                >
                  Change Photo
                </Button>
                <p className="text-sm text-neutral-darker mt-2">JPG, GIF or PNG. Max size 800K</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="first-name" className="block font-medium mb-2">First Name</label>
                <Input
                  id="first-name"
                  {...profileRegister("firstName")}
                  className={profileErrors.firstName ? "border-destructive" : ""}
                />
                {profileErrors.firstName && (
                  <p className="text-destructive text-sm mt-1">{profileErrors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="last-name" className="block font-medium mb-2">Last Name</label>
                <Input
                  id="last-name"
                  {...profileRegister("lastName")}
                  className={profileErrors.lastName ? "border-destructive" : ""}
                />
                {profileErrors.lastName && (
                  <p className="text-destructive text-sm mt-1">{profileErrors.lastName.message}</p>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block font-medium mb-2">Email Address</label>
              <Input
                type="email"
                id="email"
                value={user.email}
                className="bg-neutral-light border border-neutral-DEFAULT text-neutral-darker"
                disabled
              />
              <p className="text-sm text-neutral-darker mt-1">Connected via Google Sign-In</p>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isProfileSubmitting}
              >
                {isProfileSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
        
        {/* Spiritual Settings */}
        <form onSubmit={handlePreferencesSubmit(onPreferencesSubmit)} className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-heading text-xl font-semibold mb-6">Spiritual Preferences</h3>
              
              <div className="mb-6">
                <label htmlFor="primary-religion" className="block font-medium mb-2">Primary Religion</label>
                <Select 
                  defaultValue={preferences?.primaryReligion || "hinduism"}
                  onValueChange={(value) => setPreferencesValue("primaryReligion", value)}
                >
                  <SelectTrigger id="primary-religion">
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
              </div>
              
              <div className="mb-6">
                <label className="block font-medium mb-3">Secondary Interests</label>
                <div className="space-y-2">
                  {SECONDARY_INTERESTS.map((interest) => (
                    <label key={interest.value} className="flex items-center">
                      <Checkbox
                        id={`interest-${interest.value}`}
                        checked={selectedInterests.includes(interest.value)}
                        onCheckedChange={() => toggleInterest(interest.value)}
                      />
                      <span className="ml-2">{interest.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block font-medium mb-3">Language Preferences</label>
                <div className="space-y-2">
                  {LANGUAGES.slice(0, 6).map((language) => (
                    <label key={language.value} className="flex items-center">
                      <Checkbox
                        id={`language-${language.value}`}
                        checked={selectedLanguages.includes(language.value)}
                        onCheckedChange={() => toggleLanguage(language.value)}
                      />
                      <span className="ml-2">{language.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isPreferencesSubmitting}
                >
                  {isPreferencesSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
        
        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-md p-6 md:col-span-3">
          <h3 className="font-heading text-xl font-semibold mb-6">Notification Preferences</h3>
          
          <form onSubmit={handlePreferencesSubmit(onPreferencesSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Festival Notifications</h4>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 border border-neutral-DEFAULT rounded-lg">
                    <div>
                      <span className="font-medium">Festival Reminders</span>
                      <p className="text-sm text-neutral-darker">Get notified about upcoming festivals</p>
                    </div>
                    <div className="relative toggle-switch">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        id="festival-toggle"
                        checked={preferences?.notifyFestivals}
                        onChange={(e) => setPreferencesValue("notifyFestivals", e.target.checked)}
                      />
                      <div className="block bg-neutral-DEFAULT w-14 h-8 rounded-full"></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                        preferences?.notifyFestivals ? 'translate-x-6 bg-primary' : ''
                      }`}></div>
                    </div>
                  </label>
                  
                  <div className="p-3 border border-neutral-DEFAULT rounded-lg">
                    <label className="flex items-center justify-between mb-3">
                      <span className="font-medium">Reminder Timing</span>
                      <Select 
                        defaultValue={preferences?.festivalReminderDays?.toString() || "3"}
                        onValueChange={(value) => setPreferencesValue("festivalReminderDays", parseInt(value))}
                        disabled={!preferences?.notifyFestivals}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          {REMINDER_DAYS.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </label>
                    <p className="text-sm text-neutral-darker">How far in advance would you like to be notified?</p>
                  </div>
                  
                  <label className="flex items-center justify-between p-3 border border-neutral-DEFAULT rounded-lg">
                    <div>
                      <span className="font-medium">Daily Content</span>
                      <p className="text-sm text-neutral-darker">Receive daily spiritual content</p>
                    </div>
                    <div className="relative toggle-switch">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        id="daily-toggle"
                        checked={preferences?.notifyDailyContent}
                        onChange={(e) => setPreferencesValue("notifyDailyContent", e.target.checked)}
                      />
                      <div className="block bg-neutral-DEFAULT w-14 h-8 rounded-full"></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                        preferences?.notifyDailyContent ? 'translate-x-6 bg-primary' : ''
                      }`}></div>
                    </div>
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">App Notifications</h4>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 border border-neutral-DEFAULT rounded-lg">
                    <div>
                      <span className="font-medium">New Content</span>
                      <p className="text-sm text-neutral-darker">Notify when new content is available</p>
                    </div>
                    <div className="relative toggle-switch">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        id="content-toggle"
                        checked={preferences?.notifyNewContent}
                        onChange={(e) => setPreferencesValue("notifyNewContent", e.target.checked)}
                      />
                      <div className="block bg-neutral-DEFAULT w-14 h-8 rounded-full"></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                        preferences?.notifyNewContent ? 'translate-x-6 bg-primary' : ''
                      }`}></div>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between p-3 border border-neutral-DEFAULT rounded-lg">
                    <div>
                      <span className="font-medium">Community Updates</span>
                      <p className="text-sm text-neutral-darker">Get notified about community contributions</p>
                    </div>
                    <div className="relative toggle-switch">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        id="community-toggle"
                        checked={preferences?.notifyCommunityUpdates}
                        onChange={(e) => setPreferencesValue("notifyCommunityUpdates", e.target.checked)}
                      />
                      <div className="block bg-neutral-DEFAULT w-14 h-8 rounded-full"></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                        preferences?.notifyCommunityUpdates ? 'translate-x-6 bg-primary' : ''
                      }`}></div>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between p-3 border border-neutral-DEFAULT rounded-lg">
                    <div>
                      <span className="font-medium">Email Notifications</span>
                      <p className="text-sm text-neutral-darker">Receive email updates</p>
                    </div>
                    <div className="relative toggle-switch">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        id="email-toggle"
                        checked={preferences?.notifyEmails}
                        onChange={(e) => setPreferencesValue("notifyEmails", e.target.checked)}
                      />
                      <div className="block bg-neutral-DEFAULT w-14 h-8 rounded-full"></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                        preferences?.notifyEmails ? 'translate-x-6 bg-primary' : ''
                      }`}></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button
                type="button"
                variant="outline"
                className="mr-4"
                onClick={() => resetPreferences()}
              >
                Reset to Default
              </Button>
              <Button
                type="submit"
                disabled={isPreferencesSubmitting}
              >
                {isPreferencesSubmitting ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
