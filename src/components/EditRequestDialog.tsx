import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, ExternalLink } from "lucide-react";
import { translations, type Language } from "@/i18n/citizenTranslations";
import { translateFields } from "@/lib/translateToEnglish";
import { cn } from "@/lib/utils";

const REQUEST_TYPE_KEYS = ["pothole", "streetlight", "dumping", "graffiti", "other"] as const;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface EditRequestDialogProps {
  request: {
    id: string;
    attachment_url: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  language: Language;
}

export default function EditRequestDialog({ request, open, onOpenChange, onSaved, language }: EditRequestDialogProps) {
  const t = translations[language] as any;
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Reset form when request changes
  useEffect(() => {
    setFile(null);
    setFilePreview(null);
    setRemoveAttachment(false);
    setErrors({});
    setSaveError("");
  }, [request.id, open]);

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) return t.fileTypeError;
    if (f.size > MAX_FILE_SIZE) return t.fileSizeError;
    return null;
  };

  const handleFileSelect = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setErrors((p) => ({ ...p, attachment: err }));
      return;
    }
    setErrors((p) => ({ ...p, attachment: "" }));
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
    setRemoveAttachment(false);
  };

  const clearNewFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
    setErrors((p) => ({ ...p, attachment: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!requestType) e.request_type = t.requestTypeRequired;
    if (!location.trim()) e.location = t.locationRequired;
    if (!description.trim()) {
      e.description = t.descriptionRequired;
    } else if (description.trim().length < 20) {
      e.description = t.descriptionMinLength;
    }
    return e;
  };

  const handleSave = async () => {
    setSaveError("");
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);

    let attachmentUrl: string | null = request.attachment_url;

    // Upload new file if provided
    if (file && user) {
      const tempId = crypto.randomUUID();
      const filePath = `${user.id}/${tempId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("request-attachments")
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        setSaving(false);
        setSaveError(t.uploadFailed);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("request-attachments")
        .getPublicUrl(filePath);

      attachmentUrl = urlData.publicUrl;
    } else if (removeAttachment) {
      attachmentUrl = null;
    }

    const { translatedLocation, translatedDescription } = await translateFields(
      location.trim(),
      description.trim(),
      language,
    );

    const { error, count } = await supabase
      .from("requests")
      .update({
        type: requestType,
        location: translatedLocation,
        description: translatedDescription,
        original_location: location.trim(),
        original_description: description.trim(),
        attachment_url: attachmentUrl,
      })
      .eq("id", request.id)
      .eq("user_id", user!.id);

    if (error) {
      console.error("Update error:", error);
      setSaving(false);
      setSaveError(error.message || t.submitFailed);
      return;
    }

    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  const labelCls = "text-[hsl(210_20%_80%)]";
  const inputCls =
    "bg-[hsl(217_33%_17%)] text-white border-white/15 placeholder:text-[hsl(215_20%_34%)] focus-visible:ring-[hsl(var(--hero-cta))]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[hsl(220_45%_16%)] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{t.editRequest || "Edit Request"}</DialogTitle>
        </DialogHeader>

        {saveError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {saveError}
          </div>
        )}

        <div className="space-y-5 pt-2">
          {/* Request Type */}
          <div className="space-y-1.5">
            <Label className={labelCls}>{t.requestType}</Label>
            <Select value={requestType} onValueChange={(v) => { setRequestType(v); setErrors((p) => ({ ...p, request_type: "" })); }}>
              <SelectTrigger className={cn(inputCls, errors.request_type ? "border-destructive" : "")}>
                <SelectValue placeholder={t.selectRequestType} />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPE_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>{t[key]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.request_type && <p className="text-sm text-destructive">{errors.request_type}</p>}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className={labelCls}>{t.location}</Label>
            <Input
              placeholder={t.locationPlaceholder}
              value={location}
              onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: "" })); }}
              className={cn(inputCls, errors.location ? "border-destructive" : "")}
            />
            {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className={labelCls}>{t.description}</Label>
            <Textarea
              placeholder={t.descriptionPlaceholder}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
              className={cn(inputCls, errors.description ? "border-destructive" : "")}
              rows={4}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Attachment */}
          <div className="space-y-1.5">
            <Label className={labelCls}>{t.attachPhoto}</Label>
            <p className="text-xs text-[hsl(var(--hero-muted))]">{t.attachHelper}</p>

            {/* Existing attachment */}
            {request.attachment_url && !removeAttachment && !file && (
              <div className="flex items-center gap-3 rounded-md border border-white/15 bg-white/5 p-3">
                <a
                  href={request.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center gap-1 text-sm text-[hsl(var(--hero-accent))] hover:underline truncate"
                >
                  {t.viewAttachedFile} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
                <button
                  type="button"
                  onClick={() => setRemoveAttachment(true)}
                  className="rounded-full p-1 hover:bg-white/10 transition-colors"
                  aria-label="Remove attachment"
                >
                  <X className="h-4 w-4 text-[hsl(var(--hero-muted))]" />
                </button>
              </div>
            )}

            {/* New file preview */}
            {file && filePreview && (
              <div className="flex items-center gap-3 rounded-md border border-white/15 bg-white/5 p-3">
                <img src={filePreview} alt="Preview" className="h-14 w-14 rounded object-cover border border-white/10" />
                <span className="flex-1 truncate text-sm text-white">{file.name}</span>
                <button
                  type="button"
                  onClick={clearNewFile}
                  className="rounded-full p-1 hover:bg-white/10 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4 text-[hsl(var(--hero-muted))]" />
                </button>
              </div>
            )}

            {/* Upload zone — shown when no file is selected */}
            {!file && (removeAttachment || !request.attachment_url) && (
              <div
                className="mt-1 flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-white/20 bg-[hsl(217_33%_17%)] hover:border-white/40 p-6 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-[hsl(var(--hero-muted))]" />
                <p className="text-sm text-[hsl(var(--hero-muted))]">
                  {t.dragDrop}{" "}
                  <span className="font-medium underline underline-offset-2 text-[hsl(var(--hero-accent))]">{t.browseFiles}</span>
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
            )}

            {/* Replace button when existing attachment is shown */}
            {request.attachment_url && !removeAttachment && !file && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent mt-2"
                onClick={() => fileInputRef.current?.click()}
              >
                {t.replaceAttachment || "Replace Attachment"}
              </Button>
            )}

            {/* Hidden file input for replace flow */}
            {request.attachment_url && !removeAttachment && !file && (
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
            )}

            {errors.attachment && <p className="text-sm text-destructive">{errors.attachment}</p>}
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-[hsl(var(--hero-cta))] text-white hover:bg-[hsl(224_76%_55%)] transition-colors"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.saveChanges || "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
