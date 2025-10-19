// utils/apiParser.ts
import type { CustomAPIDefinition, APIEndpoint, Environment } from '../types';
import { generateId } from './helpers';

export interface ParsedDocumentation {
  name: string;
  type: Environment;
  description: string;
  endpoints: APIEndpoint[];
  userSchema: {
    idField: string;
    balanceFields: string[];
    identifierField: string;
  };
}

// Try to parse as JSON first
const tryParseJSON = (docText: string): ParsedDocumentation | null => {
  try {
    const doc = JSON.parse(docText);

    if (!doc.name || !doc.type || !doc.endpoints) {
      return null;
    }

    if (doc.type !== 'bank' && doc.type !== 'crypto') {
      return null;
    }

    const userSchema = doc.userSchema || {
      idField: 'userId',
      balanceFields: doc.type === 'bank' ? ['balance'] : ['BTC', 'ETH', 'USDT'],
      identifierField: doc.type === 'bank' ? 'accountNumber' : 'walletAddress',
    };

    return {
      name: doc.name,
      type: doc.type as Environment,
      description: doc.description || `${doc.name} API Simulator`,
      endpoints: doc.endpoints.map((ep: any) => ({
        name: ep.name,
        path: ep.path,
        method: ep.method.toUpperCase(),
        description: ep.description || '',
        requestBody: ep.requestBody || {},
        responseBody: ep.responseBody || {},
      })),
      userSchema,
    };
  } catch (e) {
    return null;
  }
};

