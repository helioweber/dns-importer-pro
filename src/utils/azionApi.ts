
import { toast } from 'sonner';
import { DnsRecord } from './types/azionTypes';
import { formatRecordsForAzion } from './dnsParser';
import { ImportConfig } from './types/azionTypes';
import { findZoneByName, createZone } from './azionZoneApi';
import { addDnsRecord } from './azionDnsApi';
import { getApexDomain, chunkArray } from './azionHelpers';

/**
 * Imports DNS records to Azion API
 * @param records DNS records to import
 * @param config Import configuration
 * @returns Promise resolving to success status
 */
export const importRecordsToAzion = async (
  records: DnsRecord[],
  config: ImportConfig
): Promise<boolean> => {
  try {
    if (!config.apiKey) {
      throw new Error('API Key não fornecida');
    }
    
    const azionRecords = formatRecordsForAzion(records);
    let zoneId = config.zoneId;
    let successCount = 0;
    
    // If no zoneId is provided, try to determine from records
    if (!zoneId) {
      const soaRecord = records.find(r => r.type === 'SOA');
      if (soaRecord) {
        // Try to find zone by name
        try {
          zoneId = await findZoneByName(soaRecord.name, config.apiKey);
        } catch (error) {
          console.log('Could not find zone, will try to create one');
        }
      }
      
      // If still no zoneId, create a new zone
      if (!zoneId) {
        const domainName = getApexDomain(records);
        if (domainName) {
          try {
            zoneId = await createZone(domainName, config.apiKey);
            toast.success(`Zona "${domainName}" criada com sucesso`);
          } catch (error) {
            throw new Error(`Não foi possível criar zona: ${(error as Error).message}`);
          }
        } else {
          throw new Error('Não foi possível determinar o domínio principal');
        }
      }
    }
    
    // Process records in chunks to avoid overwhelming the API
    const chunks = chunkArray(azionRecords, 10);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Process each record in the chunk
      const results = await Promise.allSettled(
        chunk.map(record => addDnsRecord(record, zoneId as string, config.apiKey))
      );
      
      // Count successful records
      const chunkSuccessCount = results.filter(r => r.status === 'fulfilled').length;
      successCount += chunkSuccessCount;
      
      // Update progress
      if (config.onProgress) {
        const progress = Math.min(100, (successCount / azionRecords.length) * 100);
        config.onProgress(progress, successCount);
      }
      
      // If all failed in this chunk, consider stopping
      if (chunkSuccessCount === 0 && i > 0) {
        console.error('All records in chunk failed, possible API issue');
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (successCount === 0) {
      throw new Error('Nenhum registro foi importado com sucesso');
    }
    
    if (successCount < azionRecords.length) {
      toast.warning(`Atenção: Apenas ${successCount} de ${azionRecords.length} registros foram importados com sucesso`);
    } else {
      toast.success(`Todos os ${successCount} registros foram importados com sucesso`);
    }
    
    if (config.onComplete) {
      config.onComplete();
    }
    
    return true;
  } catch (error) {
    const errorMessage = (error as Error).message || 'Erro desconhecido ao importar registros';
    console.error('Import error:', error);
    
    if (config.onError) {
      config.onError(errorMessage);
    }
    
    toast.error(errorMessage);
    return false;
  }
};
