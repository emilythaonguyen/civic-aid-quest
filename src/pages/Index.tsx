import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <h1 className="text-4xl font-bold text-foreground">Civic Aid App</h1>
      <Button
        className="bg-black text-white hover:bg-black/90"
        onClick={() => navigate("/citizen-login")}
      >
        Citizen Login
      </Button>
      <Button
        className="bg-black text-white hover:bg-black/90"
        onClick={() => navigate("/staff-login")}
      >
        Staff Login
      </Button>
    </div>
  );
};

export default Index;
