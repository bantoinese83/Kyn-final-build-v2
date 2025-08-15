// EventList Component - Displays and manages a list of events
// Extracted from Events.tsx for better modularity and maintainability

import { useState } from "react";
import { EventCard } from "./EventCard";
import { EventForm } from "./EventForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FamilyEvent } from "@/types/events";

interface EventListProps {
  events: FamilyEvent[];
  isLoading: boolean;
  error: string | null;
  onEventCreate: (event: any) => Promise<any>;
  onEventUpdate: (eventId: string, updates: any) => Promise<any>;
  onEventDelete: (eventId: string) => Promise<any>;
  onRefresh: () => void;
  className?: string;
}

export function EventList({
  events,
  isLoading,
  error,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onRefresh,
  className = "",
}: EventListProps) {
  const { toast } = useToast();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "type">("date");

  // Filter and sort events
  const filteredAndSortedEvents = events
    .filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || event.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "name":
          return a.title.localeCompare(b.title);
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const handleCreateEvent = async (eventData: any) => {
    try {
      await onEventCreate(eventData);
      setIsCreateFormOpen(false);
      toast({
        title: "Event Created",
        description: "Your event has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEvent = async (eventId: string, updates: any) => {
    try {
      await onEventUpdate(eventId, updates);
      toast({
        title: "Event Updated",
        description: "Your event has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await onEventDelete(eventId);
        toast({
          title: "Event Deleted",
          description: "Your event has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">⚠️</div>
        <p className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Events
        </p>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Family Events</h2>
          <p className="text-gray-600 mt-1">
            {filteredAndSortedEvents.length} event
            {filteredAndSortedEvents.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <Button
          onClick={() => setIsCreateFormOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="birthday">Birthdays</SelectItem>
            <SelectItem value="anniversary">Anniversaries</SelectItem>
            <SelectItem value="gathering">Gatherings</SelectItem>
            <SelectItem value="holiday">Holidays</SelectItem>
            <SelectItem value="milestone">Milestones</SelectItem>
            <SelectItem value="activity">Activities</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value: "date" | "name" | "type") => setSortBy(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="type">Type</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Event Form */}
      {isCreateFormOpen && (
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setIsCreateFormOpen(false)}
          mode="create"
        />
      )}

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first family event to get started"}
          </p>
          {!searchTerm && filterType === "all" && (
            <Button onClick={() => setIsCreateFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onUpdate={handleUpdateEvent}
              onDelete={handleDeleteEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
