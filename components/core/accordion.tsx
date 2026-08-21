'use client'

import { ChevronDown } from 'lucide-react'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Transition,
  type Variant,
  type Variants,
} from 'motion/react'
import React, {
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode,
} from 'react'

type AccordionContextValue = {
  expandedValue: React.Key | null
  toggleItem: (value: React.Key) => void
  variants?: { expanded: Variant; collapsed: Variant }
}

type AccordionItemContextValue = {
  value: React.Key
  isExpanded: boolean
  triggerId: string
  contentId: string
}

const AccordionContext = createContext<AccordionContextValue | null>(null)
const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null
)

function useAccordion() {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion components must be used within Accordion.')
  }
  return context
}

function useAccordionItem() {
  const context = useContext(AccordionItemContext)
  if (!context) {
    throw new Error(
      'AccordionTrigger and AccordionContent must be used within AccordionItem.'
    )
  }
  return context
}

export type AccordionProps = {
  children: ReactNode
  className?: string
  transition?: Transition
  variants?: { expanded: Variant; collapsed: Variant }
  expandedValue?: React.Key | null
  onValueChange?: (value: React.Key | null) => void
}

function Accordion({
  children,
  className,
  transition,
  variants,
  expandedValue: controlledExpandedValue,
  onValueChange,
}: AccordionProps) {
  const [internalExpandedValue, setInternalExpandedValue] =
    useState<React.Key | null>(null)
  const isControlled = controlledExpandedValue !== undefined
  const expandedValue = isControlled
    ? controlledExpandedValue
    : internalExpandedValue

  const toggleItem = (value: React.Key) => {
    const nextValue = expandedValue === value ? null : value
    if (!isControlled) setInternalExpandedValue(nextValue)
    onValueChange?.(nextValue)
  }

  return (
    <MotionConfig transition={transition} reducedMotion="user">
      <AccordionContext.Provider
        value={{ expandedValue, toggleItem, variants }}
      >
        <div className={className}>{children}</div>
      </AccordionContext.Provider>
    </MotionConfig>
  )
}

export type AccordionItemProps = {
  value: React.Key
  children: ReactNode
  className?: string
}

function AccordionItem({ value, children, className }: AccordionItemProps) {
  const { expandedValue } = useAccordion()
  const isExpanded = value === expandedValue
  const id = useId()

  return (
    <AccordionItemContext.Provider
      value={{
        value,
        isExpanded,
        triggerId: `${id}-trigger`,
        contentId: `${id}-content`,
      }}
    >
      <div
        className={className}
        {...(isExpanded ? { 'data-expanded': '' } : { 'data-closed': '' })}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

export type AccordionTriggerProps = {
  children: ReactNode
  className?: string
}

function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const { toggleItem } = useAccordion()
  const { value, isExpanded, triggerId, contentId } = useAccordionItem()

  return (
    <button
      id={triggerId}
      type="button"
      className={className}
      aria-controls={contentId}
      aria-expanded={isExpanded}
      onClick={() => toggleItem(value)}
      {...(isExpanded ? { 'data-expanded': '' } : { 'data-closed': '' })}
    >
      {children}
      <span className="accordion-trigger-chevron" aria-hidden="true">
        <ChevronDown size={18} strokeWidth={1.5} />
      </span>
    </button>
  )
}

export type AccordionContentProps = {
  children: ReactNode
  className?: string
}

function AccordionContent({ children, className }: AccordionContentProps) {
  const { variants } = useAccordion()
  const { isExpanded, triggerId, contentId } = useAccordionItem()
  const baseVariants: Variants = {
    expanded: { height: 'auto', opacity: 1 },
    collapsed: { height: 0, opacity: 0 },
  }
  const combinedVariants = {
    expanded: { ...baseVariants.expanded, ...variants?.expanded },
    collapsed: { ...baseVariants.collapsed, ...variants?.collapsed },
  }

  return (
    <AnimatePresence initial={false}>
      {isExpanded ? (
        <motion.div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          initial="collapsed"
          animate="expanded"
          exit="collapsed"
          variants={combinedVariants}
          className={className}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
