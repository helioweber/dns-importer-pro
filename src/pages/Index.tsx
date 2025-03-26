import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Terminal, Upload, X, Shield, AlertCircle, Code, Github } from 'lucide-react';
import { toast } from 'sonner';

import FileUpload from '@/components/FileUpload';
import DnsRecordsList from '@/components/DnsRecordsList';
import ImportStatus, { ImportStatus as ImportStatusType } from '@/components/ImportStatus';

import { parseDnsConfig, DnsRecord } from '@/utils/dnsParser';
import { importRecordsToAzion } from '@/utils/azionApi';
import { cn } from '@/lib/utils';

const Index = () => {
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [importStatus, setImportStatus] = useState<ImportStatusType>('idle');
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
  
  const handleFileLoaded = (content: string) => {
    setFileContent(content);
    setImportStatus('idle');
    setImportProgress(0);
    setImportedCount(0);
    setImportError('');
  };
  
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
      <header className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">DNS Importer Pro</h1>
              <p className="text-sm text-muted-foreground">Importe registros DNS do BIND para a Azion</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/aziontech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="https://www.azion.com/documentation/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentação
            </a>
          </div>
        </div>
      </header>
      
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
          
          <TabsContent value="import" className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-center">Carregue o arquivo de configuração BIND</h2>
              <FileUpload onFileLoaded={handleFileLoaded} />
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
                        onClick={handleReset}
                        disabled={importStatus === 'importing'}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Limpar
                      </Button>
                      <Button 
                        onClick={handleImport}
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
                        onSelectionChange={setSelectedRecords} 
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
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Configurações de API</CardTitle>
                          <CardDescription>Forneça as credenciais da API da Azion</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="api-key">Chave de API (obrigatório)</Label>
                              <div className="relative">
                                <Input
                                  id="api-key"
                                  type="password"
                                  value={apiKey}
                                  onChange={(e) => setApiKey(e.target.value)}
                                  placeholder="Sua chave de API da Azion"
                                  className="pr-10"
                                  disabled={importStatus === 'importing'}
                                />
                                <Shield className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="zone-id">
                                ID da Zona <span className="text-muted-foreground">(opcional)</span>
                              </Label>
                              <Input
                                id="zone-id"
                                value={zoneId}
                                onChange={(e) => setZoneId(e.target.value)}
                                placeholder="Deixe em branco para criar nova"
                                disabled={importStatus === 'importing'}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Se não informado, tentaremos criar uma nova zona
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="text-sm text-muted-foreground flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>Todos os registros serão enviados para a API da Azion em <code>api.azion.com</code></p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Configurações de Importação</CardTitle>
                <CardDescription>
                  Configure os detalhes para a importação dos registros DNS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="api-key-settings">Chave de API da Azion</Label>
                  <div className="relative">
                    <Input
                      id="api-key-settings"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Sua chave de API da Azion"
                      className="pr-10"
                    />
                    <Shield className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A chave de API é necessária para autenticar na API da Azion.{' '}
                    <a href="https://www.azion.com/documentation/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Saiba como obter sua chave.
                    </a>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zone-id-settings">ID da Zona (opcional)</Label>
                  <Input
                    id="zone-id-settings"
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    placeholder="Deixe em branco para criar automaticamente"
                  />
                  <p className="text-sm text-muted-foreground">
                    Se você já tem uma zona na Azion, informe o ID para adicionar os registros a ela.
                  </p>
                </div>
                
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Sobre a importação automatizada</p>
                      <p className="text-muted-foreground mt-1">
                        Ao importar registros DNS, o sistema tentará detectar o domínio principal
                        (a partir dos registros SOA ou NS) e criar uma nova zona se necessário.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DNS Importer Pro. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Suporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
