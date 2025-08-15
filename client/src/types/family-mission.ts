// Family Mission Types - Centralized type definitions for family mission functionality
// Extracted from FamilyMission.tsx for better type safety and consistency

export interface FamilyValue {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export interface MascotOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

export interface MerchandiseItem {
  id: number;
  type: string;
  icon: React.ReactNode;
  description: string;
  mockup: string;
}

export interface FamilyMissionData {
  familyId: string;
  statement: string;
  tagline: string;
  familyMotto: string;
  foundedYear: string;
  values: string[];
  mascotId: string | null;
  mascotName: string | null;
}

export interface FamilyMissionState {
  isEditing: boolean;
  activeTab: "mission" | "values" | "mascot" | "merchandise";
  selectedValues: FamilyValue[];
  selectedMascot: MascotOption | null;
  isLoading: boolean;
  showAIAssistant: boolean;
  aiLoading: boolean;
  aiResponse: string;
}

export interface FamilyMissionActions {
  onEditToggle: () => void;
  onSave: () => Promise<void>;
  onValueToggle: (value: FamilyValue) => void;
  onMascotSelect: (mascot: MascotOption) => void;
  onTabChange: (tab: "mission" | "values" | "mascot" | "merchandise") => void;
  onAIAssistantToggle: () => void;
  onAIGenerate: (prompt: string) => Promise<void>;
  onInputChange: (field: keyof FamilyMissionData, value: string) => void;
}

export interface FamilyMissionContext {
  data: FamilyMissionData;
  state: FamilyMissionState;
  actions: FamilyMissionActions;
}

export interface MissionTab {
  id: "mission" | "values" | "mascot" | "merchandise";
  label: string;
  icon: React.ReactNode;
  description: string;
}

export interface AIAssistantConfig {
  enabled: boolean;
  maxPromptLength: number;
  supportedLanguages: string[];
  responseFormats: string[];
  customizationOptions: {
    tone: string[];
    style: string[];
    length: string[];
  };
}

export interface MissionTemplate {
  id: string;
  name: string;
  category: string;
  statement: string;
  tagline: string;
  motto: string;
  values: string[];
  description: string;
  tags: string[];
}

export interface MissionAnalytics {
  totalFamilies: number;
  missionsCreated: number;
  averageValuesPerMission: number;
  popularValues: Array<{ name: string; count: number }>;
  popularMascots: Array<{ name: string; count: number }>;
  completionRate: number;
  lastUpdated: string;
}

export interface MissionSharing {
  id: string;
  missionId: string;
  sharedBy: string;
  sharedWith: string[];
  message?: string;
  isPublic: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface MissionCollaboration {
  id: string;
  missionId: string;
  userId: string;
  role: "viewer" | "contributor" | "editor" | "admin";
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canShare: boolean;
    canDelete: boolean;
  };
  invitedAt: string;
  acceptedAt?: string;
}

export interface MissionVersion {
  id: string;
  missionId: string;
  version: number;
  changes: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  changedBy: string;
  changeReason?: string;
  createdAt: string;
}

export interface MissionExport {
  id: string;
  missionId: string;
  format: "pdf" | "docx" | "json" | "html";
  exportedBy: string;
  exportedAt: string;
  fileUrl?: string;
  fileSize?: number;
}

export interface MissionBackup {
  id: string;
  missionId: string;
  backupType: "manual" | "scheduled" | "auto";
  data: FamilyMissionData;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  isRestorable: boolean;
}
