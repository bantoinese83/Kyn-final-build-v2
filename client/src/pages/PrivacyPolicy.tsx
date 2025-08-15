import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Heart,
  Users,
  Camera,
  Crown,
  Database,
  Eye,
  AlertCircle,
  UserCheck,
  Globe,
} from "lucide-react";
import { PolicySectionCard, PolicyDetailDialog } from "@/components/privacy";

export function PrivacyPolicy() {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const detailedSections = {
    "information-we-collect": {
      title: "Information We Collect",
      icon: Database,
      color: "olive-green",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Account Information
            </h3>
            <ul className="list-disc list-inside space-y-1 text-dark-blue/90">
              <li>Name, email address, and phone number</li>
              <li>Profile photo and family relationships</li>
              <li>Birthday and basic demographic information</li>
              <li>Account preferences and settings</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Content You Share
            </h3>
            <ul className="list-disc list-inside space-y-1 text-dark-blue/90">
              <li>Photos, videos, and media uploads</li>
              <li>Messages and family communications</li>
              <li>Calendar events and family activities</li>
              <li>Profile information and family stories</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Technical Information
            </h3>
            <ul className="list-disc list-inside space-y-1 text-dark-blue/90">
              <li>Device information and IP address</li>
              <li>Browser type and operating system</li>
              <li>Usage patterns and feature interactions</li>
              <li>Error logs and performance data</li>
            </ul>
          </div>
        </div>
      ),
    },
    "how-we-use": {
      title: "How We Use Your Information",
      icon: Eye,
      color: "warm-brown",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Service Provision
            </h3>
            <ul className="list-disc list-inside space-y-1 text-dark-blue/90">
              <li>Provide and maintain the Kyn platform</li>
              <li>Enable family communication and sharing</li>
              <li>Sync data across your devices</li>
              <li>Process your requests and provide support</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Platform Improvement
            </h3>
            <ul className="list-disc list-inside space-y-1 text-dark-blue/90">
              <li>Analyze usage patterns to improve features</li>
              <li>Fix bugs and enhance performance</li>
              <li>Develop new family-focused features</li>
              <li>Ensure platform security and reliability</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">Communication</h3>
            <ul className="list-disc list-inside space-y-1 text-dark-blue/90">
              <li>Send important service updates</li>
              <li>Notify you of new features or changes</li>
              <li>Provide customer support responses</li>
              <li>Share family activity notifications (if enabled)</li>
            </ul>
          </div>
        </div>
      ),
    },
    "when-we-share": {
      title: "When We May Share Information",
      icon: AlertCircle,
      color: "red-600",
      content: (
        <div className="space-y-4">
          <div className="bg-red-100 p-4 rounded-lg border border-red-200">
            <h3 className="font-bold text-red-800 mb-2">
              We DO NOT sell your data, but may share information in these
              limited cases:
            </h3>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Service Providers
            </h3>
            <p className="text-dark-blue/90 leading-relaxed">
              We work with trusted third-party services (like cloud hosting,
              email delivery, or payment processing) that help us operate Kyn.
              These providers have strict contractual obligations to protect
              your data and can only use it for the specific services they
              provide to us.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Legal Requirements
            </h3>
            <p className="text-dark-blue/90 leading-relaxed">
              We may disclose information if required by law, court order, or to
              protect the safety of our users. This includes cooperating with
              law enforcement when legally obligated, but we will always notify
              affected users unless prohibited by law.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Business Transfers
            </h3>
            <p className="text-dark-blue/90 leading-relaxed">
              If Kyn is acquired by or merged with another company, user
              information may be transferred as part of that transaction, but
              the new entity would be bound by this privacy policy.
            </p>
          </div>
        </div>
      ),
    },
    "data-rights": {
      title: "Your Data Rights and Controls",
      icon: UserCheck,
      color: "olive-green",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Access and Portability
            </h3>
            <ul className="list-disc list-inside space-y-1 text-dark-blue/90">
              <li>Request a copy of your personal data</li>
              <li>Export your photos, messages, and content</li>
              <li>View what information we have about you</li>
              <li>Download your family's shared content</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Correction and Deletion
            </h3>
            <ul className="list-disc list-inside space-y-1 text-dark-blue/90">
              <li>Update your profile and account information</li>
              <li>Delete specific posts, photos, or messages</li>
              <li>Request correction of inaccurate information</li>
              <li>Delete your entire account and associated data</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Privacy Controls
            </h3>
            <ul className="list-disc list-inside space-y-1 text-dark-blue/90">
              <li>Control who can see your content within your family</li>
              <li>Manage notification preferences</li>
              <li>Set data sharing preferences</li>
              <li>Enable or disable specific features</li>
            </ul>
          </div>
        </div>
      ),
    },
    "data-retention": {
      title: "Data Retention and Deletion",
      icon: Database,
      color: "warm-brown",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              How Long We Keep Your Data
            </h3>
            <ul className="list-disc list-inside space-y-1 text-dark-blue/90">
              <li>Account data: Retained while your account is active</li>
              <li>Messages and photos: Retained until you delete them</li>
              <li>Usage analytics: Anonymized after 2 years</li>
              <li>
                Support tickets: Retained for 3 years for quality purposes
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Account Deletion
            </h3>
            <p className="text-dark-blue/90 leading-relaxed">
              When you delete your account, we will remove your personal
              information within 30 days. Some information may be retained for
              legal or operational purposes (like financial records or fraud
              prevention), but this will be anonymized when possible.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Family Shared Content
            </h3>
            <p className="text-dark-blue/90 leading-relaxed">
              Content you've shared with family members (like photos in shared
              albums) may remain visible to other family members even after you
              delete your account, unless you specifically remove individual
              items before deleting your account.
            </p>
          </div>
        </div>
      ),
    },
    "international-compliance": {
      title: "International Users and Compliance",
      icon: Globe,
      color: "light-blue-gray",
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              GDPR Compliance (European Users)
            </h3>
            <p className="text-dark-blue/90 leading-relaxed">
              If you're in the European Economic Area, you have additional
              rights under GDPR including the right to object to processing,
              request data portability, and file complaints with your local data
              protection authority.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              CCPA Compliance (California Users)
            </h3>
            <p className="text-dark-blue/90 leading-relaxed">
              California residents have the right to know what personal
              information we collect, the right to delete personal information,
              and the right to opt-out of sale of personal information (though
              we don't sell personal information anyway).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-blue mb-2">
              Data Transfers
            </h3>
            <p className="text-dark-blue/90 leading-relaxed">
              Your data may be processed in countries outside your home country.
              We ensure appropriate safeguards are in place to protect your
              information during international transfers.
            </p>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-dark-blue hover:text-olive-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Signup
          </Link>
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-royal-purple/20 to-navy-blue/20 rounded-full blur-xl scale-150"></div>
              <div className="relative text-4xl text-royal-purple drop-shadow-lg p-4 bg-gradient-to-br from-cream-white to-light-blue-gray/20 rounded-full shadow-lg">
                <Shield className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-tenor font-normal text-dark-blue mb-2">
              Privacy Policy
            </h1>
            <p className="text-light-blue-gray text-lg">
              How we protect and cherish your family's privacy
            </p>
            <div className="mt-2 inline-block bg-royal-purple/10 text-royal-purple border border-royal-purple/30 px-3 py-1 rounded-full text-sm">
              Last Updated: December 2024
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Our Commitment */}
          <div className="bg-white border-2 border-royal-purple/30 bg-gradient-to-br from-cream-white to-royal-purple/5 shadow-lg rounded-lg p-6">
            <div className="space-y-6">
              <h2 className="text-dark-blue flex items-center gap-2 text-xl font-semibold">
                <Shield className="w-5 h-5 text-royal-purple" />
                Our Sacred Promise to Your Family
              </h2>

              <div className="bg-royal-purple/10 p-6 rounded-lg border border-royal-purple/20">
                <h3 className="font-bold text-royal-purple mb-3 text-xl">
                  🔒 We Will NEVER Sell Your Data
                </h3>
                <p className="text-dark-blue/90 leading-relaxed text-lg">
                  Your family's personal information, photos, messages, and
                  precious memories are not for sale. Ever. We do not sell,
                  rent, or lease your personal information to anyone. Your
                  privacy is the foundation of our mission.
                </p>
              </div>

              <p className="text-dark-blue/90 leading-relaxed text-lg">
                At Kyn, we understand that your family's privacy is sacred. This
                policy explains how we protect, cherish, and handle your
                information when you use our family connection platform.
              </p>
            </div>
          </div>

          {/* Content Ownership */}
          <div className="bg-white border-3 border-warm-brown/40 bg-gradient-to-br from-cream-white to-warm-brown/5 shadow-xl ring-2 ring-warm-brown/20 rounded-lg p-6">
            <div className="space-y-6">
              <h2 className="text-dark-blue flex items-center gap-2 text-xl font-semibold">
                <Camera className="w-6 h-6 text-warm-brown" />
                Your Content Belongs to YOU - Not Us
              </h2>

              <div className="bg-warm-brown/15 p-6 rounded-xl border border-warm-brown/30">
                <h3 className="font-bold text-warm-brown mb-4 text-xl flex items-center gap-2">
                  <Crown className="w-6 h-6" />
                  Unlike Other Social Platforms, You Own Everything
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-dark-blue text-lg">
                      Other Platforms:
                    </h4>
                    <ul className="space-y-2 text-dark-blue/80">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Platform owns rights to your photos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Can use your content for advertising</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Data sold to third parties</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-dark-blue text-lg">
                      Kyn Platform:
                    </h4>
                    <ul className="space-y-2 text-dark-blue/80">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>You own 100% of your content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Never used for advertising</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Data never sold or shared</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Sections Grid */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-dark-blue text-center">
              Detailed Privacy Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(detailedSections).map(([id, section]) => (
                <PolicySectionCard
                  key={id}
                  section={{
                    id,
                    title: section.title,
                    icon: section.icon,
                    color: section.color,
                    content: section.content,
                  }}
                  onOpenDialog={setOpenDialog}
                />
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border-2 border-olive-green/30 bg-gradient-to-br from-cream-white to-olive-green/5 shadow-lg rounded-lg p-6">
            <div className="text-center space-y-4">
              <h2 className="text-dark-blue flex items-center justify-center gap-2 text-xl font-semibold">
                <Heart className="w-5 h-5 text-olive-green" />
                Questions About Privacy?
              </h2>
              <p className="text-dark-blue/90 leading-relaxed">
                We're here to help! If you have any questions about this privacy
                policy or how we protect your family's information, please don't
                hesitate to reach out.
              </p>
              <div className="flex justify-center space-x-4">
                <div className="text-center">
                  <Users className="w-8 h-8 text-olive-green mx-auto mb-2" />
                  <p className="text-sm font-medium text-dark-blue">
                    Family Support
                  </p>
                  <p className="text-xs text-gray-600">privacy@kyn.family</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-olive-green mx-auto mb-2" />
                  <p className="text-sm font-medium text-dark-blue">
                    Security Team
                  </p>
                  <p className="text-xs text-gray-600">security@kyn.family</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Detail Dialog */}
      <PolicyDetailDialog
        section={openDialog ? detailedSections[openDialog] : null}
        isOpen={!!openDialog}
        onClose={() => setOpenDialog(null)}
      />
    </div>
  );
}
