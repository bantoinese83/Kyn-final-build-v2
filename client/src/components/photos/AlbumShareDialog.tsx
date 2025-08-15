// AlbumShareDialog Component - Dialog for sharing albums
// Provides options to share albums via link, email, or social media

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Mail,
  Share2,
  Link,
  Facebook,
  Twitter,
  Instagram,
  Check,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Album } from "@/types/photos";

interface AlbumShareDialogProps {
  album: Album | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AlbumShareDialog({
  album,
  isOpen,
  onClose,
}: AlbumShareDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [emailAddresses, setEmailAddresses] = useState<string[]>([""]);
  const [allowComments, setAllowComments] = useState(true);
  const [allowDownloads, setAllowDownloads] = useState(false);

  // Generate share link when component opens
  useState(() => {
    if (album && isOpen) {
      const baseUrl = window.location.origin;
      setShareLink(`${baseUrl}/photos/album/${album.id}`);
    }
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Album link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddEmail = () => {
    setEmailAddresses((prev) => [...prev, ""]);
  };

  const handleRemoveEmail = (index: number) => {
    setEmailAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, value: string) => {
    setEmailAddresses((prev) =>
      prev.map((email, i) => (i === index ? value : email)),
    );
  };

  const handleShareViaEmail = () => {
    const validEmails = emailAddresses.filter(
      (email) => email.trim() && email.includes("@"),
    );
    if (validEmails.length === 0) {
      toast({
        title: "Invalid Emails",
        description: "Please enter at least one valid email address.",
        variant: "destructive",
      });
      return;
    }

    const subject = `Check out this album: ${album?.title}`;
    const body = `Hi!\n\nI wanted to share this album with you: ${album?.title}\n\nView it here: ${shareLink}\n\nEnjoy!`;
    const mailtoLink = `mailto:${validEmails.join(",")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(mailtoLink);
    toast({
      title: "Email Opened",
      description: "Email client opened with album details.",
    });
  };

  const handleSocialShare = (platform: string) => {
    const text = `Check out this album: ${album?.title}`;
    let url = "";

    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`;
        break;
      case "instagram":
        // Instagram doesn't support direct link sharing, show instructions
        toast({
          title: "Instagram Sharing",
          description:
            "Copy the link and share it in your Instagram story or bio.",
        });
        return;
      default:
        return;
    }

    window.open(url, "_blank", "width=600,height=400");
  };

  if (!isOpen || !album) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Share Album</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Share "{album.title}" with others
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="link">Link</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>

            {/* Link Sharing */}
            <TabsContent value="link" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    onChange={(e) => setShareLink(e.target.value)}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant={copied ? "default" : "outline"}
                    size="sm"
                    className="min-w-[80px]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view the album
                </p>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Privacy Settings</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Comments</Label>
                    <p className="text-xs text-muted-foreground">
                      Let others comment on photos
                    </p>
                  </div>
                  <Switch
                    checked={allowComments}
                    onCheckedChange={setAllowComments}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Downloads</Label>
                    <p className="text-xs text-muted-foreground">
                      Let others download photos
                    </p>
                  </div>
                  <Switch
                    checked={allowDownloads}
                    onCheckedChange={setAllowDownloads}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Email Sharing */}
            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label>Email Addresses</Label>
                {emailAddresses.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1"
                    />
                    {emailAddresses.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEmail(index)}
                        className="h-10 w-10 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddEmail}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Add Another Email
                </Button>
              </div>

              <Button
                onClick={handleShareViaEmail}
                className="w-full"
                disabled={
                  !emailAddresses.some(
                    (email) => email.trim() && email.includes("@"),
                  )
                }
              >
                <Mail className="h-4 w-4 mr-2" />
                Share via Email
              </Button>
            </TabsContent>

            {/* Social Media Sharing */}
            <TabsContent value="social" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleSocialShare("facebook")}
                  variant="outline"
                  className="h-16 flex-col gap-2"
                >
                  <Facebook className="h-6 w-6 text-blue-600" />
                  <span>Facebook</span>
                </Button>

                <Button
                  onClick={() => handleSocialShare("twitter")}
                  variant="outline"
                  className="h-16 flex-col gap-2"
                >
                  <Twitter className="h-6 w-6 text-blue-400" />
                  <span>Twitter</span>
                </Button>

                <Button
                  onClick={() => handleSocialShare("instagram")}
                  variant="outline"
                  className="h-16 flex-col gap-2"
                >
                  <Instagram className="h-6 w-6 text-pink-600" />
                  <span>Instagram</span>
                </Button>

                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="h-16 flex-col gap-2"
                >
                  <Link className="h-6 w-6 text-gray-600" />
                  <span>Copy Link</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
