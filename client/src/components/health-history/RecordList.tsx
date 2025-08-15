// RecordList Component - Displays and manages health records
// Extracted from HealthHistory.tsx for better modularity and maintainability

import { Button } from "@/components/ui/button";
import { Plus, Stethoscope } from "lucide-react";
import { HealthRecord } from "@/types/health-history";
import { HealthRecordCard } from "./HealthRecordCard";

interface RecordListProps {
  records: HealthRecord[];
  onAddRecord: () => void;
  onEditRecord: (record: HealthRecord) => void;
  onDeleteRecord: (recordId: string) => Promise<void>;
  className?: string;
}

export function RecordList({
  records,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  className = "",
}: RecordListProps) {
  if (records.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No health records yet</h3>
        <p className="text-muted-foreground mb-4">
          Start tracking your family's health information by adding your first
          record.
        </p>
        <Button onClick={onAddRecord}>
          <Plus className="w-4 h-4 mr-2" />
          Add First Record
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Health Records</h2>
        <span className="text-sm text-muted-foreground">
          {records.length} record{records.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {records.map((record) => (
          <HealthRecordCard
            key={record.id}
            record={record}
            onEdit={() => onEditRecord(record)}
            onDelete={() => onDeleteRecord(record.id)}
          />
        ))}
      </div>
    </div>
  );
}
