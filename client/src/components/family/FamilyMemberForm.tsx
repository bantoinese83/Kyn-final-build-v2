// FamilyMemberForm Component - Handles family member and pet management
// Extracted from CreateFamily.tsx to improve maintainability and reusability

import {
  Plus,
  X,
  Upload,
  Camera,
  Baby,
  Dog,
  Cat,
  Bird,
  Fish,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FamilyMember {
  id: string;
  name: string;
  type: "child" | "pet";
  dateOfBirth: string;
  profilePicture: string | null;
  petType?: string;
}

interface FamilyMemberFormProps {
  members: FamilyMember[];
  onAddMember: (type: "child" | "pet") => void;
  onRemoveMember: (id: string) => void;
  onUpdateMember: (id: string, field: string, value: string) => void;
  onImageUpload: (
    id: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  className?: string;
}

export function FamilyMemberForm({
  members,
  onAddMember,
  onRemoveMember,
  onUpdateMember,
  onImageUpload,
  className = "",
}: FamilyMemberFormProps) {
  const getPetTypeIcon = (petType: string) => {
    const iconMap: { [key: string]: any } = {
      dog: Dog,
      cat: Cat,
      bird: Bird,
      fish: Fish,
    };
    return iconMap[petType] || Dog;
  };

  const getMemberIcon = (type: "child" | "pet") => {
    return type === "child" ? Baby : Dog;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Family Members & Pets
          </h3>
          <p className="text-sm text-gray-600">
            Add children and pets to your family (up to 16 total)
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => onAddMember("child")}
            disabled={members.length >= 16}
            className="flex items-center space-x-2"
          >
            <Baby className="h-4 w-4" />
            <span>Add Child</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onAddMember("pet")}
            disabled={members.length >= 16}
            className="flex items-center space-x-2"
          >
            <Dog className="h-4 w-4" />
            <span>Add Pet</span>
          </Button>
        </div>
      </div>

      {members.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No family members yet
            </h4>
            <p className="text-gray-600 mb-4">
              Start building your family by adding children and pets
            </p>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => onAddMember("child")}
                className="flex items-center space-x-2"
              >
                <Baby className="h-4 w-4" />
                <span>Add Child</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => onAddMember("pet")}
                className="flex items-center space-x-2"
              >
                <Dog className="h-4 w-4" />
                <span>Add Pet</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => {
            const MemberIcon = getMemberIcon(member.type);
            const PetTypeIcon =
              member.type === "pet" && member.petType
                ? getPetTypeIcon(member.petType)
                : null;

            return (
              <Card key={member.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MemberIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        {member.type === "child" ? "Child" : "Pet"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveMember(member.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Profile Picture */}
                  <div className="flex justify-center">
                    <div className="relative">
                      {member.profilePicture ? (
                        <img
                          src={member.profilePicture}
                          alt={member.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                          <MemberIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onImageUpload(member.id, e)}
                          className="hidden"
                        />
                        <Camera className="h-3 w-3" />
                      </label>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`name-${member.id}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Name
                    </Label>
                    <Input
                      id={`name-${member.id}`}
                      value={member.name}
                      onChange={(e) =>
                        onUpdateMember(member.id, "name", e.target.value)
                      }
                      placeholder={
                        member.type === "child" ? "Child's name" : "Pet's name"
                      }
                    />
                  </div>

                  {/* Pet Type (for pets only) */}
                  {member.type === "pet" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor={`petType-${member.id}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Pet Type
                      </Label>
                      <Select
                        value={member.petType || "dog"}
                        onValueChange={(value) =>
                          onUpdateMember(member.id, "petType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">
                            <div className="flex items-center space-x-2">
                              <Dog className="h-4 w-4" />
                              <span>Dog</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="cat">
                            <div className="flex items-center space-x-2">
                              <Cat className="h-4 w-4" />
                              <span>Cat</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="bird">
                            <div className="flex items-center space-x-2">
                              <Bird className="h-4 w-4" />
                              <span>Bird</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="fish">
                            <div className="flex items-center space-x-2">
                              <Fish className="h-4 w-4" />
                              <span>Fish</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`dateOfBirth-${member.id}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      {member.type === "child" ? "Date of Birth" : "Birthday"}
                    </Label>
                    <Input
                      id={`dateOfBirth-${member.id}`}
                      type="date"
                      value={formatDate(member.dateOfBirth)}
                      onChange={(e) =>
                        onUpdateMember(member.id, "dateOfBirth", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {members.length > 0 && members.length < 16 && (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            {members.length} of 16 members added
          </p>
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onAddMember("child")}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Child</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onAddMember("pet")}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another Pet</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
