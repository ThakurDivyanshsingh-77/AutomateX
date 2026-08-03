import React from 'react';
import { TextField } from './fields/TextField';
import { SelectField } from './fields/SelectField';
import { NumberField } from './fields/NumberField';
import { TextareaField } from './fields/TextareaField';
import { KeyValueEditor } from './fields/KeyValueEditor';
import { RetryConfigFields } from './fields/RetryConfigFields';

export const AutoForm = ({ configSchema = [], config = {}, errors = {}, onChange }) => {
  return (
    <div className="space-y-4">
      {configSchema && configSchema.length > 0 ? (
        configSchema.map((field) => {
          const fieldValue = config[field.name];
          const fieldError = errors[field.name];

          switch (field.type) {
            case 'text':
              return (
                <TextField
                  key={field.name}
                  label={field.label}
                  value={fieldValue}
                  placeholder={field.placeholder}
                  description={field.description}
                  error={fieldError}
                  onChange={(val) => onChange(field.name, val)}
                />
              );

            case 'select':
              return (
                <SelectField
                  key={field.name}
                  label={field.label}
                  value={fieldValue}
                  options={field.options}
                  description={field.description}
                  error={fieldError}
                  onChange={(val) => onChange(field.name, val)}
                />
              );

            case 'number':
              return (
                <NumberField
                  key={field.name}
                  label={field.label}
                  value={fieldValue}
                  min={field.min}
                  max={field.max}
                  description={field.description}
                  error={fieldError}
                  onChange={(val) => onChange(field.name, val)}
                />
              );

            case 'textarea':
              return (
                <TextareaField
                  key={field.name}
                  label={field.label}
                  value={fieldValue}
                  placeholder={field.placeholder}
                  rows={field.rows || 3}
                  description={field.description}
                  error={fieldError}
                  onChange={(val) => onChange(field.name, val)}
                />
              );

            case 'keyvalue':
              return (
                <KeyValueEditor
                  key={field.name}
                  label={field.label}
                  value={fieldValue}
                  description={field.description}
                  onChange={(val) => onChange(field.name, val)}
                />
              );

            default:
              return (
                <TextField
                  key={field.name}
                  label={field.label}
                  value={fieldValue}
                  onChange={(val) => onChange(field.name, val)}
                />
              );
          }
        })
      ) : (
        <p className="text-[11px] text-slate-500 font-mono italic">
          No custom parameters configured.
        </p>
      )}

      {/* Global Node Retry Policy Accordion */}
      <RetryConfigFields config={config} onChange={onChange} />
    </div>
  );
};
