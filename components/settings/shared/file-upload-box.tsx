import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle, MessageSquare } from "lucide-react";

interface FileUploadBoxProps {
  id: string;
  label: string;
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  note?: string;
  onNoteChange?: (note: string) => void;
  notePlaceholder?: string;
}

export function FileUploadBox({ 
  id, 
  label, 
  file, 
  onFileChange, 
  required = true,
  note = '',
  onNoteChange,
  notePlaceholder = "Add a note if this is an equivalent document..."
}: FileUploadBoxProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        {label} {required && '*'}
        {file && (
          <span className="text-green-600 text-xs flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Uploaded
          </span>
        )}
      </Label>
      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
        file 
          ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
          : 'border-border/50 hover:border-primary/50'
      }`}>
        <input
          type="file"
          id={id}
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={onFileChange}
        />
        <label htmlFor={id} className="cursor-pointer">
          {file ? (
            <div className="text-green-700 dark:text-green-400">
              <CheckCircle className="mx-auto h-12 w-12 mb-2" />
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              <p className="text-xs mt-2 text-muted-foreground">Click to replace</p>
            </div>
          ) : (
            <div className="text-muted-foreground">
              <svg className="mx-auto h-12 w-12 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-medium">Click to upload</p>
              <p className="text-xs mt-1">PDF, JPG, PNG up to 10MB</p>
            </div>
          )}
        </label>
      </div>
      {/* Optional note field */}
      {onNoteChange && (
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={notePlaceholder}
            className="h-9 text-sm bg-muted/30 border-border/30 placeholder:text-muted-foreground/60"
          />
        </div>
      )}
    </div>
  );
}
