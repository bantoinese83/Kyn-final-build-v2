import React, { useState, useCallback, useMemo, useRef } from "react";
import { withFamilyAppPatterns } from "@/components/hoc";
import { DataCard } from "@/components/ui/patterns/DataCard";
import { EmptyState } from "@/components/ui/patterns/EmptyState";
import { usePerformanceMonitor } from "@/hooks/usePerformance";
import { eventService } from "@/services";
import { Event, User } from "@/types/database";
import {
  Calendar,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  MapPin,
  Clock,
  Users,
  Heart,
  MessageCircle,
  Edit,
  Trash2,
} from "lucide-react";

// Enhanced interfaces for the Events component
interface EventsData {
  events: Event[];
  totalEvents: number;
  totalCategories: number;
  totalRSVPs: number;
  upcomingEvents: Event[];
  pastEvents: Event[];
  familyMembers: User[];
  categories: any[];
  eventStats: {
    totalAttendees: number;
    averageRating: number;
    totalPhotos: number;
    mostPopularEvent: string;
  };
}

interface EventsFilters {
  viewMode: "grid" | "list" | "calendar";
  sortBy: "date" | "name" | "popularity" | "recent";
  sortOrder: "asc" | "desc";
  dateRange: "all" | "upcoming" | "past" | "thisWeek" | "thisMonth";
  category: string | "all";
  location: string;
  priceRange: "free" | "paid" | "all";
  attendees: "any" | "family" | "friends" | "public";
  searchQuery: string;
  authorId?: string;
  categoryId?: string;
}

interface EventsProps {
  familyId?: string;
  userId?: string;
  onEventSelect?: (event: Event) => void;
  onEventCreate?: (event: Partial<Event>) => void;
  onEventUpdate?: (eventId: string, updates: Partial<Event>) => void;
  onEventDelete?: (eventId: string) => void;
  onRSVP?: (eventId: string, status: "going" | "maybe" | "not_going") => void;
  onError?: (error: string) => void;
}

