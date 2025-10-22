"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User as UserIcon, 
  Building2,
  Shield
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ProfileSettingsProps {
  user: User;
  profile: any | null;
}

export function ProfileSettings({ user, profile: initialProfile }: ProfileSettingsProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    company_name: profile?.company_name || "",
    website: profile?.website || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    country: profile?.country || "",
  });
  const [kybFiles, setKybFiles] = useState<{
    incorporation: File | null;
    license: File | null;
  }>({
    incorporation: null,
    license: null,
  });

  const supabase = createClient();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateProfile = async () => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(formData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'incorporation' | 'license') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, JPG, and PNG files are allowed");
        return;
      }

      setKybFiles(prev => ({ ...prev, [type]: file }));
      toast.success(`${type === 'incorporation' ? 'Certificate' : 'License'} selected: ${file.name}`);
    }
  };

  const handleKYBSubmit = async () => {
    if (!kybFiles.incorporation || !kybFiles.license) {
      toast.error("Please upload both required documents");
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('incorporation', kybFiles.incorporation);
      formData.append('license', kybFiles.license);

      const response = await fetch('/api/kyb/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload documents');
      }

      const result = await response.json();
      toast.success("Documents uploaded successfully! Verification in progress.");
      
      // Refresh profile to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error uploading KYB documents:', error);
      toast.error(error instanceof Error ? error.message : "Failed to upload documents");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending Verification</Badge>;
      case "rejected":
        return <Badge variant="destructive">Verification Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Verified</Badge>;
    }
  };

  const getBusinessTypeDisplay = (type?: string) => {
    return type === "sender" ? "Sender" : "Provider";
  };

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-background to-muted/20 rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 pt-6 px-6 bg-muted/30 border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Display Name</Label>
              <div className="px-4 py-3 bg-muted/40 rounded-xl border border-border/30">
                <p className="text-base font-medium">
                  {user.user_metadata?.display_name || "Not set"}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
              <div className="px-4 py-3 bg-muted/40 rounded-xl border border-border/30">
                <p className="text-base font-medium">{user.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business Type</Label>
              <div className="px-4 py-3 bg-muted/40 rounded-xl border border-border/30">
                <p className="text-base font-medium">
                  {getBusinessTypeDisplay(profile?.business_type)}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verification Status</Label>
              <div className="px-4 py-3 bg-muted/40 rounded-xl border border-border/30 flex items-center">
                {getStatusBadge(profile?.verification_status)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-background to-muted/20 rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 pt-6 px-6 bg-muted/30 border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange("company_name", e.target.value)}
                placeholder="Enter your company name"
                className="h-12 px-4 text-base rounded-xl bg-muted/40 border border-border/30 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://example.com"
                className="h-12 px-4 text-base rounded-xl bg-muted/40 border border-border/30 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="h-12 px-4 text-base rounded-xl bg-muted/40 border border-border/30 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => handleInputChange("country", value)}
              >
                <SelectTrigger className="h-12 text-base rounded-xl bg-muted/40 border border-border/30 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="SG">Singapore</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter your business address"
              rows={4}
              className="px-4 py-3 text-base rounded-xl bg-muted/40 border border-border/30 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-none transition-all"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button 
              onClick={updateProfile} 
              disabled={isUpdating}
              className="h-11 px-8 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KYB Document Upload */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-background to-muted/20 rounded-2xl overflow-hidden">
        <CardHeader className="pb-6 pt-6 px-6 bg-muted/30 border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            KYB Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 bg-muted/40 border border-border/30 rounded-xl">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  profile?.verification_status === "verified" || profile?.kyb_verification_status === "approved" ? "bg-green-500" :
                  profile?.verification_status === "pending" || profile?.kyb_verification_status === "pending" ? "bg-yellow-500" :
                  "bg-gray-400"
                }`}></div>
                <div>
                  <p className="font-semibold text-base">Business Verification Status</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile?.kyb_verification_status === "approved" ? "Your business is verified" :
                     profile?.kyb_verification_status === "pending" ? "Verification in progress" :
                     "Upload documents to verify your business"}
                  </p>
                </div>
              </div>
              {getStatusBadge(profile?.kyb_verification_status || profile?.verification_status)}
            </div>

            {(profile?.verification_status !== "verified" && profile?.kyb_verification_status !== "approved") && (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                  <h4 className="font-bold text-base mb-2">📄 Required Documents</h4>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                    <li>• Certificate of Incorporation</li>
                    <li>• Business License</li>
                    <li>• Proof of Business Address (optional)</li>
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: PDF, JPG, PNG • Max size: 10MB per file
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incorporation" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Certificate of Incorporation *
                    </Label>
                    <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="incorporation"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'incorporation')}
                      />
                      <label htmlFor="incorporation" className="cursor-pointer">
                        <div className="text-muted-foreground">
                          <svg className="mx-auto h-12 w-12 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-sm font-medium">Click to upload</p>
                          <p className="text-xs mt-1">PDF, JPG, PNG up to 10MB</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Business License *
                    </Label>
                    <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="license"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'license')}
                      />
                      <label htmlFor="license" className="cursor-pointer">
                        <div className="text-muted-foreground">
                          <svg className="mx-auto h-12 w-12 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-sm font-medium">Click to upload</p>
                          <p className="text-xs mt-1">PDF, JPG, PNG up to 10MB</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={handleKYBSubmit}
                    disabled={isUpdating}
                    className="h-11 px-8 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    {isUpdating ? "Uploading..." : "Submit for Verification"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
