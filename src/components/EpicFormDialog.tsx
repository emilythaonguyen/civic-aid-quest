import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Sprint {
  id: string;
  label: string;
}

interface EpicData {
  id?: string;
  epic_id: string;
  title: string;
  description: string;
  acceptance_criteria: string;
  test_plan: string;
  definition_of_done: string;
  sprint_id: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epic?: EpicData | null;
  sprints: Sprint[];
  onSaved: () => void;
}

const EMPTY: EpicData = {
  epic_id: "",
  title: "",
  description: "",
  acceptance_criteria: "",
  test_plan: "",
  definition_of_done: "",
  sprint_id: "",
};

export default function EpicFormDialog({ open, onOpenChange, epic, sprints, onSaved }: Props) {
  const [form, setForm] = useState<EpicData>(EMPTY);
  const [saving, setSaving] = useState(false);

  const isEdit = !!epic?.id;

  useEffect(() => {
    if (open) {
      setForm(epic ? { ...epic } : { ...EMPTY, sprint_id: sprints[0]?.id ?? "" });
    }
  }, [open, epic, sprints]);

  const set = (field: keyof EpicData, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.epic_id || !form.title) {
      toast.error("Epic ID and Title are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        epic_id: form.epic_id,
        title: form.title,
        description: form.description,
        acceptance_criteria: form.acceptance_criteria,
        test_plan: form.test_plan,
        definition_of_done: form.definition_of_done,
        sprint_id: form.sprint_id,
      };

      if (isEdit) {
        const { error } = await supabase.from("epics").update(payload).eq("id", epic!.id);
        if (error) throw error;
        toast.success("Epic updated.");
      } else {
        const { error } = await supabase.from("epics").insert(payload);
        if (error) throw error;
        toast.success("Epic created.");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save epic.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Epic" : "Add Epic"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Epic ID *</Label>
              <Input value={form.epic_id} onChange={(e) => set("epic_id", e.target.value)} placeholder="EP-13" />
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Epic title" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Sprint</Label>
            <Select value={form.sprint_id} onValueChange={(v) => set("sprint_id", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {sprints.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label>Acceptance Criteria</Label>
            <Textarea value={form.acceptance_criteria} onChange={(e) => set("acceptance_criteria", e.target.value)} rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label>Test Plan</Label>
            <Textarea value={form.test_plan} onChange={(e) => set("test_plan", e.target.value)} rows={2} />
          </div>

          <div className="space-y-1.5">
            <Label>Definition of Done</Label>
            <Textarea value={form.definition_of_done} onChange={(e) => set("definition_of_done", e.target.value)} rows={2} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Epic" : "Create Epic"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
