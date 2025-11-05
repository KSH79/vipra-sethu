"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  defaultOpen?: boolean;
}

/**
 * Accordion item component for collapsible sections
 */
export function AccordionItem({ title, defaultOpen = false, children, className, ...props }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border-b border-gray-100", className)} {...props}>
      <button
        className="w-full flex items-center justify-between py-4 px-4 md:px-6 text-left hover:bg-sandstone/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron/40 focus-visible:ring-offset-0"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-slate-900">{title}</span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-sandstone/70 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="py-5 px-4 md:px-6 text-sm text-slate-700">
          {children}
        </div>
      )}
    </div>
  );
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  items: AccordionItemProps[];
}

/**
 * Accordion container component
 */
export function Accordion({ items, className, ...props }: AccordionProps) {
  return (
    <div className={cn("divide-y divide-gray-100", className)} {...props}>
      {items.map((item, index) => (
        <AccordionItem key={index} {...item} />
      ))}
    </div>
  );
}
