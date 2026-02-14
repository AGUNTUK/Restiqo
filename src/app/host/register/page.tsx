"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building,
  Hotel,
  Compass,
  User,
  Mail,
  Phone,
  FileText,
  Loader2,
  Check,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const hostTypes = [
  {
    id: "APARTMENT",
    label: "Apartment Host",
    description: "Rent out apartments and flats",
    icon: Building,
  },
  {
    id: "HOTEL",
    label: "Hotel Owner",
    description: "Manage hotels and resorts",
    icon: Hotel,
  },
  {
    id: "TOUR_OPERATOR",
    label: "Tour Operator",
    description: "Offer tours and experiences",
    icon: Compass,
  },
  {
    id: "RESORT",
    label: "Resort Owner",
    description: "Manage resorts and vacation properties",
    icon: Hotel,
  },
  {
    id: "GUESTHOUSE",
    label: "Guesthouse Owner",
    description: "Run guesthouses and B&Bs",
    icon: Building,
  },
];

export default function HostRegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedType, setSelectedType] = useState<string>("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/host/register");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      toast({
        title: "Error",
        description: "Please select a host type.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Application Submitted!",
        description: "Your host application has been submitted for review.",
      });
      router.push("/dashboard");
    }, 1500);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Become a Host
            </h1>
            <p className="text-slate-600">
              Join our community of hosts and start earning by sharing your
              properties or tour experiences.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Host Type Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>What would you like to host?</CardTitle>
                <CardDescription>
                  Select the type of hosting that best describes your business.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hostTypes.map((type) => (
                    <motion.div
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all ${
                          selectedType === type.id
                            ? "border-primary bg-primary/5"
                            : "border-slate-200 hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        <CardContent className="p-4 flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              selectedType === type.id
                                ? "bg-primary text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <type.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{type.label}</h3>
                              {selectedType === type.id && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-slate-500">
                              {type.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>
                  Tell us about your business and what you offer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company/Business Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="companyName"
                      placeholder="Your business name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+880 1XXX-XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <textarea
                      id="description"
                      placeholder="Tell us about your business, experience, and what makes you unique..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full min-h-[120px] pl-10 pr-4 py-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details for hosting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        value={session?.user?.name || ""}
                        className="pl-10 bg-slate-50"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        value={session?.user?.email || ""}
                        className="pl-10 bg-slate-50"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms */}
            <div className="mb-6">
              <p className="text-sm text-slate-600">
                By submitting this application, you agree to our{" "}
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/host/standards" className="text-primary hover:underline">
                  Host Standards
                </a>
                . Your application will be reviewed within 2-3 business days.
              </p>
            </div>

            {/* Submit Button */}
            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>

          {/* Benefits */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-center mb-6">
              Why Host with Restiqo?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">90%</span>
                  </div>
                  <h3 className="font-medium mb-2">Competitive Revenue</h3>
                  <p className="text-sm text-slate-600">
                    Keep 90% of your booking revenue
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-2">Easy Management</h3>
                  <p className="text-sm text-slate-600">
                    Simple dashboard to manage all your listings
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-2">Wide Reach</h3>
                  <p className="text-sm text-slate-600">
                    Connect with travelers across Bangladesh
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}