import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  FolderOpen,
  Cloud,
  Paperclip,
  HardDrive,
  Globe,
  Box,
  Monitor,
} from "lucide-react";

interface FileAttachmentDialogProps {
  children: React.ReactNode;
  onAttach: (source: string, files?: FileList) => void;
}

const FileAttachmentDialog = ({
  children,
  onAttach,
}: FileAttachmentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const attachmentSources = [
    {
      id: "computer",
      name: "Computer",
      description: "Upload files from your device",
      icon: <Monitor className="h-5 w-5" />,
      color: "from-blue-500/20 to-blue-600/40",
      iconColor: "text-blue-600",
    },
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Import from Google Drive",
      icon: <Cloud className="h-5 w-5" />,
      color: "from-green-500/20 to-green-600/40",
      iconColor: "text-amber-600",
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "Import from Dropbox",
      icon: <Box className="h-5 w-5" />,
      color: "from-blue-600/20 to-blue-700/40",
      iconColor: "text-blue-700",
    },
    {
      id: "onedrive",
      name: "OneDrive",
      description: "Import from Microsoft OneDrive",
      icon: <Cloud className="h-5 w-5" />,
      color: "from-blue-500/20 to-blue-600/40",
      iconColor: "text-blue-600",
    },
    {
      id: "icloud",
      name: "iCloud Drive",
      description: "Import from iCloud",
      icon: <Cloud className="h-5 w-5" />,
      color: "from-gray-500/20 to-gray-600/40",
      iconColor: "text-gray-600",
    },
    {
      id: "url",
      name: "Web URL",
      description: "Import from web link",
      icon: <Globe className="h-5 w-5" />,
      color: "from-purple-500/20 to-purple-600/40",
      iconColor: "text-purple-600",
    },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAttach("computer", e.target.files);
      setIsOpen(false);
    }
  };

  const handleSourceSelect = (sourceId: string) => {
    if (sourceId === "computer") {
      // Trigger file input
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = "*/*";
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          onAttach("computer", target.files);
          setIsOpen(false);
        }
      };
      input.click();
    } else {
      // For other sources, just call the onAttach with the source name
      onAttach(sourceId);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-h-[90vh] overflow-y-auto sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Paperclip className="h-5 w-5 text-logo-gold" />
            <span>Attach Evidence for Forensic Audit</span>
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to attach your evidence for forensic auditing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-6">
          {attachmentSources.map((source) => (
            <div
              key={source.id}
              className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200 border hover:border-logo-gold/50"
              onClick={() => handleSourceSelect(source.id)}
            >
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${source.color}`}
              >
                <div className={`${source.iconColor} [&>svg]:w-5 [&>svg]:h-5`}>
                  {source.icon}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{source.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {source.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Supported formats: Documents, Images, Audio, Video, and more
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileAttachmentDialog;
