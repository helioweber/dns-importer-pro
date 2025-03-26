
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Upload } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImportTab from '@/components/ImportTab';
import SettingsTab from '@/components/SettingsTab';
import { parseDnsConfig, DnsRecord } from '@/utils/dnsParser';
import { importRecordsToAzion } from '@/utils/azionApi';

const Index = () => {
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [importError, setImportError] = useState('');
  const [fileContent, setFileContent] = useState('');
  
  useEffect(() => {
    if (fileContent) {
      try {
        const records = parseDnsConfig(fileContent);
        setDnsRecords(records);
        setSelectedRecords(records.filter(r => r.isValid).map(r => r.id));
      } catch (error) {
        console.error('Error parsing DNS config:', error);
        toast.error('Erro ao processar o arquivo DNS');
      }
    } else {
      setDnsRecords([]);
      setSelectedRecords([]);
    }
  }, [fileContent]);
  
  const handleImport = async () => {
    if (!apiKey) {
      toast.error('Por favor, forneça a chave de API da Azion');
      return;
    }
    
    if (selectedRecords.length === 0) {
      toast.error('Selecione pelo menos um registro para importar');
      return;
    }
    
    const recordsToImport = dnsRecords.filter(
      record => selectedRecords.includes(record.id) && record.isValid
    );
    
    if (recordsToImport.length === 0) {
      toast.error('Não há registros válidos selecionados para importar');
      return;
    }
    
    setImportStatus('importing');
    setImportProgress(0);
    setImportedCount(0);
    setImportError('');
    
    try {
      const success = await importRecordsToAzion(recordsToImport, {
        apiKey,
        zoneId: zoneId || undefined,
        onProgress: (progress, importedCount) => {
          setImportProgress(progress);
          setImportedCount(importedCount);
        },
        onComplete: () => {
          setImportStatus('success');
          setImportProgress(100);
        },
        onError: (error) => {
          setImportStatus('error');
          setImportError(error);
        }
      });
      
      if (!success && importStatus !== 'error') {
        setImportStatus('error');
        setImportError('A importação falhou por um erro desconhecido');
      }
    } catch (error) {
      setImportStatus('error');
      setImportError((error as Error).message || 'Erro desconhecido durante a importação');
      console.error('Import error:', error);
    }
  };
  
  const handleReset = () => {
    setFileContent('');
    setDnsRecords([]);
    setSelectedRecords([]);
    setImportStatus('idle');
    setImportProgress(0);
    setImportedCount(0);
    setImportError('');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30">
      <Header />
      
      <main className="container mx-auto pb-16 px-4 animate-slide-up">
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="import">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Terminal className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="import">
            <ImportTab 
              dnsRecords={dnsRecords}
              selectedRecords={selectedRecords}
              apiKey={apiKey}
              zoneId={zoneId}
              importStatus={importStatus}
              importProgress={importProgress}
              importedCount={importedCount}
              importError={importError}
              onFileLoaded={setFileContent}
              onSelectionChange={setSelectedRecords}
              onApiKeyChange={setApiKey}
              onZoneIdChange={setZoneId}
              onReset={handleReset}
              onImport={handleImport}
            />
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTab 
              apiKey={apiKey}
              zoneId={zoneId}
              onApiKeyChange={setApiKey}
              onZoneIdChange={setZoneId}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
