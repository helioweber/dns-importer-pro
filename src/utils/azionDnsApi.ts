import { DnsRecord } from './types/azionTypes';

const API_BASE_URL = 'https://api.azionapi.net';

interface AzionApiRecord {
  record_type: string;
  entry: string;
  answers_list: string[];
  ttl: number;
}

/**
 * Validates a DNS record before sending to the API
 */
const validateDnsRecord = (record: AzionApiRecord): string | null => {
  if (!record.record_type || !record.entry || !record.answers_list || !record.ttl) {
    return 'Missing required fields in DNS record';
  }
  
  if (!Array.isArray(record.answers_list)) {
    return 'answers_list must be an array';
  }
  
  if (record.answers_list.length === 0) {
    return 'answers_list cannot be empty';
  }
  
  if (typeof record.ttl !== 'number' || record.ttl < 0) {
    return 'ttl must be a positive number';
  }
  
  return null;
};

/**
 * Adds a new DNS record to the specified zone
 * @param zoneId The ID of the DNS zone
 * @param record The DNS record to add
 * @param apiKey The API key for authentication
 * @returns The created DNS record
 */
export const addDnsRecord = async (zoneId: string, record: AzionApiRecord, apiKey: string): Promise<AzionApiRecord> => {
  // Add a delay to avoid overwhelming the API
  await new Promise(resolve => setTimeout(resolve, 1000));

  const maxRetries = 3;
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < maxRetries) {
    try {
      console.log('Request to Azion API:', {
        url: `${API_BASE_URL}/intelligent_dns/${zoneId}/records`,
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json; version=3'
        },
        body: record
      });

      const response = await fetch(`${API_BASE_URL}/intelligent_dns/${zoneId}/records`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json; version=3'
        },
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Full API Error Response:', errorData);
        
        // Handle specific error cases
        if (response.status === 400) {
          if (errorData?.errors?.[0]?.includes('already another record')) {
            throw new Error('There is already another record matching those data.');
          }
          if (errorData?.errors?.[0]?.includes('FQDN')) {
            throw new Error('Please enter the domain name following the format FQDN. IP addresses are not acceptable for this kind of record.');
          }
          throw new Error(errorData?.errors?.[0] || 'Invalid request data');
        }
        
        throw new Error(`Failed to add DNS record: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${retryCount + 1} failed:`, error);
      
      // If it's a connection error, wait longer before retrying
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
      }
      
      retryCount++;
    }
  }

  throw lastError || new Error('Failed to add DNS record after multiple attempts');
};

/**
 * Updates an existing DNS record in Azion
 * @param record The record data to update
 * @param zoneId The hosted zone ID
 * @param recordId The ID of the record to update
 * @param apiKey The API key for authentication
 * @returns The updated record data
 */
export const updateDnsRecord = async (
  record: {
    record_type: string;
    entry: string;
    answers_list: string[];
    ttl: number;
  },
  zoneId: string,
  recordId: string,
  apiKey: string
): Promise<any> => {
  try {
    const response = await fetch(`https://api.azionapi.net/intelligent_dns/${zoneId}/records/${recordId}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json; version=3',
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(record)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating DNS record:', error);
    throw error;
  }
};
