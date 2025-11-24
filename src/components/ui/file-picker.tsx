import React, { useRef, useState } from 'react';
import { Button } from './button';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePickerProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  loading?: boolean;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  buttonSize?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const FilePicker: React.FC<FilePickerProps> = ({
  onFileSelect,
  onFileRemove,
  selectedFile,
  loading = false,
  disabled = false,
  accept = 'image/jpeg,image/jpg,image/png,image/gif',
  maxSize = 5, // 5MB default
  className,
  buttonSize = 'sm',
  variant = 'outline',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    if (!allowedTypes.includes(file.type)) {
      return `File type not supported. Please select a JPEG, PNG, or GIF image.`;
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size too large. Please select an image smaller than ${maxSize}MB.`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    onFileSelect(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleButtonClick = () => {
    if (!disabled && !loading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
    onFileRemove?.();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 transition-colors',
          dragOver && 'border-primary bg-primary/5',
          !dragOver && 'border-gray-300 dark:border-gray-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center space-y-2">
          {selectedFile ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Upload className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-32">
                {selectedFile.name}
              </span>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                >
                  <X className="h-3 w-3 text-red-600 dark:text-red-400" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Drag & drop an image here, or click to select
              </p>
            </div>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant={variant}
        size={buttonSize}
        onClick={handleButtonClick}
        disabled={disabled || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : selectedFile ? (
          <>
            <Camera className="h-4 w-4 mr-2" />
            Change Image
          </>
        ) : (
          <>
            <Camera className="h-4 w-4 mr-2" />
            Select Image
          </>
        )}
      </Button>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Supported formats: JPEG, PNG, GIF (max {maxSize}MB)
      </p>
    </div>
  );
};
