import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, ExternalLink } from "lucide-react";
import { translations, type Language } from "@/i18n/citizenTranslations";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const MAX_ATTACHMENTS = 3;

interface EditRequestDialogProps {
  request: {
    id: string;
    attachmentCount: number;
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setFile(null);
    setFilePreview(null);
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
  };

  const clearNewFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
    setErrors((p) => ({ ...p, attachment: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const atLimit = request.attachmentCount >= MAX_ATTACHMENTS;

  const handleSave = async () => {
    setSaveError("");
    if (!file) {
      onOpenChange(false);
      return;
    }

    setSaving(true);

    if (user) {
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

      const { error } = await supabase
        .from("attachments")
        .insert({ request_id: request.id, file_url: urlData.publicUrl, user_id: user.id, file_name: file.name });

      if (error) {
        console.error("Attachment insert error:", error);
        setSaving(false);
        setSaveError(error.message || t.submitFailed);
        return;
      }
    }

    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  const labelCls = "text-[hsl(210_20%_80%)]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-[hsl(220_45%_16%)] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{t.addAttachment || "Add Attachment"}</DialogTitle>
        </DialogHeader>

        {saveError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {saveError}
          </div>
        )}

        <div className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label className={labelCls}>{t.attachPhoto}</Label>
            <p className="text-xs text-[hsl(var(--hero-muted))]">{t.attachHelper}</p>

            {atLimit && !file && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
                {t.maxAttachmentsReached || `Maximum of ${MAX_ATTACHMENTS} attachments reached.`}
              </div>
            )}

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

            {!file && !atLimit && (
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

            {errors.attachment && <p className="text-sm text-destructive">{errors.attachment}</p>}
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !file}
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
