'use client';

import React, { useState } from 'react';
import ElmsFormSection from '@/components/ElmsFormSection';
import { validateElmsData, formatValidationErrors } from '@/components/validation';

export default function Home() {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [validationErrors, setValidationErrors] = useState<string>('');

  const handleFormSubmit = (data: any) => {
    const validation = validateElmsData(data);
    
    if (validation.isValid) {
      console.log('Form submitted with data:', data);
      alert('Form submitted successfully! Check the console for the data.');
      setValidationErrors('');
    } else {
      const errorMessage = formatValidationErrors(validation.errors);
      setValidationErrors(errorMessage);
      console.error('Validation errors:', validation.errors);
    }
  };

  const handleSectionChange = (sectionKey: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [sectionKey]: data
    }));
  };

  const sections = [
    'workInformation',
    'versionInformation',
    'accessibilityInformation'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ELMS 3.0 Variant Submission Demo
          </h1>
          <p className="text-gray-600 mb-6">
            <a href="https://the-next.eliterature.org/elms">The Extended eLectronic Metadata Schema (ELMS) 3.0 was created by The NEXT</a> as part of their archival efforts. This demo showcases a subset of all possible fields as part of an extended authorial submission process.
          </p>
          <p className="text-gray-600 mb-6">
            This demo <strong>does not</strong> submit data, but it will attempt to validate data values against the schema and ignore invalid data types. Advanced error detection may be handled in a future version.
          </p>
          <p className="text-gray-600 mb-6">
            This demo is also designed for <strong>single</strong> works and not collections. An additional section of the schema, not shown here, is required for handling collections of works.
          </p>
          
        </div>

        {(
          <div>
            <div className="grid grid-cols-1 gap-6">
              {sections.map((sectionKey) => (
                <div key={sectionKey} className="bg-white rounded-lg shadow-md">
                  <details className="group">
                    <summary className="cursor-pointer p-6 border-b border-gray-200 hover:bg-gray-50 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).replace(/([A-Z])/g, ' $1')}
                      </h3>
                      <svg 
                        className="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="p-6">
                      <ElmsFormSection
                        key={sectionKey}
                        sectionKey={sectionKey}
                        onSectionChange={handleSectionChange}
                        initialData={formData[sectionKey] || {}}
                      />
                    </div>
                  </details>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Combined Form Data</h3>
              
              {validationErrors && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="font-medium text-red-800 mb-2">Validation Errors:</h4>
                  <pre className="text-sm text-red-700 whitespace-pre-wrap">{validationErrors}</pre>
                </div>
              )}
              
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => handleFormSubmit(formData)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit All Data
                </button>
                <button
                  onClick={() => {
                    setFormData({});
                    setValidationErrors('');
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Clear All
                </button>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer font-medium text-gray-700">
                  View Current Data (JSON)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto text-sm">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        ) }
      </div>
    </div>
  );
}
