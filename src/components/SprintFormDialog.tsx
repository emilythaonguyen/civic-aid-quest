import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SprintData {
  id: string;
  label: string;
  short: string;
  dates: string;
  sort_order: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint?: SprintData | null;
  onSaved: (sprint: SprintData) => void;
}

const EMPTY: SprintData = {
  id: "",
  label: "",
  short: "",
  dates: "",
  sort_order: 0,
};

export default function SprintFormDialog({ open, onOpenChange, sprint, onSaved }: Props) {
  const [form, setForm] = useState<SprintData>(EMPTY);
  const isEdit = !!sprint?.id;

  useEffect(() => {
    if (open) {
      setForm(sprint ? { ...sprint } : { ...EMPTY, id: crypto.randomUUID() });
    }
  }, [open, sprint]);

  const set = (field: keyof SprintData, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = () => {
    if (!form.label || !form.short) {
      toast.error("Label and Short name are required.");
      return;
    }
    onSaved(form);
    onOpenChange(false);
    toast.success(isEdit ? "Sprint updated." : "Sprint added.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Sprint" : "Add Sprint"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Label *</Label>
              <Input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="Sprint 5" />
            </div>
            <div className="space-y-1.5">
              <Label>Short Name *</Label>
              <Input value={form.short} onChange={(e) => set("short", e.target.value)} placeholder="S5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Date Range</Label>
            <Input value={form.dates} onChange={(e) => set("dates", e.target.value)} placeholder="May 18 – May 31" />
          </div>

          <div className="space-y-1.5">
            <Label>Sort Order</Label>
            <Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            {isEdit ? "Update Sprint" : "Add Sprint"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
