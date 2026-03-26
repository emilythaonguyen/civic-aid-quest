import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

function priorityColor(priority: string | null) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800 border-red-200";
    case "Medium":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

function statusColor(status: string) {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "In Review":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-200";
    case "Escalated":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export interface TicketRow {
  id: string;
  citizen_name: string;
  category: string;
  status: string;
  priority: string | null;
  location: string;
  created_at: string;
}

interface TicketTableProps {
  title: string;
  tickets: TicketRow[];
}

export default function TicketTable({ title, tickets }: TicketTableProps) {
  const navigate = useNavigate();

  const sorted = useMemo(() => {
    const order: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    return [...tickets].sort(
      (a, b) => (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3)
    );
  }, [tickets]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">({tickets.length})</span>
      </div>
      {tickets.length === 0 ? (
        <div className="border rounded-lg px-4 py-6 text-center text-sm text-muted-foreground">
          No tickets.
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Ticket ID</TableHead>
                <TableHead>Citizen Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-[130px]">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((t) => (
                <TableRow
                  key={t.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/staff/tickets/${t.id}`)}
                >
                  <TableCell className="font-mono text-xs">
                    {t.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>{t.citizen_name}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${priorityColor(t.priority)}`}
                    >
                      {t.priority ?? "Pending"}
                    </span>
                  </TableCell>
                  <TableCell>{t.location}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(t.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
