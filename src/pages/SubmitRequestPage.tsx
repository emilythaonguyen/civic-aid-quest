import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const REQUEST_TYPES = ["Pothole", "Broken Streetlight", "Illegal Dumping", "Graffiti", "Other"];

interface FormErrors {
  request_type?: string;
  location?: string;
  description?: string;
}

export default function SubmitRequestPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [requestType, setRequestType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Redirect unauthenticated users
  if (!authLoading && !user) {
    navigate("/login", { replace: true });
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!requestType) e.request_type = "Request type is required.";
    if (!location.trim()) e.location = "Location is required.";
    if (!description.trim()) {
      e.description = "Description is required.";
    } else if (description.trim().length < 20) {
      e.description = "Description must be at least 20 characters.";
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    const { data, error } = await supabase
      .from("service_requests")
      .insert({
        request_type: requestType,
        location: location.trim(),
        description: description.trim(),
        status: "Open",
        user_id: user!.id,
      })
      .select("id")
      .single();

    setSubmitting(false);

    if (error || !data) {
      setSubmitError("Something went wrong. Please try again.");
      return;
    }

    setSubmittedId(data.id);
  };

  if (submittedId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-xl">Request Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your request has been submitted! Your Request ID is:
            </p>
            <p className="font-mono text-sm bg-muted rounded-md px-3 py-2 break-all">
              {submittedId}
            </p>
            <Button variant="outline" onClick={() => navigate("/portal")}>
              Back to Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Submit a Service Request</CardTitle>
          <CardDescription>
            Report a non-emergency issue in your community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitError && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Request Type */}
            <div className="space-y-1.5">
              <Label htmlFor="request-type">Request Type</Label>
              <Select value={requestType} onValueChange={(v) => { setRequestType(v); setErrors((p) => ({ ...p, request_type: undefined })); }}>
                <SelectTrigger id="request-type" className={errors.request_type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a request type" />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.request_type && <p className="text-sm text-destructive">{errors.request_type}</p>}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter address or intersection"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: undefined })); }}
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: undefined })); }}
                className={errors.description ? "border-destructive" : ""}
                rows={4}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
