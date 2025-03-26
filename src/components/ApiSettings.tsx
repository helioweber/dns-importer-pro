
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, AlertCircle } from 'lucide-react';

interface ApiSettingsProps {
  apiKey: string;
  zoneId: string;
  isImporting: boolean;
  onApiKeyChange: (value: string) => void;
  onZoneIdChange: (value: string) => void;
}

const ApiSettings = ({ 
  apiKey, 
  zoneId, 
  isImporting, 
  onApiKeyChange, 
  onZoneIdChange 
}: ApiSettingsProps) => {
  return (
    <div className="space-y-4">
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
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  placeholder="Sua chave de API da Azion"
                  className="pr-10"
                  disabled={isImporting}
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
                onChange={(e) => onZoneIdChange(e.target.value)}
                placeholder="Deixe em branco para criar nova"
                disabled={isImporting}
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
  );
};

export default ApiSettings;
