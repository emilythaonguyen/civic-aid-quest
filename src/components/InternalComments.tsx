import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  author_name: string;
}

interface InternalCommentsProps {
  requestId: string;
  userId: string;
}

export default function InternalComments({ requestId, userId }: InternalCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from("comments")
        .select(`
          id,
          body,
          created_at,
          profiles!author_id (
            full_name
          )
        `)
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });

      if (fetchErr) throw fetchErr;

      setComments(
        (data ?? []).map((c: any) => ({
          id: c.id,
          body: c.body,
          created_at: c.created_at,
          author_name: c.profiles?.full_name ?? "Unknown",
        }))
      );
    } catch {
      console.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [requestId]);

  const handlePost = async () => {
    if (!body.trim()) return;
    setPosting(true);
    setError("");

    try {
      const { error: insertErr } = await supabase
        .from("comments")
        .insert({
          request_id: requestId,
          author_id: userId,
          body: body.trim(),
        });

      if (insertErr) throw insertErr;

      setBody("");
      await fetchComments();
    } catch {
      setError("Failed to post note. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="border-l-4 border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 dark:border-amber-500/50 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Internal Notes — Not Visible to Citizen
      </h3>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No internal notes yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="text-sm border-b border-amber-200 dark:border-amber-800/40 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <span className="font-medium text-foreground">{c.author_name}</span>
                <span>·</span>
                <span>{format(new Date(c.created_at), "MMM d, yyyy · h:mm a")}</span>
              </div>
              <p className="whitespace-pre-wrap">{c.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Add a note</label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write an internal note…"
          className="text-sm min-h-[80px] bg-white dark:bg-muted"
        />
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handlePost} disabled={posting || !body.trim()}>
            {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Post Note"}
          </Button>
          {error && (
            <span className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
