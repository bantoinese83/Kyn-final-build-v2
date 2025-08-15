// Event Types - Centralized type definitions for events
// Provides consistent interfaces across all event-related components

export interface FamilyEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  endTime?: string;
  location?: string;
  type:
    | "birthday"
    | "anniversary"
    | "gathering"
    | "holiday"
    | "milestone"
    | "activity";
  organizer: {
    id: string;
    name: string;
    avatar?: string;
    initials: string;
  };
  attendees: Array<{
    id: string;
    name: string;
    avatar?: string;
    initials: string;
    status: "going" | "maybe" | "not-going";
    guestCount: number;
  }>;
  isRecurring: boolean;
  reminders: boolean;
  createdAt: string;
  tags?: string[];
  registryLinks?: string[];
  _count?: {
    attendees: number;
  };
}

export interface CreateEventData {
  title: string;
  description: string;
  date: Date;
  time: string;
  endTime?: string;
  location?: string;
  type: FamilyEvent["type"];
  isRecurring: boolean;
  reminders: boolean;
  tags?: string[];
  registryLinks?: string[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface EventFilters {
  type?: FamilyEvent["type"];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  organizer?: string;
  location?: string;
}

export interface EventSortOptions {
  field: "date" | "title" | "type" | "createdAt";
  direction: "asc" | "desc";
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  eventsByType: Record<FamilyEvent["type"], number>;
  eventsByMonth: Record<string, number>;
}

export interface EventRSVP {
  eventId: string;
  userId: string;
  status: "going" | "maybe" | "not-going";
  guestCount: number;
  message?: string;
  updatedAt: string;
}

export interface EventReminder {
  id: string;
  eventId: string;
  userId: string;
  type: "email" | "push" | "sms";
  timing: "15min" | "1hour" | "1day" | "1week";
  sent: boolean;
  sentAt?: string;
}

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  type: FamilyEvent["type"];
  defaultSettings: {
    duration: number; // in minutes
    reminders: boolean;
    isRecurring: boolean;
    tags: string[];
  };
  createdBy: string;
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventCategory {
  type: FamilyEvent["type"];
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultDuration: number; // in minutes
  commonTags: string[];
}

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    type: "birthday",
    label: "Birthday",
    description: "Celebrate family members' birthdays",
    icon: "🎂",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    defaultDuration: 120,
    commonTags: ["celebration", "birthday", "family", "gifts"],
  },
  {
    type: "anniversary",
    label: "Anniversary",
    description: "Mark important relationship milestones",
    icon: "💕",
    color: "bg-red-100 text-red-800 border-red-200",
    defaultDuration: 180,
    commonTags: ["celebration", "anniversary", "romance", "milestone"],
  },
  {
    type: "gathering",
    label: "Family Gathering",
    description: "Bring the family together",
    icon: "👨‍👩‍👧‍👦",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    defaultDuration: 240,
    commonTags: ["family", "gathering", "together", "bonding"],
  },
  {
    type: "holiday",
    label: "Holiday",
    description: "Celebrate traditional and cultural holidays",
    icon: "🎉",
    color: "bg-green-100 text-green-800 border-green-200",
    defaultDuration: 300,
    commonTags: ["holiday", "tradition", "culture", "celebration"],
  },
  {
    type: "milestone",
    label: "Milestone",
    description: "Mark important life achievements",
    icon: "⭐",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    defaultDuration: 150,
    commonTags: ["achievement", "milestone", "success", "celebration"],
  },
  {
    type: "activity",
    label: "Activity",
    description: "Fun family activities and outings",
    icon: "🎯",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    defaultDuration: 120,
    commonTags: ["activity", "fun", "outdoor", "adventure"],
  },
];

export interface EventFormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface EventSearchResult {
  event: FamilyEvent;
  relevance: number;
  matchedFields: string[];
}

export interface EventConflict {
  eventId: string;
  conflictingEvent: FamilyEvent;
  conflictType: "time" | "location" | "attendee";
  severity: "warning" | "error";
  message: string;
}

export interface EventRecurrence {
  pattern: "daily" | "weekly" | "monthly" | "yearly";
  interval: number; // every X days/weeks/months/years
  endDate?: Date;
  maxOccurrences?: number;
  exceptions?: Date[]; // dates to skip
  modifications?: Record<string, any>; // specific modifications for certain occurrences
}

export interface EventCollaboration {
  eventId: string;
  collaborators: Array<{
    userId: string;
    role: "organizer" | "co-organizer" | "assistant";
    permissions: string[];
  }>;
  sharedWith: Array<{
    userId: string;
    accessLevel: "view" | "edit" | "manage";
  }>;
}
