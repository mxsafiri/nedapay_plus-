"use client";

import { useState, useEffect } from "react";
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
  const [userRole, setUserRole] = useState<string>('');
  const [kybStatus, setKybStatus] = useState<string>('not_started');
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
    shareholderDeclaration: File | null;
    amlPolicy: File | null;
    dataProtectionPolicy: File | null;
  }>({
    incorporation: null,
    license: null,
    shareholderDeclaration: null,
    amlPolicy: null,
    dataProtectionPolicy: null,
  });

  const _supabase = createClient();

  // Detect user role and fetch fresh KYB status on mount
  useEffect(() => {
    const role = (user as any).user_metadata?.role || (user as any).scope?.toLowerCase() || 'sender';
    setUserRole(role);
    
    // Fetch fresh user data to bypass cache
    refreshUserData();
    
    // Fetch fresh KYB status and profile data from API
    fetchKYBStatus();
    fetchProfileData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const refreshUserData = async () => {
    try {
      console.log('🔄 Refreshing user data from database...');
      const response = await fetch('/api/user/refresh', {
        headers: {
          'x-user-id': user.id
        }
      });

      if (response.ok) {
        const data = await response.json();
        const freshUser = data.user;
        
        console.log('✅ Fresh user data:', freshUser);
        
        // Update localStorage with fresh data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          userObj.kyb_verification_status = freshUser.kyb_verification_status;
          userObj.is_email_verified = freshUser.is_email_verified;
          userObj.updated_at = freshUser.updated_at;
          localStorage.setItem('user', JSON.stringify(userObj));
          console.log('✅ localStorage updated with fresh KYB status:', freshUser.kyb_verification_status);
        }
        
        // Update KYB status state
        setKybStatus(freshUser.kyb_verification_status || 'not_started');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const fetchProfileData = async () => {
    try {
      const isProvider = userRole === 'provider' || userRole === 'psp' || (user as any).scope?.toLowerCase() === 'provider' || (user as any).scope?.toLowerCase() === 'psp';
      const apiEndpoint = isProvider ? '/api/provider-profile' : '/api/sender-profile';

      const response = await fetch(`${apiEndpoint}?userId=${user.id}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        const profileData = data.providerProfile || data;
        
        // Update form with existing data
        setFormData({
          company_name: profileData.trading_name || profileData.company_name || "",
          website: profileData.website || "",
          phone: profileData.mobile_number || profileData.phone || "",
          address: profileData.address || "",
          country: profileData.country || "",
        });
        
        console.log('✅ Profile data loaded:', profileData);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const fetchKYBStatus = async () => {
    try {
      const response = await fetch('/api/kyb/upload', {
        method: 'GET',
        headers: {
          'x-user-id': user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const status = data.status || 'not_started';
        setKybStatus(status);
        console.log('✅ Fresh KYB status fetched:', status);
        
        // Update localStorage with fresh status
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            userData.kyb_verification_status = status;
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('✅ localStorage updated with fresh KYB status');
          }
        } catch (storageError) {
          console.warn('Could not update localStorage:', storageError);
        }
      } else {
        // Fallback to user object if API fails
        const status = (user as any).kyb_verification_status || 'not_started';
        setKybStatus(status);
        console.log('⚠️ Using cached KYB status:', status);
      }
    } catch (error) {
      console.error('Error fetching KYB status:', error);
      const status = (user as any).kyb_verification_status || 'not_started';
      setKybStatus(status);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateProfile = async () => {
    setIsUpdating(true);
    try {
      // Determine which profile API to call based on role
      const isProvider = userRole === 'provider' || userRole === 'psp';
      const apiEndpoint = isProvider ? '/api/provider-profile' : '/api/sender-profile';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          userId: user.id, // Send user ID in request body
          tradingName: formData.company_name,
          contactEmail: user.email,
          contactPhone: formData.phone,
          address: formData.address,
          website: formData.website,
          country: formData.country,
        }),
      });

      if (!response.ok) {
        console.error('❌ Response not OK:', response.status, response.statusText);
        let error;
        try {
          error = await response.json();
        } catch (parseError) {
          console.error('❌ Could not parse error response:', parseError);
          error = { error: `Server error: ${response.status} ${response.statusText}` };
        }
        console.error('❌ API Error:', error);
        const errorMessage = error.details || error.error || `Failed to update profile (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setProfile(data);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'incorporation' | 'license' | 'shareholderDeclaration' | 'amlPolicy' | 'dataProtectionPolicy') => {
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
      const docName = {
        incorporation: 'Certificate of Incorporation',
        license: 'Business License',
        shareholderDeclaration: 'Shareholder Declaration',
        amlPolicy: 'AML Policy',
        dataProtectionPolicy: 'Data Protection Policy'
      }[type];
      toast.success(`${docName} selected: ${file.name}`);
    }
  };

  const handleKYBSubmit = async () => {
    if (!kybFiles.incorporation || !kybFiles.license || !kybFiles.shareholderDeclaration || !kybFiles.amlPolicy || !kybFiles.dataProtectionPolicy) {
      toast.error("Please upload all 5 required documents");
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('incorporation', kybFiles.incorporation);
      formData.append('license', kybFiles.license);
      formData.append('shareholderDeclaration', kybFiles.shareholderDeclaration);
      formData.append('amlPolicy', kybFiles.amlPolicy);
      formData.append('dataProtectionPolicy', kybFiles.dataProtectionPolicy);

      const response = await fetch('/api/kyb/upload', {
        method: 'POST',
        headers: {
          'x-user-id': user.id, // Send user ID for custom auth
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload documents');
      }

      const _result = await response.json();
      toast.success("Documents uploaded successfully! Verification in progress.");
      
      // Refresh KYB status
      await fetchKYBStatus();
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

  const getBusinessTypeDisplay = () => {
    // Use userRole state which is set from user metadata
    if (userRole === 'sender' || userRole === 'bank') return "Sender / Bank";
    if (userRole === 'provider' || userRole === 'psp') return "Provider / PSP";
    // Fallback to profile business_type if available
    if (profile?.business_type === "sender") return "Sender / Bank";
    if (profile?.business_type === "provider") return "Provider / PSP";
    return "Not Set";
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
                  {getBusinessTypeDisplay()}
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
                  <SelectItem value="TZ">🇹🇿 Tanzania</SelectItem>
                  <SelectItem value="KE">🇰🇪 Kenya</SelectItem>
                  <SelectItem value="NG">🇳🇬 Nigeria</SelectItem>
                  <SelectItem value="CN">🇨🇳 China</SelectItem>
                  <SelectItem value="UG">🇺🇬 Uganda</SelectItem>
                  <SelectItem value="RW">🇷🇼 Rwanda</SelectItem>
                  <SelectItem value="ZA">🇿🇦 South Africa</SelectItem>
                  <SelectItem value="GH">🇬🇭 Ghana</SelectItem>
                  <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
                  <SelectItem value="AE">🇦🇪 UAE</SelectItem>
                  <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                  <SelectItem value="US">🇺🇸 United States</SelectItem>
                  <SelectItem value="other">🌍 Other</SelectItem>
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
                  kybStatus === "verified" ? "bg-green-500" :
                  kybStatus === "pending" ? "bg-yellow-500" :
                  "bg-gray-400"
                }`}></div>
                <div>
                  <p className="font-semibold text-base">Business Verification Status</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {kybStatus === "verified" ? "Your business is verified ✅" :
                     kybStatus === "pending" ? "Verification in progress" :
                     "Upload documents to verify your business"}
                  </p>
                </div>
              </div>
              {getStatusBadge(kybStatus)}
            </div>

            {kybStatus !== "verified" && (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                  <h4 className="font-bold text-base mb-2">📄 Required Documents</h4>
                  <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                    <li>• Certificate of Incorporation</li>
                    <li>• Business License</li>
                    <li>• Shareholder Declaration</li>
                    <li>• Anti-Money Laundering (AML) Policy</li>
                    <li>• Data Protection Policy</li>
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

                  {/* Shareholder Declaration */}
                  <div className="space-y-2">
                    <Label htmlFor="shareholderDeclaration" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Shareholder Declaration *
                    </Label>
                    <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="shareholderDeclaration"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'shareholderDeclaration')}
                      />
                      <label htmlFor="shareholderDeclaration" className="cursor-pointer">
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

                  {/* AML Policy */}
                  <div className="space-y-2">
                    <Label htmlFor="amlPolicy" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      AML Policy *
                    </Label>
                    <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="amlPolicy"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'amlPolicy')}
                      />
                      <label htmlFor="amlPolicy" className="cursor-pointer">
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

                  {/* Data Protection Policy */}
                  <div className="space-y-2">
                    <Label htmlFor="dataProtectionPolicy" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Data Protection Policy *
                    </Label>
                    <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="dataProtectionPolicy"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'dataProtectionPolicy')}
                      />
                      <label htmlFor="dataProtectionPolicy" className="cursor-pointer">
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
