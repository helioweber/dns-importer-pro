
import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, X } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import DnsRecordsList from '@/components/DnsRecordsList';
import ImportStatus, { ImportStatus as ImportStatusType } from '@/components/ImportStatus';
import ApiSettings from '@/components/ApiSettings';
import { DnsRecord } from '@/utils/dnsParser';

interface ImportTabProps {
  dnsRecords: DnsRecord[];
  selectedRecords: string[];
  apiKey: string;
  zoneId: string;
  importStatus: ImportStatusType;
  importProgress: number;
  importedCount: number;
  importError: string;
  onFileLoaded: (content: string) => void;
  onSelectionChange: (selected: string[]) => void;
  onApiKeyChange: (value: string) => void;
  onZoneIdChange: (value: string) => void;
  onReset: () => void;
  onImport: () => void;
}

const ImportTab = ({
  dnsRecords,
  selectedRec

ords,
  apiKey,
  zoneId,
  importStatus,
  importProgress,
  importedCount,
  importError,
  onFileLoaded,
  onSelectionChange,
  onApiKeyChange,
  onZoneIdChange,
  onReset,
  onImport,
}: ImportTabProps) => {
  return (
    <>
      <section>
        <h2 className="text-xl font-semibold mb-4 text-center">Carregue o arquivo de configuração BIND</h2>
        <FileUpload onFileLoaded={onFileLoaded} />
      </section>
      
      {dnsRecords.length > 0 && (
        <div className="space-y-8">
          <Separator />
          
          <section>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Registros ({dnsRecords.length})</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={onReset}
                  disabled={importStatus === 'importing'}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
                <Button 
                  onClick={onImport}
                  disabled={selectedRecords.length === 0 || importStatus === 'importing' || !apiKey}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Importar Selecionados
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <DnsRecordsList 
                  records={dnsRecords} 
                  onSelectionChange={onSelectionChange} 
                />
              </div>
              
              <div className="xl:col-span-1 space-y-4">
                <ImportStatus 
                  status={importStatus}
                  progress={importProgress}
                  totalRecords={selectedRecords.length}
                  importedRecords={importedCount}
                  error={importError}
                />
                
                <ApiSettings 
                  apiKey={apiKey}
                  zoneId={zoneId}
                  isImporting={importStatus === 'importing'}
                  onApiKeyChange={onApiKeyChange}
                  onZoneIdChange={onZoneIdChange}
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default ImportTab;
