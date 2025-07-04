'use client';

import React, { useState, useEffect } from 'react';
import schema from './elms-schema.json';

// Simple UUID generator function
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Generate a unique numeric ID for integer fields
const generateNumericId = (): number => {
  return Math.floor(Math.random() * 1000000) + 1;
};

interface FormSectionProps {
  sectionKey: string;
  onSectionChange?: (sectionKey: string, data: SectionData) => void;
  initialData?: SectionData;
}

interface SectionData {
  [key: string]: SectionValue;
}

type SectionValue = string | number | boolean | SectionValue[] | SectionData | null | undefined;

interface SchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  format?: string;
  minimum?: number;
  maximum?: number;
  items?: SchemaProperty;
  properties?: { [key: string]: SchemaProperty };
  required?: string[];
}

export default function ElmsFormSection({ sectionKey, onSectionChange, initialData = {} }: FormSectionProps) {
  const [sectionData, setSectionData] = useState(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const sectionSchema = (schema.properties as Record<string, SchemaProperty>)[sectionKey] as SchemaProperty;
  
  // Generate UUID for workId if this is the workInformation section and workId doesn't exist
  useEffect(() => {
    if (sectionKey === 'workInformation' && !sectionData.workId) {
      // Check if workId should be a string or integer based on schema
      const workIdProperty = sectionSchema.properties?.workId;
      const newWorkId = workIdProperty?.type === 'integer' ? generateNumericId() : generateUUID();
      const newData = { ...sectionData, workId: newWorkId };
      setSectionData(newData);
      
      if (onSectionChange) {
        onSectionChange(sectionKey, newData);
      }
    }
  }, [sectionData, sectionKey, sectionData.workId, onSectionChange, sectionSchema.properties]);
  
  if (!sectionSchema) {
    return <div>Section not found</div>;
  }

  const updateValue = (path: string, value: SectionValue) => {
    const newData: SectionData = { ...sectionData };
    const keys = path.split('.');
    let current: SectionData = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
        current[keys[i]] = {};
      }
      current = current[keys[i]] as SectionData;
    }
    
    current[keys[keys.length - 1]] = value;
    setSectionData(newData);
    
    if (onSectionChange) {
      onSectionChange(sectionKey, newData);
    }
    
    // Clear error
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: '' }));
    }
  };

  const getValue = (path: string): SectionValue => {
    const keys = path.split('.');
    let current: SectionValue = sectionData;
    
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = (current as SectionData)[key];
    }
    
    return current;
  };

  const renderField = (key: string, property: SchemaProperty, path: string = key): React.ReactNode => {
    const fieldId = `${sectionKey}-${path}`;
    const value = getValue(path);
    const isRequired = sectionSchema.required?.includes(key);
    
    const fieldClasses = `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
      errors[path] ? 'border-red-500' : ''
    }`;

    const renderLabel = () => (
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
        {property.description && (
          <span className="block text-xs text-gray-500 font-normal mt-1">
            {property.description}
          </span>
        )}
      </label>
    );

    const renderError = () => (
      errors[path] && (
        <p className="mt-1 text-sm text-red-600">{errors[path]}</p>
      )
    );

    switch (property.type) {
      case 'string':
        if (property.enum) {
          return (
            <div key={path} className="mb-4">
              {renderLabel()}
              <select
                id={fieldId}
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => updateValue(path, e.target.value)}
                className={fieldClasses}
                disabled={key === 'workId'}
                style={key === 'workId' ? { backgroundColor: '#f9fafb', cursor: 'not-allowed' } : {}}
              >
                <option value="">Select an option</option>
                {property.enum.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {key === 'workId' && (
                <p className="mt-1 text-xs text-gray-500">
                  This ID is automatically generated and cannot be changed
                </p>
              )}
              {renderError()}
            </div>
          );
        }
        
        if (property.format === 'uri') {
          return (
            <div key={path} className="mb-4">
              {renderLabel()}
              <input
                id={fieldId}
                type="url"
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => updateValue(path, e.target.value)}
                placeholder="https://example.com"
                className={fieldClasses}
                readOnly={key === 'workId'}
                style={key === 'workId' ? { backgroundColor: '#f9fafb', cursor: 'not-allowed' } : {}}
              />
              {key === 'workId' && (
                <p className="mt-1 text-xs text-gray-500">
                  This ID is automatically generated and cannot be changed
                </p>
              )}
              {renderError()}
            </div>
          );
        }
        
        if (property.format === 'date') {
          return (
            <div key={path} className="mb-4">
              {renderLabel()}
              <input
                id={fieldId}
                type="date"
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => updateValue(path, e.target.value)}
                className={fieldClasses}
                readOnly={key === 'workId'}
                style={key === 'workId' ? { backgroundColor: '#f9fafb', cursor: 'not-allowed' } : {}}
              />
              {key === 'workId' && (
                <p className="mt-1 text-xs text-gray-500">
                  This ID is automatically generated and cannot be changed
                </p>
              )}
              {renderError()}
            </div>
          );
        }
        
        return (
          <div key={path} className="mb-4">
            {renderLabel()}
            <input
              id={fieldId}
              type="text"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => updateValue(path, e.target.value)}
              className={fieldClasses}
              readOnly={key === 'workId'}
              style={key === 'workId' ? { backgroundColor: '#f9fafb', cursor: 'not-allowed' } : {}}
            />
            {key === 'workId' && (
              <p className="mt-1 text-xs text-gray-500">
                This ID is automatically generated and cannot be changed
              </p>
            )}
            {renderError()}
          </div>
        );

      case 'integer':
        return (
          <div key={path} className="mb-4">
            {renderLabel()}
            <input
              id={fieldId}
              type="number"
              value={typeof value === 'number' ? value : ''}
              onChange={(e) => updateValue(path, parseInt(e.target.value) || 0)}
              min={property.minimum}
              max={property.maximum}
              className={fieldClasses}
              readOnly={key === 'workId'}
              style={key === 'workId' ? { backgroundColor: '#f9fafb', cursor: 'not-allowed' } : {}}
            />
            {key === 'workId' && (
              <p className="mt-1 text-xs text-gray-500">
                This ID is automatically generated and cannot be changed
              </p>
            )}
            {renderError()}
          </div>
        );

      case 'boolean':
        return (
          <div key={path} className="mb-4">
            <div className="flex items-center">
              <input
                id={fieldId}
                type="checkbox"
                checked={typeof value === 'boolean' ? value : false}
                onChange={(e) => updateValue(path, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={fieldId} className="ml-2 block text-sm text-gray-700">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {property.description && (
              <p className="text-xs text-gray-500 mt-1">{property.description}</p>
            )}
            {renderError()}
          </div>
        );

      case 'array':
        const arrayValue = Array.isArray(value) ? value : [];
        
        return (
          <div key={path} className="mb-6">
            {renderLabel()}
            <div className="border rounded-md p-4 bg-gray-50">
              {arrayValue.map((item: SectionValue, index: number) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={typeof item === 'string' ? item : ''}
                    onChange={(e) => {
                      const newArray = [...arrayValue];
                      newArray[index] = e.target.value;
                      updateValue(path, newArray);
                    }}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newArray = arrayValue.filter((_: SectionValue, i: number) => i !== index);
                      updateValue(path, newArray);
                    }}
                    className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newArray = [...arrayValue, ''];
                  updateValue(path, newArray);
                }}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Item
              </button>
            </div>
            {renderError()}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {sectionSchema.description && (
        <p className="text-gray-600 mb-4">{sectionSchema.description}</p>
      )}
      
      <div className="space-y-4">
        {sectionSchema.properties && Object.entries(sectionSchema.properties).map(([key, property]) => 
          renderField(key, property as SchemaProperty)
        )}
      </div>
    </div>
  );
}