// Enhanced Events component with modern patterns
const EventsComponent: React.FC<EventsProps> = ({
  familyId = "",
  userId = "",
  onEventSelect,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onRSVP,
  onError,
}) => {
  const { renderTime } = usePerformanceMonitor("Events");

  // Enhanced state management
  const [filters, setFilters] = useState<EventsFilters>({
    viewMode: "grid",
    sortBy: "date",
    sortOrder: "asc",
    dateRange: "upcoming",
    searchQuery: "",
    authorId: undefined,
    categoryId: undefined,
    category: "all",
    location: "",
    priceRange: "all",
    attendees: "any",
  });

  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [eventsData, setEventsData] = useState<EventsData>({
    events: [],
    totalEvents: 0,
    totalCategories: 0,
    totalRSVPs: 0,
    upcomingEvents: [],
    pastEvents: [],
    familyMembers: [],
    categories: [],
    eventStats: {
      totalAttendees: 0,
      averageRating: 0,
      totalPhotos: 0,
      mostPopularEvent: "None",
    },
  });

  // Refs for search and filters
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Memoized data fetching functions
  const fetchEventsData = useCallback(async (): Promise<EventsData> => {
    try {
      // Fetch events data
      const eventsResult = await eventService.getFamilyEvents(
        familyId,
        currentPage,
        pageSize,
      );

      if (!eventsResult.success) {
        throw new Error(eventsResult.error || "Failed to fetch events");
      }

      const events = eventsResult.data || [];

      // Calculate statistics
      const totalEvents = events.length;
      const upcomingEvents = events.filter(
        (event) => new Date(event.date) > new Date(),
      );
      const pastEvents = events.filter(
        (event) => new Date(event.date) <= new Date(),
      );

      const data: EventsData = {
        events,
        totalEvents,
        totalCategories: 0, // Will be implemented when categories are available
        totalRSVPs: 0, // Will be implemented when RSVP system is available
        upcomingEvents,
        pastEvents,
        familyMembers: [], // Will be fetched separately if needed
        categories: [],
        eventStats: {
          totalAttendees: 0, // Will be implemented when attendee system is available
          averageRating: 0, // Will be implemented when rating system is available
          totalPhotos: 0, // Will be implemented when photo system is available
          mostPopularEvent: events.length > 0 ? events[0].title : "None",
        },
      };

      setEventsData(data);
      return data;
    } catch (error) {
      console.error("Error fetching events data:", error);
      throw error;
    }
  }, [familyId, currentPage, pageSize]);

  // Enhanced filter handlers
  const handleFilterChange = useCallback(
    (key: keyof EventsFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1); // Reset to first page when filters change
    },
    [],
  );

  const handleSearch = useCallback(
    (query: string) => {
      handleFilterChange("searchQuery", query);
    },
    [handleFilterChange],
  );

  // Event action handlers
  const handleEventSelect = useCallback(
    (event: Event) => {
      onEventSelect?.(event);
    },
    [onEventSelect],
  );

  const handleEventCreate = useCallback(
    (eventData: Partial<Event>) => {
      onEventCreate?.(eventData);
      setIsCreating(false);
    },
    [onEventCreate],
  );

  const handleEventUpdate = useCallback(
    (eventId: string, updates: Partial<Event>) => {
      onEventUpdate?.(eventId, updates);
      setIsEditing(false);
    },
    [onEventUpdate],
  );

  const handleEventDelete = useCallback(
    async (eventId: string) => {
      if (!confirm("Are you sure you want to delete this event?")) return;

      try {
        onEventDelete?.(eventId);
        // Refresh data after deletion
        await fetchEventsData();
      } catch (error) {
        console.error("Error deleting event:", error);
        onError?.(
          error instanceof Error ? error.message : "Failed to delete event",
        );
      }
    },
    [onEventDelete, onError, fetchEventsData],
  );

  const handleRSVP = useCallback(
    (eventId: string, status: "going" | "maybe" | "not_going") => {
      onRSVP?.(eventId, status);
    },
    [onRSVP],
  );

  // Memoized filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = eventsData.events || [];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query),
      );
    }

    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((event) => event.type === filters.category);
    }

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case "upcoming":
          filtered = filtered.filter((event) => new Date(event.date) > now);
          break;
        case "past":
          filtered = filtered.filter((event) => new Date(event.date) <= now);
          break;
        case "thisWeek":
          filterDate.setDate(now.getDate() + 7);
          filtered = filtered.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= filterDate;
          });
          break;
        case "thisMonth":
          filterDate.setMonth(now.getMonth() + 1);
          filtered = filtered.filter((event) => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= filterDate;
          });
          break;
      }
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (filters.sortBy) {
      case "date":
        sorted.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
        break;
      case "name":
        sorted.sort((a, b) => {
          const nameA = a.title.toLowerCase();
          const nameB = b.title.toLowerCase();
          return filters.sortOrder === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        });
        break;
      case "popularity":
        // For now, sort by date since we don't have popularity metrics
        sorted.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
        break;
      case "recent":
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
        break;
    }

    return {
      events: sorted,
      totalEvents: sorted.length,
    };
  }, [eventsData.events, filters]);

  // Render functions
  const renderToolbar = useCallback(
    () => (
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search events..."
                value={filters.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {/* Add category options here */}
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  viewMode: prev.viewMode === "grid" ? "list" : "grid",
                }))
              }
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={
                filters.viewMode === "grid"
                  ? "Switch to List View"
                  : "Switch to Grid View"
              }
            >
              {filters.viewMode === "grid" ? (
                <List className="w-5 h-5" />
              ) : (
                <Grid3X3 className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>
        </div>
      </div>
    ),
    [filters, handleSearch, handleFilterChange],
  );

  const renderStats = useCallback(
    () => (
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DataCard
            title="Total Events"
            value={filteredData.totalEvents}
            icon={Calendar}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
          <DataCard
            title="Upcoming Events"
            value={
              filteredData.events.filter(
                (event) => new Date(event.date) > new Date(),
              ).length
            }
            icon={Clock}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
          />
          <DataCard
            title="Total RSVPs"
            value={0} // Will be implemented when RSVP system is available
            icon={Users}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />
          <DataCard
            title="Categories"
            value={
              filteredData.events.reduce((categories, event) => {
                if (event.type && !categories.includes(event.type)) {
                  categories.push(event.type);
                }
                return categories;
              }, [] as string[]).length
            }
            icon={Filter}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
          />
        </div>
      </div>
    ),
    [filteredData],
  );

  const renderEventCard = useCallback(
    (event: Event) => (
      <div
        key={event.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleEventSelect(event)}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {event.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {event.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit Event"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventDelete(event.id);
                }}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {event.date && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
            )}

            {event.time && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{event.time}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>0 attending</span>{" "}
              {/* Will be implemented when attendee system is available */}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRSVP(event.id, "going");
                }}
                className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors"
              >
                Going
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRSVP(event.id, "maybe");
                }}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full hover:bg-yellow-200 transition-colors"
              >
                Maybe
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRSVP(event.id, "not_going");
                }}
                className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200 transition-colors"
              >
                Not Going
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Heart className="w-4 h-4" />
              <span>0</span>{" "}
              {/* Will be implemented when like system is available */}
              <MessageCircle className="w-4 h-4" />
              <span>0</span>{" "}
              {/* Will be implemented when comment system is available */}
            </div>
          </div>
        </div>
      </div>
    ),
    [handleEventSelect, setIsEditing, handleEventDelete, handleRSVP],
  );

  const renderEventGrid = useCallback(() => {
    if (filteredData.events.length === 0) {
      return (
        <EmptyState
          icon={<Calendar className="w-16 h-16 text-gray-400" />}
          title="No events found"
          description="Try adjusting your filters or create some new events."
        />
      );
    }

    const gridCols =
      filters.viewMode === "grid"
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "grid-cols-1";

    return (
      <div className={`grid ${gridCols} gap-6 p-6`}>
        {filteredData.events.map(renderEventCard)}
      </div>
    );
  }, [filteredData.events, filters.viewMode, renderEventCard]);

  // Load data on mount
  React.useEffect(() => {
    fetchEventsData();
  }, [fetchEventsData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {renderToolbar()}
      {renderStats()}
      {renderEventGrid()}
    </div>
  );
};

// Enhanced Events with comprehensive HOCs
const Events = withFamilyAppPatterns(EventsComponent, {
  requireAuth: true,
  requireFamilyMember: true,
  withDataFetching: false, // We're handling data fetching manually for now
  withFormManagement: false,
  withValidation: false,
});

export default Events;
