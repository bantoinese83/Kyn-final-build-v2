import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseDataService } from "@/services";
import {
  ArrowLeft,
  Gift,
  MessageCircle,
  User,
  Phone,
  Mail,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// TODO: Implement birthday contacts fetching from Supabase
const birthdayContacts: any = {};

const giftSuggestions = [
  {
    category: "Experience",
    items: ["Spa Day", "Concert Tickets", "Cooking Class", "Wine Tasting"],
  },
  {
    category: "Personal",
    items: ["Custom Photo Album", "Personalized Jewelry", "Monogrammed Items"],
  },
  {
    category: "Hobby",
    items: ["Art Supplies", "Books", "Gadgets", "Sports Equipment"],
  },
  {
    category: "Practical",
    items: ["Gift Cards", "Subscription Service", "Home Decor", "Electronics"],
  },
];

export function BirthdayDetails() {
  const { day } = useParams();
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title") || "Birthday";
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const dayNumber = parseInt(day || "1");

  useEffect(() => {
    if (user) {
      loadBirthdayContacts();
    }
  }, [user, dayNumber]);

  const loadBirthdayContacts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // TODO: Implement getBirthdayContacts in supabaseData service
      // For now, we'll use placeholder data
      setContacts([]);
    } catch (error) {
      console.error("Error loading birthday contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <main className="flex-1 flex flex-col max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dash
            </Link>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                🎉 {title}
              </h1>
              <p className="text-muted-foreground">
                Celebrate with your family member!
              </p>
            </div>

            {contacts.map((contact, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20 shadow-lg">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {contact.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-2xl">
                        {contact.fullName}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        Turning {contact.age} today!
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {contact.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Actions */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Contact Options
                      </h3>
                      <div className="space-y-3">
                        <Button
                          className="w-full justify-start gap-2"
                          variant="outline"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Send Birthday Message
                        </Button>
                        <Button
                          className="w-full justify-start gap-2"
                          variant="outline"
                        >
                          <Phone className="w-4 h-4" />
                          Call to Wish Happy Birthday
                        </Button>
                        <Link
                          to={`/profile/${contact.name.toLowerCase()}`}
                          className="w-full"
                        >
                          <Button
                            className="w-full justify-start gap-2"
                            variant="outline"
                          >
                            <User className="w-4 h-4" />
                            View Full Profile
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Interests */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Interests
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {contact.interests.map((interest, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Gift Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Gift Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {giftSuggestions.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium text-sm text-accent">
                        {category.category}
                      </h4>
                      <div className="space-y-1">
                        {category.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-2 rounded hover:bg-accent/5"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <Button className="w-full" size="lg">
                    <Gift className="w-4 h-4 mr-2" />
                    Send a Gift
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
