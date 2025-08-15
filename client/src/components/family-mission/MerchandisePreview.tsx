// MerchandisePreview Component - Handles merchandise preview functionality
// Extracted from FamilyMission.tsx for better modularity and maintainability

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, Coffee, Camera, Star } from "lucide-react";

interface MerchandiseItem {
  id: number;
  type: string;
  icon: React.ReactNode;
  description: string;
  mockup: string;
}

interface MerchandisePreviewProps {
  className?: string;
}

// Merchandise preview items
const merchPreview: MerchandiseItem[] = [
  {
    id: 1,
    type: "T-Shirt",
    icon: <Shirt className="w-6 h-6" />,
    description: "Custom family mission tees",
    mockup: "Family t-shirts with your mission statement and mascot",
  },
  {
    id: 2,
    type: "Coffee Mug",
    icon: <Coffee className="w-6 h-6" />,
    description: "Morning inspiration mugs",
    mockup: "Start each day with your family values",
  },
  {
    id: 3,
    type: "Wall Art",
    icon: <Camera className="w-6 h-6" />,
    description: "Beautiful family mission prints",
    mockup: "Professional prints for your home",
  },
  {
    id: 4,
    type: "Stickers",
    icon: <Star className="w-6 h-6" />,
    description: "Family mascot sticker packs",
    mockup: "Fun stickers for laptops, water bottles, and more",
  },
];

export function MerchandisePreview({
  className = "",
}: MerchandisePreviewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shirt className="w-5 h-5 text-purple-600" />
          <span>Family Merchandise</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {merchPreview.map((item) => (
            <div key={item.id} className="text-center">
              <div className="bg-gray-100 p-6 rounded-lg mb-3">
                <div className="text-gray-600 mb-2">{item.icon}</div>
                <h3 className="font-semibold text-gray-900">{item.type}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <p className="text-xs text-gray-500 italic">{item.mockup}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
