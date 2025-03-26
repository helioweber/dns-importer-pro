
import React from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";

export type ImportStatus = 'idle' | 'importing' | 'success' | 'error';

interface ImportStatusProps {
  status: ImportStatus;
  progress: number;
  totalRecords: number;
  importedRecords: number;
  error?: string;
}

const ImportStatus: React.FC<ImportStatusProps> = ({
  status,
  progress,
  totalRecords,
  importedRecords,
  error
}) => {
  return (
    <div className={cn(
      "glass-panel p-6 rounded-xl transition-all duration-500",
      status === 'idle' ? 'opacity-50' : 'opacity-100'
    )}>
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          {status === 'idle' && (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          
          {status === 'importing' && (
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          )}
          
          {status === 'error' && (
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium">
            {status === 'idle' && 'Pronto para importar'}
            {status === 'importing' && 'Importando registros...'}
            {status === 'success' && 'Importação concluída'}
            {status === 'error' && 'Erro na importação'}
          </h3>
          
          <div className="mt-2">
            {(status === 'importing' || status === 'success') && (
              <div className="text-sm text-muted-foreground">
                Importando {importedRecords} de {totalRecords} registros
              </div>
            )}
            
            {status === 'error' && error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {(status === 'importing' || status === 'success') && (
        <div className="mt-4">
          <Progress value={progress} className="h-1.5" />
          <div className="mt-1 text-xs text-right text-muted-foreground">
            {Math.round(progress)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportStatus;
