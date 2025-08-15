import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Shield,
  Users,
  Clock,
  MessageCircle,
  Calendar,
  Camera,
  Gift,
  Baby,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dash
          </Link>
        </div>

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F04caa7491bc2476fb971d605ad425587%2F168b5b3f9b8841d8b7c2cd0ba92279cb?format=webp&width=800"
                alt="Kyn Logo"
                className="w-20 h-20 object-contain"
              />
              <h1 className="text-4xl font-tenor font-normal text-foreground">
                Kyn
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A private family social media app designed to strengthen bonds and
              create lasting memories together.
            </p>
          </div>

          {/* Mission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Heart className="w-6 h-6 text-red-500" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Kyn brings families closer together in a safe, private
                environment free from the distractions and pressures of
                traditional social media. We believe that family connections
                should be genuine, meaningful, and focused on what truly matters
                - each other.
              </p>
            </CardContent>
          </Card>

          {/* Safe for All Ages */}
          <Card className="border-2 border-warm-brown/20 bg-gradient-to-r from-warm-brown/5 to-olive-green/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-dark-blue">
                <Baby className="w-6 h-6 text-warm-brown" />
                Safe for Children & Young Adults
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-dark-blue leading-relaxed">
                Kyn is thoughtfully designed to be a safe, nurturing environment
                where children and young adults can discover their family
                heritage and build meaningful connections across generations.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-olive-green mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-dark-blue mb-2">
                        Protected Environment
                      </h3>
                      <p className="text-dark-blue/70 text-sm">
                        Family-only network with no strangers, external
                        advertising, or inappropriate content. Parents maintain
                        full oversight and control.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-6 h-6 text-warm-brown mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-dark-blue mb-2">
                        Educational & Enriching
                      </h3>
                      <p className="text-dark-blue/70 text-sm">
                        Children learn about their heritage, family history, and
                        cultural traditions in an engaging, age-appropriate
                        format.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-dark-blue mb-2">
                        Deeper Family Bonds
                      </h3>
                      <p className="text-dark-blue/70 text-sm">
                        Young family members discover stories, traditions, and
                        connections they never knew existed, fostering respect
                        and appreciation for their elders.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-6 h-6 text-light-blue-gray mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-dark-blue mb-2">
                        Multi-Generational Connection
                      </h3>
                      <p className="text-dark-blue/70 text-sm">
                        Grandparents share wisdom and memories while children
                        contribute fresh perspectives, creating bridges across
                        generations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-dark-blue mb-2">
                        No Social Pressure
                      </h3>
                      <p className="text-dark-blue/70 text-sm">
                        Unlike traditional social media, there are no likes,
                        follower counts, or peer pressure - just authentic
                        family relationships and genuine connections.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Camera className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-dark-blue mb-2">
                        Identity & Belonging
                      </h3>
                      <p className="text-dark-blue/70 text-sm">
                        Children develop a stronger sense of identity and
                        belonging as they understand their place in the family
                        story and cultural heritage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-olive-green/10 p-6 rounded-lg border border-olive-green/20">
                <h3 className="font-bold text-dark-blue mb-3 text-center text-lg">
                  Perfect for Today's Digital Natives
                </h3>
                <p className="text-dark-blue/80 text-center leading-relaxed">
                  While children and teens are comfortable with technology, Kyn
                  gives them a meaningful way to connect with their roots. They
                  discover that their great-grandmother was a teacher, learn
                  about family recipes passed down for generations, and hear
                  stories of resilience and adventure that inspire them. It's
                  technology that enriches rather than isolates.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">What Makes Kyn Special</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">100% Private</h3>
                    <p className="text-muted-foreground">
                      Your family moments stay within your family. No ads, no
                      data mining, no external access.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Family-Only Network</h3>
                    <p className="text-muted-foreground">
                      Connect only with verified family members in a closed,
                      secure environment.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle
                    className="w-6 h-6 mt-1"
                    style={{ color: "#5D6739" }}
                  />
                  <div>
                    <h3 className="font-semibold mb-2">Nostalgic Messaging</h3>
                    <p className="text-muted-foreground">
                      AOL Instant Messenger-inspired features with away messages
                      and real-time status updates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-orange-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">No Pressure</h3>
                    <p className="text-muted-foreground">
                      No likes, no follower counts, no competition - just
                      genuine family connections.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-red-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Family Events</h3>
                    <p className="text-muted-foreground">
                      Organize gatherings, track birthdays, and coordinate
                      family activities effortlessly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Camera className="w-6 h-6 text-teal-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Memory Sharing</h3>
                    <p className="text-muted-foreground">
                      Share photos, videos, and stories that become part of your
                      family's digital legacy.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-accent">Communication</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Private messaging</li>
                    <li>• Group family chats</li>
                    <li>• Away messages</li>
                    <li>• Online/offline status</li>
                    <li>• Family fun facts</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-accent">Events & Calendar</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Birthday reminders</li>
                    <li>• Event planning & RSVP</li>
                    <li>• Monthly calendar view</li>
                    <li>• Family milestone tracking</li>
                    <li>• Anniversary notifications</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-accent">Content Sharing</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Photo & video sharing</li>
                    <li>• Family recipe collection</li>
                    <li>• Music playlists</li>
                    <li>• Health history tracking</li>
                    <li>• Achievement celebrations</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-accent">Activities</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Family game nights</li>
                    <li>• Fitness challenges</li>
                    <li>• Polls & voting</li>
                    <li>• Movie recommendations</li>
                    <li>• Book clubs</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-accent">Organization</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Family tree management</li>
                    <li>• Contact directories</li>
                    <li>• Medical information</li>
                    <li>• Important documents</li>
                    <li>• Legacy preservation</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-accent">Celebrations</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Birthday gift suggestions</li>
                    <li>• Achievement recognition</li>
                    <li>• Family history sharing</li>
                    <li>• Holiday planning</li>
                    <li>• Memory preservation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Philosophy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Gift className="w-6 h-6" style={{ color: "#BD692B" }} />
                Our Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent/5 p-4 rounded-lg border-l-4 border-accent">
                <p className="text-lg italic text-foreground">
                  "Family is one of nature's masterpieces."
                </p>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                At Kyn, we believe that technology should bring families closer
                together, not drive them apart. Our platform is designed with
                intention - every feature serves the purpose of strengthening
                family bonds and creating meaningful connections across
                generations.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                We reject the attention-grabbing, comparison-driven model of
                traditional social media. Instead, we focus on genuine moments,
                real conversations, and the simple joy of staying connected with
                the people who matter most.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We'd love to hear from you! Whether you have questions,
                feedback, or just want to share how Kyn has impacted your
                family.
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Support:</strong> support@kyn.family
                </p>
                <p>
                  <strong>Feedback:</strong> feedback@kyn.family
                </p>
                <p>
                  <strong>Privacy Questions:</strong> privacy@kyn.family
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
