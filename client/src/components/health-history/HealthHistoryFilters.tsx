// HealthHistoryFilters Component - Handles search and filtering functionality
// Extracted from HealthHistory.tsx for better modularity and maintainability

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HealthHistoryFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
  recordCounts: Record<string, number>;
  className?: string;
}

export function HealthHistoryFilters({
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  recordCounts,
  className = "",
}: HealthHistoryFiltersProps) {
  const categories = [
    { id: "all", label: "All Records", count: recordCounts.all || 0 },
    { id: "checkup", label: "Check-ups", count: recordCounts.checkup || 0 },
    {
      id: "specialist",
      label: "Specialists",
      count: recordCounts.specialist || 0,
    },
    {
      id: "medication",
      label: "Medication",
      count: recordCounts.medication || 0,
    },
    { id: "dental", label: "Dental", count: recordCounts.dental || 0 },
    { id: "emergency", label: "Emergency", count: recordCounts.emergency || 0 },
  ];

  return (
    <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search health records, appointments, or tags..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label} ({category.count})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
