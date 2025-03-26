
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, AlertCircle } from 'lucide-react';

interface SettingsTabProps {
  apiKey: string;
  zoneId: string;
  onApiKeyChange: (value: string) => void;
  onZoneIdChange: (value: string) => void;
}

const SettingsTab = ({ 
  apiKey, 
  zoneId, 
  onApiKeyChange, 
  onZoneIdChange 
}: SettingsTabProps) => {
  return (
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
              onChange={(e) => onApiKeyChange(e.target.value)}
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
            onChange={(e) => onZoneIdChange(e.target.value)}
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
  );
};

export default SettingsTab;
