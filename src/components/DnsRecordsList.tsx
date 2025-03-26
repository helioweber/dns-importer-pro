
import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { DnsRecord } from '@/utils/dnsParser';
import { cn } from '@/lib/utils';
import { X, Check, AlertTriangle, Globe } from 'lucide-react';

interface DnsRecordsListProps {
  records: DnsRecord[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const DnsRecordsList: React.FC<DnsRecordsListProps> = ({ records, onSelectionChange }) => {
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

  const toggleRecord = (recordId: string) => {
    const newSelectedRecords = new Set(selectedRecords);
    
    if (selectedRecords.has(recordId)) {
      newSelectedRecords.delete(recordId);
    } else {
      newSelectedRecords.add(recordId);
    }
    
    setSelectedRecords(newSelectedRecords);
    onSelectionChange(Array.from(newSelectedRecords));
  };

  const toggleAll = () => {
    if (selectedRecords.size === records.length) {
      // Deselect all
      setSelectedRecords(new Set());
      onSelectionChange([]);
    } else {
      // Select all
      const allIds = records.map(record => record.id);
      setSelectedRecords(new Set(allIds));
      onSelectionChange(allIds);
    }
  };

  if (records.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-xl text-center animate-fade-in">
        <Globe className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">Nenhum registro DNS encontrado</h3>
        <p className="text-muted-foreground mt-2">
          Carregue um arquivo de configuração BIND para ver os registros
        </p>
      </div>
    );
  }

  const getRecordTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'A':
        return 'bg-blue-100 text-blue-700';
      case 'AAAA':
        return 'bg-indigo-100 text-indigo-700';
      case 'CNAME':
        return 'bg-green-100 text-green-700';
      case 'MX':
        return 'bg-purple-100 text-purple-700';
      case 'TXT':
        return 'bg-orange-100 text-orange-700';
      case 'NS':
        return 'bg-teal-100 text-teal-700';
      case 'SOA':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full glass-panel rounded-xl overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          <Checkbox 
            id="select-all"
            checked={selectedRecords.size === records.length && records.length > 0}
            onCheckedChange={toggleAll}
            className="mr-3"
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            {selectedRecords.size} de {records.length} selecionados
          </label>
        </div>
        {selectedRecords.size > 0 && (
          <button 
            onClick={() => {
              setSelectedRecords(new Set());
              onSelectionChange([]);
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Limpar seleção
          </button>
        )}
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {records.map((record) => (
          <div 
            key={record.id} 
            className={cn(
              "dns-record-item flex items-center gap-3",
              selectedRecords.has(record.id) ? "bg-accent/40" : ""
            )}
          >
            <Checkbox 
              id={`record-${record.id}`}
              checked={selectedRecords.has(record.id)}
              onCheckedChange={() => toggleRecord(record.id)}
            />
            
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <div className="min-w-[120px]">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  getRecordTypeColor(record.type)
                )}>
                  {record.type}
                </span>
              </div>
              
              <div className="flex-1 truncate">
                <p className="font-mono text-sm">
                  {record.name}
                </p>
              </div>
              
              <div className="flex-1 truncate">
                <p className="font-mono text-sm text-muted-foreground">
                  {record.value}
                </p>
              </div>
              
              <div className="w-14 text-right text-sm text-muted-foreground">
                {record.ttl}
              </div>
            </div>
            
            {record.isValid ? (
              <Check className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <div className="group relative">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="absolute right-0 top-6 z-10 w-48 rounded bg-popover p-2 text-xs shadow-md hidden group-hover:block">
                  {record.error || "Registro inválido ou incompleto"}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DnsRecordsList;
