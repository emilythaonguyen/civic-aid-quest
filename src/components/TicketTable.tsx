import { useMemo, useState } from "react";
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
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

function priorityColor(priority: string | null) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40";
    case "Medium":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40";
    case "Low":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40";
    default:
      return "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700/40";
  }
}

function statusColor(status: string) {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40";
    case "In Review":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40";
    case "Resolved":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800/40";
    case "Escalated":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40";
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

type DateSort = "default" | "newest" | "oldest";

export default function TicketTable({ title, tickets }: TicketTableProps) {
  const navigate = useNavigate();
  const [dateSort, setDateSort] = useState<DateSort>("default");

  const cycleSort = () => {
    setDateSort((prev) =>
      prev === "default" ? "newest" : prev === "newest" ? "oldest" : "default"
    );
  };

  const sorted = useMemo(() => {
    if (dateSort !== "default") {
      return [...tickets].sort((a, b) => {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return dateSort === "newest" ? db - da : da - db;
      });
    }
    // Default: sort by priority
    const order: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    return [...tickets].sort(
      (a, b) => (order[a.priority ?? ""] ?? 3) - (order[b.priority ?? ""] ?? 3)
    );
  }, [tickets, dateSort]);

  const SortIcon = dateSort === "newest" ? ArrowDown : dateSort === "oldest" ? ArrowUp : ArrowUpDown;

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
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[10%]">Ticket ID</TableHead>
                <TableHead className="w-[14%]">Citizen Name</TableHead>
                <TableHead className="w-[10%]">Category</TableHead>
                <TableHead className="w-[10%]">Priority</TableHead>
                <TableHead className="w-[40%]">Location</TableHead>
                <TableHead
                  className="w-[16%] cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={cycleSort}
                >
                  <span className="inline-flex items-center gap-1">
                    Submitted
                    <SortIcon className="h-3.5 w-3.5" />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((t) => (
                <TableRow
                  key={t.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/staff/ticket/${t.id}`)}
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
