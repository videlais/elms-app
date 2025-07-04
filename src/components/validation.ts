import schema from './elms-schema.json';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateElmsData(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate required fields at the root level
  if (schema.required) {
    schema.required.forEach(field => {
      if (!data[field]) {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    });
  }
  
  // Validate workInformation required fields
  if (data.workInformation) {
    const workInfoSchema = (schema.properties as any).workInformation;
    if (workInfoSchema.required) {
      workInfoSchema.required.forEach((field: string) => {
        if (!data.workInformation[field]) {
          errors.push({
            field: `workInformation.${field}`,
            message: `${field} is required in work information`
          });
        }
      });
    }
  }
  
  // Validate versionInformation required fields
  if (data.versionInformation) {
    const versionInfoSchema = (schema.properties as any).versionInformation;
    if (versionInfoSchema.required) {
      versionInfoSchema.required.forEach((field: string) => {
        if (!data.versionInformation[field]) {
          errors.push({
            field: `versionInformation.${field}`,
            message: `${field} is required in version information`
          });
        }
      });
    }
  }
  
  // Validate URL formats
  const urlFields = [
    'versionInformation.imageThumbnail',
    'versionInformation.originalPublisherAuthority',
    'versionInformation.eldLink',
    'versionInformation.elmcipLink',
    'versionInformation.rebootingElectronicLiteratureLink',
    'collectionInformation.collectionHostedUrl',
    'collectionInformation.collectionImage',
    'collectionInformation.collectionHeaderImage',
    'collectionInformation.collectionVideoLink',
    'collectionInformation.collectionVideoExternalLink',
    'collectionInformation.collectionVideoThumbnail'
  ];
  
  urlFields.forEach(field => {
    const value = getNestedValue(data, field);
    if (value && !isValidUrl(value)) {
      errors.push({
        field,
        message: `${field} must be a valid URL`
      });
    }
  });
  
  // Validate year ranges
  const yearFields = [
    'versionInformation.originalPublicationYear',
    'collectionInformation.startYearCollected',
    'collectionInformation.endYearCollected'
  ];
  
  yearFields.forEach(field => {
    const value = getNestedValue(data, field);
    if (value && (value < 1950 || value > 2100)) {
      errors.push({
        field,
        message: `${field} must be between 1950 and 2100`
      });
    }
  });
  
  // Validate arrays
  if (data.copyInformation && Array.isArray(data.copyInformation)) {
    data.copyInformation.forEach((copy: any, index: number) => {
      if (!copy.copyId) {
        errors.push({
          field: `copyInformation[${index}].copyId`,
          message: `Copy ID is required for copy ${index + 1}`
        });
      }
    });
  }
  
  if (data.entityInformation && Array.isArray(data.entityInformation)) {
    data.entityInformation.forEach((entity: any, index: number) => {
      if (!entity.entityName) {
        errors.push({
          field: `entityInformation[${index}].entityName`,
          message: `Entity name is required for entity ${index + 1}`
        });
      }
      if (!entity.entityId) {
        errors.push({
          field: `entityInformation[${index}].entityId`,
          message: `Entity ID is required for entity ${index + 1}`
        });
      }
      if (!entity.role) {
        errors.push({
          field: `entityInformation[${index}].role`,
          message: `Role is required for entity ${index + 1}`
        });
      }
    });
  }
  
  if (data.worksExternalLinkInformation && Array.isArray(data.worksExternalLinkInformation)) {
    data.worksExternalLinkInformation.forEach((link: any, index: number) => {
      if (!link.externalLinkName) {
        errors.push({
          field: `worksExternalLinkInformation[${index}].externalLinkName`,
          message: `External link name is required for link ${index + 1}`
        });
      }
      if (!link.externalLinkId) {
        errors.push({
          field: `worksExternalLinkInformation[${index}].externalLinkId`,
          message: `External link ID is required for link ${index + 1}`
        });
      }
      if (!link.externalLinkUrl) {
        errors.push({
          field: `worksExternalLinkInformation[${index}].externalLinkUrl`,
          message: `External link URL is required for link ${index + 1}`
        });
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => `${error.field}: ${error.message}`).join('\n');
}
