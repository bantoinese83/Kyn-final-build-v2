import { useState, useEffect } from "react";
import { AuthCallToAction } from "@/components/AuthCallToAction";
import { Link } from "react-router-dom";
import { Shield, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseDataService } from "@/services";
import { ResourceCard, ResourceForm } from "@/components/resources";

interface ResourceCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  itemCount: number;
}

interface ResourceVendor {
  id: string;
  name: string;
  description: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  tags: string[];
  isVerified: boolean;
  isEmergencyContact: boolean;
  averageRating: number;
  reviewCount: number;
  category: {
    id: string;
    title: string;
    icon: string;
  };
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export function Resources() {
  const { user, loading: authLoading } = useAuth();

  // Show call-to-action if not authenticated
  if (!authLoading && !user) {
    return (
      <AuthCallToAction
        icon={<Shield />}
        title="Find Trusted Family Resources & Vendors"
        description="Share trusted service providers, get family recommendations, and build a directory of reliable resources for all your family needs."
        features={[
          "Share trusted vendors and service providers",
          "Get family recommendations for reliable services",
          "Review and rate service providers together",
          "Access emergency contacts when you need them most",
          "Build a family directory of trusted resources",
          "Save money with family-vetted recommendations",
        ]}
        accentColor="#5D6739"
        bgGradient="from-green-50 to-teal-50"
      />
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const [activeView, setActiveView] = useState<
    "categories" | "vendors" | "emergency"
  >("categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showAddVendorDialog, setShowAddVendorDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState<ResourceVendor | null>(
    null,
  );

  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [vendors, setVendors] = useState<ResourceVendor[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<ResourceVendor[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentFamily, setCurrentFamily] = useState<any>(null);

  const [newCategory, setNewCategory] = useState({
    title: "",
    icon: "",
    description: "",
  });

  const [newVendor, setNewVendor] = useState({
    categoryId: "",
    name: "",
    description: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    tags: "",
    isVerified: false,
    isEmergencyContact: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadResourceData();
  }, [selectedCategory, showVerifiedOnly]);

  const loadResourceData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      // Get user's families
      const familiesResult = await supabaseDataService.getUserFamilies(userId);
      if (
        !familiesResult.success ||
        !familiesResult.data ||
        familiesResult.data.length === 0
      )
        return;

      const primaryFamily = familiesResult.data[0];
      setCurrentFamily(primaryFamily);

      // TODO: Implement resource-related methods in supabaseData service
      // For now, we'll use placeholder data
      const categoriesData: any[] = [];
      const vendorsData: any[] = [];
      const emergencyData: any[] = [];

      setCategories(categoriesData);
      setVendors(vendorsData);
      setEmergencyContacts(emergencyData);
    } catch (error) {
      console.error("Error loading resource data:", error);
      toast({
        title: "Error",
        description: "Failed to load resources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (
      !newCategory.title.trim() ||
      !newCategory.description.trim() ||
      !currentFamily
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const categoryData = {
        familyId: currentFamily.id,
        ...newCategory,
      };

      // TODO: Implement createResourceCategory in supabaseData service
      const createdCategory = null;

      // Add to local state
      setCategories([createdCategory, ...categories]);

      // Reset form
      setNewCategory({
        title: "",
        icon: "",
        description: "",
      });

      setShowAddCategoryDialog(false);

      toast({
        title: "Category Created!",
        description: "New resource category has been added successfully.",
      });
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateVendor = async () => {
    if (
      !newVendor.name.trim() ||
      !newVendor.description.trim() ||
      !newVendor.categoryId ||
      !currentFamily
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const vendorData = {
        familyId: currentFamily.id,
        userId,
        ...newVendor,
        tags: newVendor.tags
          ? newVendor.tags.split(",").map((t) => t.trim())
          : [],
        website: newVendor.website || undefined,
        phone: newVendor.phone || undefined,
        email: newVendor.email || undefined,
        address: newVendor.address || undefined,
      };

      // TODO: Implement createResourceVendor in supabaseData service
      const createdVendor = null;

      // Add to local state
      setVendors([createdVendor, ...vendors]);

      // Reset form
      setNewVendor({
        categoryId: "",
        name: "",
        description: "",
        website: "",
        phone: "",
        email: "",
        address: "",
        tags: "",
        isVerified: false,
        isEmergencyContact: false,
      });

      setShowAddVendorDialog(false);

      toast({
        title: "Vendor Added!",
        description: "New resource vendor has been added successfully.",
      });
    } catch (error) {
      console.error("Error creating vendor:", error);
      toast({
        title: "Error",
        description: "Failed to create vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVendor = (vendor: ResourceVendor) => {
    setEditingVendor(vendor);
    setShowAddVendorDialog(true);
  };

  const handleDeleteVendor = async (vendor: ResourceVendor) => {
    setVendors(vendors.filter((v) => v.id !== vendor.id));
  };

  const handleFavoriteVendor = async (_vendor: ResourceVendor) => {};
  const handleContactVendor = async (_vendor: ResourceVendor) => {};
  const handleSaveVendor = async (_data: any) => {
    setEditingVendor(null);
    setShowAddVendorDialog(false);
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || vendor.category.id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (!currentFamily) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-dark-blue mb-2">
              No Family Found
            </h1>
            <p className="text-muted-foreground mb-6">
              Please create or join a family first.
            </p>
            <Button asChild>
              <Link to="/create-family">Create Family</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-2"
            >
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-dark-blue">
              Family Resources
            </h1>
            <p className="text-muted-foreground">
              Trusted vendors, services, and emergency contacts for your family
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddCategoryDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
            <Button
              onClick={() => setShowAddVendorDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: "categories", label: "Categories", count: categories.length },
            { id: "vendors", label: "Resources", count: vendors.length },
            {
              id: "emergency",
              label: "Emergency",
              count: emergencyContacts.length,
            },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeView === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView(tab.id as any)}
              className="flex-1"
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={showVerifiedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            >
              Verified Only
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-lg text-muted-foreground">
                Loading resources...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Categories View */}
            {activeView === "categories" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No categories yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start by creating your first resource category
                    </p>
                    <Button
                      onClick={() => setShowAddCategoryDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Category
                    </Button>
                  </div>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-3">{category.icon}</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {category.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {category.description}
                        </p>
                        <div className="text-sm text-gray-500">
                          {category.itemCount} resources
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Vendors View */}
            {activeView === "vendors" && (
              <div className="space-y-6">
                {vendors.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No resources yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first trusted resource
                    </p>
                    <Button
                      onClick={() => setShowAddVendorDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Resource
                    </Button>
                  </div>
                ) : (
                  vendors
                    .filter((vendor) => {
                      const matchesSearch =
                        vendor.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        vendor.description
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase());
                      const matchesCategory =
                        selectedCategory === "all" ||
                        vendor.category.id === selectedCategory;
                      const matchesVerified =
                        !showVerifiedOnly || vendor.isVerified;
                      return (
                        matchesSearch && matchesCategory && matchesVerified
                      );
                    })
                    .map((vendor) => (
                      <ResourceCard
                        key={vendor.id}
                        resource={vendor}
                        onEdit={handleEditVendor}
                        onDelete={(resourceId) => {
                          const vendor = vendors.find(
                            (v) => v.id === resourceId,
                          );
                          if (vendor) handleDeleteVendor(vendor);
                        }}
                        onFavorite={(resourceId) => {
                          const vendor = vendors.find(
                            (v) => v.id === resourceId,
                          );
                          if (vendor) handleFavoriteVendor(vendor);
                        }}
                        onContact={handleContactVendor}
                      />
                    ))
                )}
              </div>
            )}

            {/* Emergency Contacts View */}
            {activeView === "emergency" && (
              <div className="space-y-6">
                {emergencyContacts.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No emergency contacts yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Add emergency contacts for urgent situations
                    </p>
                    <Button
                      onClick={() => setShowAddVendorDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Emergency Contact
                    </Button>
                  </div>
                ) : (
                  emergencyContacts
                    .filter((contact) => {
                      const matchesSearch =
                        contact.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        contact.description
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase());
                      return matchesSearch;
                    })
                    .map((contact) => (
                      <ResourceCard
                        key={contact.id}
                        resource={contact}
                        onEdit={handleEditVendor}
                        onDelete={(resourceId) => {
                          const contact = emergencyContacts.find(
                            (v) => v.id === resourceId,
                          );
                          if (contact) handleDeleteVendor(contact);
                        }}
                        onFavorite={(resourceId) => {
                          const contact = emergencyContacts.find(
                            (v) => v.id === resourceId,
                          );
                          if (contact) handleFavoriteVendor(contact);
                        }}
                        onContact={handleContactVendor}
                      />
                    ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Resource Dialog */}
      {(showAddVendorDialog || editingVendor) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ResourceForm
              resource={editingVendor}
              categories={categories}
              onSave={handleSaveVendor}
              onCancel={() => {
                setShowAddVendorDialog(false);
                setEditingVendor(null);
              }}
              isEditing={!!editingVendor}
            />
          </div>
        </div>
      )}
    </div>
  );
}
