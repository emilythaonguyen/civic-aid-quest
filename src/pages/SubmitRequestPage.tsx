import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import SubmitRequestForm from "@/components/SubmitRequestForm";

export default function SubmitRequestPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <SubmitRequestForm />
      </div>
    </div>
  );
}
