"use client";

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Checkbox } from './checkbox'
import { Button } from './button'
// Temporary: Using custom icons until lucide-react is installed
// import { Pencil, Trash2 } from 'lucide-react';
// Creating inline icons for task card
const Pencil = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
    <path d="m15 5 4 4"></path>
  </svg>
);

const Trash2 = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

import { motion } from 'framer-motion'

interface TaskCardProps {
  id: string
  title: string
  description?: string
  category: string
  completed: boolean
  onComplete: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export function TaskCard({
  id,
  title,
  description,
  category,
  completed,
  onComplete,
  onDelete,
  onEdit,
}: TaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`w-full ${completed ? 'opacity-60' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={completed}
              onCheckedChange={(checked) => onComplete(id, checked as boolean)}
            />
            <CardTitle className={`text-lg ${completed ? 'line-through' : ''}`}>
              {title}
            </CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(id)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <Badge variant="secondary" className="mt-2">
            {category}
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  )
}