// Parse human-readable format
const parseHumanReadable = (docText: string): ParsedDocumentation => {
  const lines = docText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);

  let name = '';
  let type: Environment = 'bank';
  let description = '';
  const endpoints: APIEndpoint[] = [];

  let currentEndpoint: Partial<APIEndpoint> | null = null;
  let inRequestSection = false;
  let inResponseSection = false;

  // Patterns to match
  const namePattern = /^(?:API\s+)?Name:\s*(.+)$/i;
  const typePattern = /^Type:\s*(bank|crypto)$/i;
  const descPattern = /^Description:\s*(.+)$/i;
  const endpointPattern = /^(?:Endpoint|API):\s*(.+)$/i;
  const methodPattern = /^Method:\s*(GET|POST|PUT|DELETE|PATCH)$/i;
  const pathPattern = /^(?:Path|URL|Route):\s*(.+)$/i;
  const requestPattern = /^Request(?:\s+Body)?(?:\s+Parameters)?:\s*$/i;
  const responsePattern = /^Response(?:\s+Body)?:\s*$/i;
  const paramPattern = /^[-*•]\s*(\w+)(?:\s*\((\w+)\))?(?:\s*[:-]\s*(.+))?$/;
  const fieldPattern = /^(\w+):\s*(\w+)(?:\s*[-–]\s*(.+))?$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip common separator lines
    if (/^[=\-_#*]{3,}$/.test(line)) continue;

    // Parse API Name
    const nameMatch = line.match(namePattern);
    if (nameMatch && !name) {
      name = nameMatch[1].trim();
      continue;
    }

    // Parse Type
    const typeMatch = line.match(typePattern);
    if (typeMatch) {
      type = typeMatch[1].toLowerCase() as Environment;
      continue;
    }

    // Parse Description
    const descMatch = line.match(descPattern);
    if (descMatch) {
      description = descMatch[1].trim();
      continue;
    }

    // Start new endpoint
    const endpointMatch = line.match(endpointPattern);
    if (endpointMatch) {
      // Save previous endpoint
      if (
        currentEndpoint &&
        currentEndpoint.name &&
        currentEndpoint.path &&
        currentEndpoint.method
      ) {
        endpoints.push(currentEndpoint as APIEndpoint);
      }

      currentEndpoint = {
        name: endpointMatch[1].trim(),
        path: '',
        method: 'GET',
        description: '',
        requestBody: {},
        responseBody: {},
      };
      inRequestSection = false;
      inResponseSection = false;
      continue;
    }

    // Parse method
    const methodMatch = line.match(methodPattern);
    if (methodMatch && currentEndpoint) {
      currentEndpoint.method = methodMatch[1].toUpperCase() as any;
      continue;
    }

    // Parse path
    const pathMatch = line.match(pathPattern);
    if (pathMatch && currentEndpoint) {
      currentEndpoint.path = pathMatch[1].trim();
      continue;
    }

    // Request section
    if (line.match(requestPattern)) {
      inRequestSection = true;
      inResponseSection = false;
      continue;
    }

    // Response section
    if (line.match(responsePattern)) {
      inRequestSection = false;
      inResponseSection = true;
      continue;
    }

    // Parse parameters in request/response
    if (currentEndpoint && (inRequestSection || inResponseSection)) {
      // Try bullet point format: - userId (string) - User identifier
      const paramMatch = line.match(paramPattern);
      if (paramMatch) {
        const fieldName = paramMatch[1];
        const fieldType = paramMatch[2] || 'string';

        if (inRequestSection) {
          currentEndpoint.requestBody = currentEndpoint.requestBody || {};
          currentEndpoint.requestBody[fieldName] = fieldType;
        } else {
          currentEndpoint.responseBody = currentEndpoint.responseBody || {};
          currentEndpoint.responseBody[fieldName] = fieldType;
        }
        continue;
      }

      // Try field format: userId: string - User identifier
      const fieldMatch = line.match(fieldPattern);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2] || 'string';

        if (inRequestSection) {
          currentEndpoint.requestBody = currentEndpoint.requestBody || {};
          currentEndpoint.requestBody[fieldName] = fieldType;
        } else {
          currentEndpoint.responseBody = currentEndpoint.responseBody || {};
          currentEndpoint.responseBody[fieldName] = fieldType;
        }
        continue;
      }

      // Try JSON-like format: "userId": "string"
      const jsonMatch = line.match(/["']?(\w+)["']?\s*:\s*["']?(\w+)["']?/);
      if (jsonMatch) {
        const fieldName = jsonMatch[1];
        const fieldType = jsonMatch[2];

        if (inRequestSection) {
          currentEndpoint.requestBody = currentEndpoint.requestBody || {};
          currentEndpoint.requestBody[fieldName] = fieldType;
        } else {
          currentEndpoint.responseBody = currentEndpoint.responseBody || {};
          currentEndpoint.responseBody[fieldName] = fieldType;
        }
        continue;
      }
    }

    // If we have a current endpoint and line looks like a description
    if (
      currentEndpoint &&
      !currentEndpoint.description &&
      !inRequestSection &&
      !inResponseSection
    ) {
      if (line.length > 10 && !line.includes(':')) {
        currentEndpoint.description = line;
      }
    }
  }

  // Save last endpoint
  if (
    currentEndpoint &&
    currentEndpoint.name &&
    currentEndpoint.path &&
    currentEndpoint.method
  ) {
    endpoints.push(currentEndpoint as APIEndpoint);
  }

  // Validate we have minimum required data
  if (!name) {
    throw new Error(
      'API name not found. Please include "Name: YourAPIName" in the documentation.'
    );
  }

  if (endpoints.length === 0) {
    throw new Error(
      'No endpoints found. Please include at least one endpoint with name, method, and path.'
    );
  }

  // Set default description if not provided
  if (!description) {
    description = `${name} API Simulator`;
  }

  // Set user schema defaults
  const userSchema = {
    idField: 'userId',
    balanceFields: type === 'bank' ? ['balance'] : ['BTC', 'ETH', 'USDT'],
    identifierField: type === 'bank' ? 'accountNumber' : 'walletAddress',
  };

  return {
    name,
    type,
    description,
    endpoints,
    userSchema,
  };
};

export const parseAPIDocumentation = (docText: string): ParsedDocumentation => {
  // First, try to parse as JSON
  const jsonResult = tryParseJSON(docText);
  if (jsonResult) {
    return jsonResult;
  }

  // If JSON parsing fails, try human-readable format
  try {
    return parseHumanReadable(docText);
  } catch (error: any) {
    throw new Error(`Failed to parse API documentation: ${error.message}`);
  }
};

export const createCustomAPIDefinition = (
  parsed: ParsedDocumentation
): CustomAPIDefinition => {
  return {
    id: generateId(),
    ...parsed,
  };
};

// Helper to generate features list from endpoints
export const generateFeatures = (endpoints: APIEndpoint[]): string[] => {
  const features: string[] = [];

  endpoints.forEach((ep) => {
    const lowerName = ep.name.toLowerCase();
    if (lowerName.includes('balance')) features.push('Balance Queries');
    if (lowerName.includes('transfer')) features.push('Transfers');
    if (lowerName.includes('deposit')) features.push('Deposits');
    if (lowerName.includes('withdraw')) features.push('Withdrawals');
    if (lowerName.includes('transaction') || lowerName.includes('history')) {
      features.push('Transaction History');
    }
  });

  // Remove duplicates
  return [...new Set(features)];
};
