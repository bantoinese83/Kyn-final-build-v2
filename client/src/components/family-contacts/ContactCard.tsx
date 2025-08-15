// ContactCard Component - Displays individual family member contact information
// Extracted from FamilyContacts.tsx to improve maintainability and reusability

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Video,
  MoreHorizontal,
  Star,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  initials: string;
  role?: string;
  location?: string;
  isOnline: boolean;
  tags: string[];
  joinedAt: string;
  isAdmin: boolean;
}

interface ContactCardProps {
  contact: FamilyMember;
  onEdit: (contact: FamilyMember) => void;
  onDelete: (contactId: string) => void;
  onMessage: (contact: FamilyMember) => void;
  onCall: (contact: FamilyMember) => void;
  onVideoCall: (contact: FamilyMember) => void;
  isCurrentUser: boolean;
  className?: string;
}

export function ContactCard({
  contact,
  onEdit,
  onDelete,
  onMessage,
  onCall,
  onVideoCall,
  isCurrentUser,
  className = "",
}: ContactCardProps) {
  const getStatusColor = () => {
    if (contact.isOnline) return "bg-green-500";
    return "bg-gray-400";
  };

  const getRoleBadgeColor = () => {
    if (contact.isAdmin) return "bg-blue-100 text-blue-800";
    if (contact.role === "parent") return "bg-purple-100 text-purple-800";
    if (contact.role === "child") return "bg-green-100 text-green-800";
    if (contact.role === "grandparent") return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  const getRoleLabel = () => {
    if (contact.isAdmin) return "Admin";
    if (contact.role === "parent") return "Parent";
    if (contact.role === "child") return "Child";
    if (contact.role === "grandparent") return "Grandparent";
    if (contact.role === "sibling") return "Sibling";
    if (contact.role === "spouse") return "Spouse";
    return contact.role || "Member";
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback className="text-sm font-medium">
                  {contact.initials}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor()}`}
                title={contact.isOnline ? "Online" : "Offline"}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg font-semibold text-dark-blue">
                  {contact.name}
                </CardTitle>
                {contact.isAdmin && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className={getRoleBadgeColor()}>
                  {getRoleLabel()}
                </Badge>
                <span className="text-sm text-gray-500">
                  Joined {contact.joinedAt}
                </span>
              </div>
            </div>
          </div>

          {!isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onMessage(contact)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCall(contact)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onVideoCall(contact)}>
                  <Video className="w-4 h-4 mr-2" />
                  Video Call
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(contact)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Contact
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(contact.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-3">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{contact.email}</span>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{contact.phone}</span>
            </div>
          )}

          {contact.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{contact.location}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {contact.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600"
              >
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600"
              >
                +{contact.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {!isCurrentUser && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Button
              onClick={() => onMessage(contact)}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Message
            </Button>
            <Button
              onClick={() => onCall(contact)}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-1" />
              Call
            </Button>
            <Button
              onClick={() => onVideoCall(contact)}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Video className="w-4 h-4 mr-1" />
              Video
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
