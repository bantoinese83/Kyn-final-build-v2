// FormField Component - Reusable form input field
// Extracted from Signup.tsx to eliminate duplicate form code and improve maintainability

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (field: string, value: string) => void;
  type?: "text" | "email" | "password" | "tel" | "date" | "textarea";
  placeholder?: string;
  required?: boolean;
  className?: string;
  rows?: number;
  maxLength?: number;
}

export function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  className = "",
  rows = 3,
  maxLength,
}: FormFieldProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange(name, e.target.value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {type === "textarea" ? (
        <Textarea
          id={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className="resize-none"
        />
      ) : (
        <Input
          id={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
        />
      )}
    </div>
  );
}
