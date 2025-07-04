'use client';

import React, { useState, useCallback } from 'react';
import schema from './elms-schema.json';

interface FormData {
  [key: string]: any;
}

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

interface ElmsFormProps {
  onSubmit?: (data: FormData) => void;
  initialData?: FormData;
}

export default function ElmsForm({ onSubmit, initialData = {} }: ElmsFormProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const updateFormData = useCallback((path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: '' }));
    }
  }, [errors]);

  const getValueFromPath = (path: string): any => {
    const keys = path.split('.');
    let current = formData;
    
    for (const key of keys) {
      if (current === null || current === undefined) return undefined;
      current = current[key];
    }
    
    return current;
  };

  const validateRequired = (property: SchemaProperty, path: string): boolean => {
    const value = getValueFromPath(path);
    if (!value && property.required) {
      setErrors(prev => ({ ...prev, [path]: 'This field is required' }));
      return false;
    }
    return true;
  };

  const renderField = (key: string, property: SchemaProperty, path: string = key, level: number = 0): React.ReactNode => {
    const fieldId = `field-${path}`;
    const value = getValueFromPath(path);
    const isRequired = schema.required?.includes(key) || property.required?.includes(key);
    
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
                value={value || ''}
                onChange={(e) => updateFormData(path, e.target.value)}
                className={fieldClasses}
              >
                <option value="">Select an option</option>
                {property.enum.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
                value={value || ''}
                onChange={(e) => updateFormData(path, e.target.value)}
                placeholder="https://example.com"
                className={fieldClasses}
              />
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
                value={value || ''}
                onChange={(e) => updateFormData(path, e.target.value)}
                className={fieldClasses}
              />
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
              value={value || ''}
              onChange={(e) => updateFormData(path, e.target.value)}
              className={fieldClasses}
            />
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
              value={value || ''}
              onChange={(e) => updateFormData(path, parseInt(e.target.value) || '')}
              min={property.minimum}
              max={property.maximum}
              className={fieldClasses}
            />
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
                checked={value || false}
                onChange={(e) => updateFormData(path, e.target.checked)}
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
        const arrayValue = value || [];
        
        return (
          <div key={path} className="mb-6">
            {renderLabel()}
            <div className="border rounded-md p-4 bg-gray-50">
              {arrayValue.map((item: any, index: number) => (
                <div key={index} className="flex items-center mb-2">
                  {property.items?.type === 'string' ? (
                    <input
                      type="text"
                      value={item || ''}
                      onChange={(e) => {
                        const newArray = [...arrayValue];
                        newArray[index] = e.target.value;
                        updateFormData(path, newArray);
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex-1">
                      {property.items && renderField(`item-${index}`, property.items, `${path}.${index}`, level + 1)}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const newArray = arrayValue.filter((_: any, i: number) => i !== index);
                      updateFormData(path, newArray);
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
                  const newArray = [...arrayValue, property.items?.type === 'string' ? '' : {}];
                  updateFormData(path, newArray);
                }}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Item
              </button>
            </div>
            {renderError()}
          </div>
        );

      case 'object':
        if (!property.properties) return null;
        
        return (
          <div key={path} className={`mb-6 ${level > 0 ? 'ml-4 border-l-2 border-gray-200 pl-4' : ''}`}>
            <h3 className={`font-medium text-gray-900 mb-4 ${level === 0 ? 'text-lg' : 'text-md'}`}>
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </h3>
            {property.description && (
              <p className="text-sm text-gray-600 mb-4">{property.description}</p>
            )}
            <div className="space-y-4">
              {Object.entries(property.properties).map(([subKey, subProperty]) => 
                renderField(subKey, subProperty, `${path}.${subKey}`, level + 1)
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    let hasErrors = false;
    const newErrors: { [key: string]: string } = {};
    
    // Validate required fields
    if (schema.required) {
      schema.required.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required';
          hasErrors = true;
        }
      });
    }
    
    setErrors(newErrors);
    
    if (!hasErrors && onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {schema.title}
        </h1>
        <p className="text-gray-600 mb-8">{schema.description}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {Object.entries(schema.properties).map(([key, property]) => 
            renderField(key, property as SchemaProperty)
          )}
          
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({});
                setErrors({});
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Reset
            </button>
          </div>
        </form>
        
        {/* Debug section - remove in production */}
        <details className="mt-8 p-4 bg-gray-100 rounded-md">
          <summary className="cursor-pointer font-medium">Debug: Current Form Data</summary>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
