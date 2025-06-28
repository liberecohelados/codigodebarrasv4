import React from 'react';
import { Listbox } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
}

export default function Dropdown({ options, value, onChange }: DropdownProps) {
  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Button className="w-full text-left border border-neutral-200 rounded-xl px-3 py-2 focus:border-brand focus:ring focus:ring-brand-light focus:ring-opacity-50">
            {options.find(o => o.value === value)?.label || 'Seleccione'}
          </Listbox.Button>
          <AnimatePresence>
            {open && (
              <Listbox.Options
                as={motion.ul}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute mt-2 w-full bg-white rounded-2xl shadow-lg overflow-auto max-h-60 z-10"
              >
                {options.map(o => (
                  <Listbox.Option key={o.value} value={o.value} as={React.Fragment}>
                    {({ active, selected }) => (
                      <li
                        className={`cursor-pointer select-none p-2 ${
                          active ? 'bg-brand-light' : ''
                        } ${selected ? 'font-medium text-brand' : ''}`}
                      >
                        {o.label}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            )}
          </AnimatePresence>
        </div>
      )}
    </Listbox>
  );
}
