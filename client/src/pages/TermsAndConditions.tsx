import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Users,
  AlertTriangle,
  Scale,
  Eye,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TermsAndConditions() {
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
              <div className="absolute inset-0 bg-gradient-to-br from-olive-green/20 to-warm-brown/20 rounded-full blur-xl scale-150"></div>
              <div className="relative text-4xl text-olive-green drop-shadow-lg p-4 bg-gradient-to-br from-cream-white to-light-blue-gray/20 rounded-full shadow-lg">
                <Scale className="w-8 h-8" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-tenor font-normal text-dark-blue mb-2">
              Terms and Conditions
            </h1>
            <p className="text-light-blue-gray text-lg">
              Legal terms for using Kyn
            </p>
            <Badge className="mt-2 bg-olive-green/10 text-olive-green border-olive-green/30">
              Last Updated: December 2024
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Agreement */}
          <Card className="border-2 border-warm-brown/30 bg-gradient-to-br from-cream-white to-warm-brown/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-dark-blue flex items-center gap-2">
                <FileText className="w-5 h-5 text-warm-brown" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-dark-blue/90 leading-relaxed">
                By accessing and using Kyn ("the Service"), you agree to be
                bound by these Terms and Conditions. If you do not agree to
                these terms, please do not use our service.
              </p>
              <p className="text-dark-blue/90 leading-relaxed">
                Kyn is a family connection platform designed to help families
                stay connected, share memories, and strengthen relationships.
                These terms govern your use of our service and protect both you
                and the Kyn community.
              </p>
            </CardContent>
          </Card>

          {/* User Conduct */}
          <Card className="border-2 border-navy-blue/30 bg-gradient-to-br from-cream-white to-navy-blue/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-dark-blue flex items-center gap-2">
                <Users className="w-5 h-5 text-navy-blue" />
                User Conduct and Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  You agree to:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-dark-blue/90">
                  <li>
                    Use Kyn only for lawful purposes and in accordance with
                    these terms
                  </li>
                  <li>
                    Provide accurate and truthful information in your profile
                    and posts
                  </li>
                  <li>
                    Respect other family members and maintain a positive
                    environment
                  </li>
                  <li>
                    Keep your account credentials secure and not share them with
                    others
                  </li>
                  <li>
                    Report any inappropriate content or behavior to our support
                    team
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  You agree NOT to:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-dark-blue/90">
                  <li>
                    Share sensitive personal information such as Social Security
                    numbers, passwords, or financial details
                  </li>
                  <li>
                    Post content that is illegal, harmful, threatening, or
                    discriminatory
                  </li>
                  <li>Impersonate another person or create fake accounts</li>
                  <li>
                    Attempt to hack, disrupt, or compromise the security of our
                    platform
                  </li>
                  <li>
                    Use automated tools or bots to access or interact with the
                    service
                  </li>
                  <li>
                    Share content that violates intellectual property rights
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Content and Data */}
          <Card className="border-2 border-royal-purple/30 bg-gradient-to-br from-cream-white to-royal-purple/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-dark-blue flex items-center gap-2">
                <Shield className="w-5 h-5 text-royal-purple" />
                Your Content and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  Content Ownership
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  You retain ownership of all content you post on Kyn, including
                  photos, messages, and personal information. By using our
                  service, you grant Kyn a limited license to display, store,
                  and transmit your content solely for the purpose of providing
                  our family connection services.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  Data Protection Commitment
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  <strong>We will never sell your personal data.</strong> Your
                  family information, photos, messages, and personal details are
                  private and will not be sold to third parties, advertisers, or
                  data brokers. We may share anonymized, aggregated data for
                  research purposes, but this will never include personally
                  identifiable information.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  Content Moderation
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  While we strive to maintain a safe environment, Kyn is not
                  responsible for content posted by users. We reserve the right
                  to remove content that violates these terms, but we do not
                  actively monitor all user communications. Family members are
                  responsible for their own posts and interactions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Platform Availability */}
          <Card className="border-2 border-olive-green/30 bg-gradient-to-br from-cream-white to-olive-green/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-dark-blue flex items-center gap-2">
                <Eye className="w-5 h-5 text-olive-green" />
                Service Availability and Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  Service Availability
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  We strive to keep Kyn available 24/7, but we cannot guarantee
                  uninterrupted service. We may occasionally need to perform
                  maintenance, updates, or address technical issues that could
                  temporarily affect service availability.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  Technical Support
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  We provide technical support for platform-related issues, but
                  we are not responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-dark-blue/90 mt-2">
                  <li>Personal disputes between family members</li>
                  <li>Content disagreements or family conflicts</li>
                  <li>Issues with your internet connection or device</li>
                  <li>Third-party integrations or external services</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Security Warning */}
          <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-cream-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Important Security Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-100 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">
                  ⚠️ DO NOT SHARE:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  <li>Social Security numbers or government ID numbers</li>
                  <li>
                    Bank account information, credit card numbers, or PINs
                  </li>
                  <li>Passwords or security codes</li>
                  <li>Home security codes or spare key locations</li>
                  <li>Detailed travel plans or home absence schedules</li>
                  <li>Children's school information or schedules</li>
                  <li>Medical records or sensitive health information</li>
                </ul>
              </div>

              <p className="text-red-700 leading-relaxed">
                <strong>Remember:</strong> While Kyn is designed for family use,
                treat all online communications with caution. Even family
                platforms can be compromised, and shared information could
                potentially be seen by unintended recipients.
              </p>
            </CardContent>
          </Card>

          {/* Legal Protection */}
          <Card className="border-2 border-light-blue-gray/30 bg-gradient-to-br from-cream-white to-light-blue-gray/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-dark-blue flex items-center gap-2">
                <Scale className="w-5 h-5 text-light-blue-gray" />
                Legal Protections and Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">
                  ⚠️ IMPORTANT LEGAL NOTICE
                </h3>
                <p className="text-red-700 leading-relaxed font-medium">
                  BY USING KYN, YOU ACKNOWLEDGE AND AGREE THAT YOU USE THIS
                  SERVICE ENTIRELY AT YOUR OWN RISK. KYN AND ITS OWNERS,
                  OPERATORS, EMPLOYEES, AND AFFILIATES SHALL NOT BE HELD
                  RESPONSIBLE OR LIABLE FOR ANY ISSUES, PROBLEMS, DAMAGES,
                  LOSSES, OR HARDSHIPS THAT MAY ARISE FROM YOUR USE OF THIS
                  APPLICATION.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  Complete Limitation of Liability
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  <strong>
                    Kyn is provided "AS IS" and "AS AVAILABLE" without any
                    warranties, express or implied.
                  </strong>
                  We expressly disclaim all warranties including but not limited
                  to warranties of merchantability, fitness for a particular
                  purpose, and non-infringement. We make no representations
                  about the accuracy, reliability, completeness, or timeliness
                  of the service.
                </p>
                <p className="text-dark-blue/90 leading-relaxed mt-2">
                  <strong>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, KYN SHALL NOT BE
                    LIABLE FOR:
                  </strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-dark-blue/90 mt-2 text-sm">
                  <li>
                    Any direct, indirect, incidental, special, consequential, or
                    punitive damages
                  </li>
                  <li>
                    Any loss of profits, revenue, data, or business
                    opportunities
                  </li>
                  <li>
                    Any personal injury, emotional distress, or psychological
                    harm
                  </li>
                  <li>
                    Any technical issues, software bugs, or system failures
                  </li>
                  <li>Any unauthorized access to or alteration of your data</li>
                  <li>
                    Any family disputes, relationship conflicts, or personal
                    disagreements
                  </li>
                  <li>Any legal issues arising from content shared by users</li>
                  <li>
                    Any consequences of decisions made based on information from
                    the platform
                  </li>
                  <li>
                    Any damages resulting from third-party actions or
                    integrations
                  </li>
                  <li>
                    Any issues with internet connectivity or device
                    compatibility
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  User Responsibility and Assumption of Risk
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  <strong>You acknowledge and agree that:</strong> You are
                  solely responsible for your use of Kyn and all consequences
                  thereof. You assume all risks associated with using this
                  platform, including but not limited to risks related to data
                  privacy, family relationships, financial decisions, health
                  information sharing, and any other personal or professional
                  matters discussed or managed through the service.
                </p>
                <p className="text-dark-blue/90 leading-relaxed mt-2">
                  You understand that digital communication platforms carry
                  inherent risks including potential security breaches,
                  misunderstandings, technical failures, and unintended
                  consequences of shared information. By using Kyn, you accept
                  these risks entirely.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  Comprehensive Indemnification
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  <strong>
                    You agree to defend, indemnify, and hold completely harmless
                    Kyn, its owners, directors, officers, employees, agents,
                    contractors, and affiliates
                  </strong>{" "}
                  from and against any and all claims, damages, obligations,
                  losses, liabilities, costs, debt, and expenses (including
                  attorney's fees) arising from or related to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-dark-blue/90 mt-2 text-sm">
                  <li>Your use or misuse of the Kyn platform</li>
                  <li>Your violation of these Terms and Conditions</li>
                  <li>
                    Your violation of any third-party rights, including privacy,
                    publicity, or intellectual property rights
                  </li>
                  <li>Any content you post, share, or transmit through Kyn</li>
                  <li>Any disputes or conflicts with other family members</li>
                  <li>
                    Any decisions made based on information from or discussions
                    on Kyn
                  </li>
                  <li>
                    Any legal, financial, medical, or personal advice shared
                    through the platform
                  </li>
                  <li>
                    Any unauthorized access to your account due to your actions
                    or negligence
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  No Liability for Third Parties or External Factors
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  Kyn is not responsible for and shall not be held liable for
                  any actions, omissions, or conduct of third parties, including
                  but not limited to other users, family members, healthcare
                  providers, financial institutions, or any other parties you
                  may interact with as a result of using our platform. We do not
                  endorse, guarantee, or assume responsibility for any advice,
                  recommendations, or information shared by users.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  Maximum Liability Cap
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  <strong>
                    In no event shall Kyn's total liability to you for all
                    damages, losses, and causes of action exceed the amount you
                    have paid to Kyn in the twelve (12) months preceding the
                    claim, or $100, whichever is less.
                  </strong>{" "}
                  This limitation applies regardless of the legal theory on
                  which the claim is based.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  Governing Law and Dispute Resolution
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  These terms are governed by the laws of the State of Delaware
                  and the United States, without regard to conflict of law
                  principles.{" "}
                  <strong>
                    Any disputes must be resolved through binding arbitration in
                    Delaware, and you waive your right to a jury trial or class
                    action lawsuit.
                  </strong>
                  You agree that any legal action must be commenced within one
                  (1) year of the cause of action arising.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  Severability and Enforceability
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  If any provision of these Terms is found to be invalid or
                  unenforceable, the remaining provisions shall continue in full
                  force and effect. The failure of Kyn to enforce any right or
                  provision shall not constitute a waiver of such right or
                  provision.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card className="border-2 border-warm-brown/30 bg-gradient-to-br from-cream-white to-warm-brown/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-dark-blue flex items-center gap-2">
                <Users className="w-5 h-5 text-warm-brown" />
                Account Management and Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  Account Termination
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  You may delete your account at any time through your account
                  settings. We may terminate accounts that violate these terms.
                  Upon termination, your data will be deleted according to our
                  Privacy Policy, though some information may be retained for
                  legal or operational purposes.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dark-blue mb-2">
                  Changes to Terms
                </h3>
                <p className="text-dark-blue/90 leading-relaxed">
                  We may update these terms occasionally. Users will be notified
                  of significant changes, and continued use of the service
                  constitutes acceptance of updated terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-2 border-navy-blue/30 bg-gradient-to-br from-cream-white to-navy-blue/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-dark-blue flex items-center gap-2">
                <Shield className="w-5 h-5 text-navy-blue" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-dark-blue/90 leading-relaxed">
                If you have questions about these Terms and Conditions, please
                contact us at:
              </p>
              <div className="mt-3 p-3 bg-navy-blue/10 rounded-lg">
                <p className="text-dark-blue font-medium">
                  Email: legal@kyn.family
                </p>
                <p className="text-dark-blue font-medium">
                  Address: Kyn Legal Department
                </p>
                <p className="text-dark-blue/80 text-sm mt-1">
                  We typically respond within 2-3 business days
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 pb-12">
          <p className="text-light-blue-gray text-sm">
            By using Kyn, you acknowledge that you have read, understood, and
            agree to these Terms and Conditions.
          </p>
          <div className="mt-4">
            <Link
              to="/privacy-policy"
              className="text-dark-blue hover:text-olive-green transition-colors font-medium"
            >
              View Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
