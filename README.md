# ELMS Form Application

This application provides React components for handling the Extended eLectronic Metadata Schema (ELMS) form inputs based on the JSON schema.

An example can be found here: [https://videlais.github.io/elms-app/](https://videlais.github.io/elms-app/).

## Components

### `<ElmsForm />`

A comprehensive form component that renders all fields from the ELMS schema in a single form.

**Features:**

- Dynamically generates form fields based on the schema
- Handles all data types: string, integer, boolean, array, object
- Supports enums, URLs, dates, and complex nested objects
- Built-in validation for required fields
- Responsive design with Tailwind CSS

**Usage:**

```tsx
import ElmsForm from '@/components/ElmsForm';

function MyPage() {
  const handleSubmit = (data) => {
    console.log('Form data:', data);
    // Process the form data
  };

  return (
    <ElmsForm 
      onSubmit={handleSubmit}
      initialData={{}} // Optional initial data
    />
  );
}
```

### `<ElmsFormSection />`

A component that renders individual sections of the ELMS schema, useful for breaking down the large form into manageable pieces.

**Features:**

- Renders specific sections like 'workInformation', 'versionInformation', etc.
- Allows for modular form building
- Real-time data updates with callbacks
- Same field types support as ElmsForm

**Usage:**

```tsx
import ElmsFormSection from '@/components/ElmsFormSection';

function MyPage() {
  const handleSectionChange = (sectionKey, data) => {
    console.log(`Section ${sectionKey} updated:`, data);
  };

  return (
    <ElmsFormSection
      sectionKey="workInformation"
      onSectionChange={handleSectionChange}
      initialData={{}}
    />
  );
}
```

### Validation Utility

A utility for validating ELMS form data against the schema requirements.

**Features:**

- Validates required fields
- Checks URL formats
- Validates year ranges
- Validates array items
- Returns detailed error messages

**Usage:**

```tsx
import { validateElmsData, formatValidationErrors } from '@/components/validation';

const validation = validateElmsData(formData);
if (!validation.isValid) {
  const errorMessage = formatValidationErrors(validation.errors);
  console.error('Validation errors:', errorMessage);
}
```

## Schema Support

The components support all field types defined in the ELMS schema:

### Basic Types

- **String**: Text inputs, with special handling for URLs and dates
- **Integer**: Number inputs with min/max validation
- **Boolean**: Checkboxes

### Complex Types

- **Enum**: Dropdown selects with predefined options
- **Array**: Dynamic lists with add/remove functionality
- **Object**: Nested form sections

### Special Formats

- **URI**: URL inputs with validation
- **Date**: Date picker inputs
- **Email**: Email inputs (if specified in schema)
