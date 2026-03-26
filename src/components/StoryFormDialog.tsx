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
  short: string;
}

interface Epic {
  id: string;
  epic_id: string;
  title: string;
}

interface Developer {
  id: string;
  full_name: string;
}

interface StoryData {
  id?: string;
  story_id: string;
  title: string;
  user_story_text: string;
  description: string;
  acceptance_criteria_text: string;
  test_plan_text: string;
  definition_of_done: string;
  assignee_id: string | null;
  priority: "High" | "Medium" | "Low";
  sprint_id: string;
  epic_id: string;
  story_points: number;
  status: string;
  story_type: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story?: StoryData | null;
  sprints: Sprint[];
  epics: Epic[];
  developers: Developer[];
  onSaved: () => void;
}

const EMPTY: StoryData = {
  story_id: "",
  title: "",
  user_story_text: "",
  description: "",
  acceptance_criteria_text: "",
  test_plan_text: "",
  definition_of_done: "",
  assignee_id: null,
  priority: "Medium",
  sprint_id: "",
  epic_id: "",
  story_points: 3,
  status: "Planned",
  story_type: "feature",
};

export default function StoryFormDialog({ open, onOpenChange, story, sprints, epics, developers, onSaved }: Props) {
  const [form, setForm] = useState<StoryData>(EMPTY);
  const [saving, setSaving] = useState(false);

  const isEdit = !!story?.id;

  useEffect(() => {
    if (open) {
      setForm(story ? { ...story } : { ...EMPTY, sprint_id: sprints[0]?.id ?? "", epic_id: epics[0]?.id ?? "" });
    }
  }, [open, story, sprints, epics]);

  const set = (field: keyof StoryData, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.story_id || !form.title) {
      toast.error("Story ID and Title are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        story_id: form.story_id,
        title: form.title,
        user_story_text: form.user_story_text,
        description: form.description,
        acceptance_criteria_text: form.acceptance_criteria_text,
        test_plan_text: form.test_plan_text,
        definition_of_done: form.definition_of_done,
        assignee_id: form.assignee_id || null,
        priority: form.priority,
        sprint_id: form.sprint_id,
        epic_id: form.epic_id,
        story_points: form.story_points,
        status: form.status,
      };

      if (isEdit) {
        const { error } = await supabase.from("user_stories").update(payload).eq("id", story!.id);
        if (error) throw error;
        toast.success("Story updated.");
      } else {
        const { error } = await supabase.from("user_stories").insert(payload);
        if (error) throw error;
        toast.success("Story created.");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save story.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User Story" : "Add User Story"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Story ID *</Label>
              <Input value={form.story_id} onChange={(e) => set("story_id", e.target.value)} placeholder="S2-05" />
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Story title" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>User Story Text</Label>
            <Textarea value={form.user_story_text} onChange={(e) => set("user_story_text", e.target.value)} placeholder="As a ..., I want ... so that ..." rows={2} />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label>Acceptance Criteria</Label>
            <Textarea value={form.acceptance_criteria_text} onChange={(e) => set("acceptance_criteria_text", e.target.value)} rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label>Test Plan</Label>
            <Textarea value={form.test_plan_text} onChange={(e) => set("test_plan_text", e.target.value)} rows={2} />
          </div>

          <div className="space-y-1.5">
            <Label>Definition of Done</Label>
            <Textarea value={form.definition_of_done} onChange={(e) => set("definition_of_done", e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label>Epic</Label>
              <Select value={form.epic_id} onValueChange={(v) => set("epic_id", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {epics.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.epic_id}: {e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Story Points</Label>
              <Input type="number" min={0} max={21} value={form.story_points} onChange={(e) => set("story_points", parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select value={form.assignee_id ?? "none"} onValueChange={(v) => set("assignee_id", v === "none" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {developers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Story" : "Create Story"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
