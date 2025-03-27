import { v4 as uuidv4 } from 'uuid';
import { DnsRecord } from './types/azionTypes';

/**
 * Parses BIND DNS configuration text
 * @param bindText BIND configuration text
 * @returns Array of parsed DNS records
 */
export const parseDnsConfig = (bindText: string): DnsRecord[] => {
  const records: DnsRecord[] = [];
  
  // Handle lines with comments
  const lines = bindText.split('\n')
    .map(line => line.replace(/;.*$/, '').trim())
    .filter(line => line.length > 0);
  
  // Get the domain name from SOA record if exists
  let domainName = '';
  const soaLine = lines.find(line => line.includes('SOA'));
  if (soaLine) {
    const soaParts = soaLine.split(/\s+/);
    if (soaParts.length > 0) {
      domainName = soaParts[0].replace(/\.$/, '');
    }
  }
  
  // Process each line
  lines.forEach(line => {
    try {
      // Skip directive lines
      if (line.startsWith('$')) {
        return;
      }
      
      // Parse the record
      const parts = line.split(/\s+/);
      if (parts.length < 3) {
        return;
      }
      
      let name = parts[0];
      let ttl = '';
      let type = '';
      let value = '';
      let idx = 1;
      
      // Handle @ symbol (replace with domain name)
      if (name === '@') {
        name = domainName;
      }
      
      // Check if the second part is TTL
      if (!isNaN(Number(parts[idx]))) {
        ttl = parts[idx];
        idx++;
      }
      
      // Get record type (skip IN class)
      if (parts[idx] === 'IN') {
        idx++;
      }
      
      // Get record type
      if (parts[idx]) {
        type = parts[idx].toUpperCase();
        idx++;
      } else {
        return;
      }
      
      // Get record value based on record type
      switch (type) {
        case 'A':
        case 'AAAA':
          value = parts[idx] || '';
          break;
        case 'CNAME':
        case 'NS':
          value = parts[idx] || '';
          break;
        case 'MX':
          // MX has priority and then hostname
          const priority = parts[idx] || '';
          const hostname = parts[idx + 1] || '';
          value = `${priority} ${hostname}`;
          break;
        case 'TXT':
          // TXT records might be quoted and have multiple parts
          value = parts.slice(idx).join(' ');
          // Remove quotes if present
          value = value.replace(/^"(.*)"$/, '$1');
          break;
        case 'SOA':
          // SOA records have multiple fields
          value = parts.slice(idx).join(' ');
          break;
        default:
          value = parts.slice(idx).join(' ');
      }
      
      // Add the record
      records.push({
        id: uuidv4(),
        name: name.replace(/\.$/, ''),
        type,
        value,
        ttl: ttl || 'Default',
        isValid: Boolean(name && type && value),
        error: !name || !type || !value ? 'Informações incompletas' : undefined
      });
      
    } catch (error) {
      console.error('Error parsing line:', line, error);
    }
  });
  
  return records;
};

/**
 * Converts parsed DNS records to Azion API format
 * @param records Array of parsed DNS records
 * @returns Records formatted for Azion API
 */
export const formatRecordsForAzion = (records: DnsRecord[]) => {
  return records.map(record => {
    // Skip SOA records as they are not supported by Azion API
    if (record.type === 'SOA') {
      console.log('Skipping SOA record:', record);
      return null;
    }

    // Skip NS records as they are not supported by Azion API
    if (record.type === 'NS') {
      console.log('Skipping NS record:', record);
      return null;
    }

    // Create a base record object matching Azion API format
    const azionRecord = {
      record_type: record.type,
      entry: record.name,
      answers_list: [] as string[],
      ttl: record.ttl === 'Default' ? 3600 : parseInt(record.ttl, 10)
    };
    
    // Handle different record types
    switch (record.type) {
      case 'A':
      case 'AAAA':
        // For A/AAAA records, just use the IP address
        azionRecord.answers_list = [record.value.trim()];
        break;
        
      case 'CNAME':
        // For CNAME, handle @ symbol and remove trailing dots
        let cnameValue = record.value.replace(/\.$/, '');
        if (cnameValue === '@') {
          // If CNAME points to @, use the domain name
          cnameValue = record.name;
        }
        azionRecord.answers_list = [cnameValue];
        break;
        
      case 'MX':
        const mxParts = record.value.split(/\s+/);
        if (mxParts.length >= 2) {
          // For MX records, format as "priority hostname"
          const priority = mxParts[0];
          const hostname = mxParts.slice(1).join(' ').replace(/\.$/, '');
          azionRecord.answers_list = [`${priority} ${hostname}`];
        }
        break;
        
      case 'TXT':
        // For TXT records, remove quotes and any type prefix
        azionRecord.answers_list = [record.value.replace(/^"(.*)"$/, '$1').replace(/^TXT\s+/, '')];
        break;
        
      default:
        // For other record types, just use the value
        azionRecord.answers_list = [record.value.trim()];
    }
    
    // Validate the record before returning
    if (!azionRecord.answers_list.length) {
      console.warn(`Skipping record ${record.type} for ${record.name} due to empty answers_list`);
      return null;
    }
    
    // Log the formatted record for debugging
    console.log('Formatted record for Azion:', {
      original: record,
      formatted: azionRecord
    });
    
    return azionRecord;
  }).filter((record): record is NonNullable<typeof record> => record !== null);
};
