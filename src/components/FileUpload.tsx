
import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface FileUploadProps {
  onFileLoaded: (content: string) => void;
}

const FileUpload = ({ onFileLoaded }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        onFileLoaded(content);
        toast.success("Arquivo carregado com sucesso");
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("Erro ao processar o arquivo");
      }
    };
    
    reader.onerror = () => {
      toast.error("Erro ao ler o arquivo");
    };
    
    reader.readAsText(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-fade-in">
      <div
        className={cn(
          "glass-panel flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer min-h-[200px]",
          isDragging ? "file-drop-active scale-[1.02]" : "border-muted hover:border-primary/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          accept=".zone,.txt,.conf,.bind"
        />
        
        {fileName ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <p className="font-medium text-center">{fileName}</p>
            <p className="text-sm text-muted-foreground">Arquivo carregado</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                setFileName(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              Trocar arquivo
            </Button>
          </div>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse-subtle">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-medium">Arraste o arquivo de configuração DNS</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Arraste e solte o arquivo BIND ou clique para selecionar
            </p>
            <Button variant="outline" className="mt-4">
              Selecionar arquivo
            </Button>
          </>
        )}
      </div>
      <div className="mt-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span>Suporta arquivos de configuração BIND (.zone, .txt, .conf)</span>
      </div>
    </div>
  );
};

export default FileUpload;
