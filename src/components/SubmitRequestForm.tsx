import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Upload, X, CheckCircle2 } from "lucide-react";

const REQUEST_TYPES = [
  { label: "Pothole", value: "pothole" },
  { label: "Broken Streetlight", value: "streetlight" },
  { label: "Illegal Dumping", value: "dumping" },
  { label: "Graffiti", value: "graffiti" },
  { label: "Other", value: "other" },
];
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface FormErrors {
  request_type?: string;
  location?: string;
  description?: string;
  attachment?: string;
}

export default function SubmitRequestForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [requestType, setRequestType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) return "Only PNG, JPG, and PDF files are accepted.";
    if (f.size > MAX_FILE_SIZE) return "File is too large. Maximum size is 5MB.";
    return null;
  };

  const handleFileSelect = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setErrors((p) => ({ ...p, attachment: err }));
      return;
    }
    setErrors((p) => ({ ...p, attachment: undefined }));
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
    setErrors((p) => ({ ...p, attachment: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

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

  const resetForm = () => {
    setRequestType("");
    setLocation("");
    setDescription("");
    removeFile();
    setErrors({});
    setSubmitError("");
    setSubmittedId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    let attachmentUrl: string | null = null;

    if (file) {
      const tempId = crypto.randomUUID();
      const filePath = `${user!.id}/${tempId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("request-attachments")
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        setSubmitting(false);
        setSubmitError("File upload failed. Please try again.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("request-attachments")
        .getPublicUrl(filePath);

      attachmentUrl = urlData.publicUrl;
    }

    const insertPayload: Record<string, unknown> = {
      type: requestType,
      location: location.trim(),
      description: description.trim(),
      status: "Open",
      user_id: user!.id,
      attachment_url: attachmentUrl,
    };

    const { data, error } = await supabase
      .from("requests")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error || !data) {
      setSubmitting(false);
      console.error("Supabase insert error:", error);
      setSubmitError(error?.message || "Something went wrong. Please try again.");
      return;
    }

    setSubmitting(false);
    setSubmittedId(data.id);
  };

  if (submittedId) {
    return (
      <Card className="w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-2">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-xl">Request Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your request has been logged. Your Request ID is:
          </p>
          <p className="font-mono text-sm bg-muted rounded-md px-3 py-2 break-all">
            {submittedId}
          </p>
          <Button onClick={resetForm} className="w-full">
            Submit Another Request
          </Button>
          <Button onClick={() => navigate("/portal")} className="w-full">
            Return to Portal
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
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
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
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

          {/* Photo Attachment */}
          <div className="space-y-1.5">
            <Label>Attach a Photo (Optional)</Label>
            <p className="text-xs text-muted-foreground">Accepted formats: PNG, JPG, PDF. Max size: 5MB.</p>

            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`mt-1 flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 transition-colors cursor-pointer ${
                  dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop a photo here, or{" "}
                  <span className="font-medium text-primary underline underline-offset-2">browse files</span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-3 rounded-md border border-border bg-muted/50 p-3">
                {filePreview && (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="h-14 w-14 rounded object-cover border border-border"
                  />
                )}
                <span className="flex-1 truncate text-sm">{file.name}</span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="rounded-full p-1 hover:bg-muted transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            )}

            {errors.attachment && <p className="text-sm text-destructive">{errors.attachment}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
