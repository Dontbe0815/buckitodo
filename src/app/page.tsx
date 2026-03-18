'use client'

import { useState, useEffect } from 'react'
import { Plus, ChevronDown, ChevronUp, X, ClipboardList, Loader2, Check, AlertCircle, Bug, Clock, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'BUGS' | 'COMPLETE'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

interface Todo {
  id: string
  title: string
  description: string | null
  status: TodoStatus
  priority: Priority
  createdAt: string
  updatedAt: string
}

const statusConfig: Record<TodoStatus, { label: string; shortLabel: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  TODO: { 
    label: 'ToDo', 
    shortLabel: 'ToDo', 
    color: 'text-slate-700', 
    bgColor: 'bg-slate-100',
    icon: <Clock className="w-4 h-4" />
  },
  IN_PROGRESS: { 
    label: 'In Bearbeitung', 
    shortLabel: 'Laufend', 
    color: 'text-amber-700', 
    bgColor: 'bg-amber-100',
    icon: <AlertCircle className="w-4 h-4" />
  },
  BUGS: { 
    label: 'Bugs', 
    shortLabel: 'Bugs', 
    color: 'text-red-700', 
    bgColor: 'bg-red-100',
    icon: <Bug className="w-4 h-4" />
  },
  COMPLETE: { 
    label: 'Komplett', 
    shortLabel: 'Fertig', 
    color: 'text-emerald-700', 
    bgColor: 'bg-emerald-100',
    icon: <Check className="w-4 h-4" />
  },
}

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; borderColor: string }> = {
  LOW: { 
    label: 'Niedrig', 
    color: 'text-slate-600', 
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200'
  },
  MEDIUM: { 
    label: 'Mittel', 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  HIGH: { 
    label: 'Hoch', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteTodoId, setDeleteTodoId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      const data = await response.json()
      
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error('API returned non-array:', data)
        setError('Fehler beim Laden der Aufgaben')
        setTodos([])
        return
      }

      const sortedTodos = [...data].sort((a, b) => {
        if (a.status === 'COMPLETE' && b.status !== 'COMPLETE') return 1
        if (a.status !== 'COMPLETE' && b.status === 'COMPLETE') return -1
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
        if (a.status !== 'COMPLETE' && b.status !== 'COMPLETE') {
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority]
          }
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      setTodos(sortedTodos)
      setError(null)
    } catch (error) {
      console.error('Fehler beim Laden:', error)
      setError('Fehler beim Laden der Aufgaben')
      setTodos([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const addTodo = async () => {
    if (!newTitle.trim()) return
    setIsAdding(true)
    setError(null)
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription, priority: newPriority }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Fehler beim Speichern')
        return
      }
      
      setNewTitle('')
      setNewDescription('')
      setNewPriority('MEDIUM')
      await fetchTodos()
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error)
      setError('Fehler beim Speichern der Aufgabe')
    } finally {
      setIsAdding(false)
    }
  }

  const updateStatus = async (id: string, status: TodoStatus) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await fetchTodos()
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error)
    }
  }

  const updatePriority = async (id: string, priority: Priority) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      })
      await fetchTodos()
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error)
    }
  }

  const deleteTodo = async () => {
    if (!deleteTodoId) return
    try {
      await fetch(`/api/todos/${deleteTodoId}`, { method: 'DELETE' })
      await fetchTodos()
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
    } finally {
      setDeleteTodoId(null)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const cycleStatus = async (id: string, currentStatus: TodoStatus) => {
    const statusOrder: TodoStatus[] = ['TODO', 'IN_PROGRESS', 'BUGS', 'COMPLETE']
    const currentIndex = statusOrder.indexOf(currentStatus)
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
    await updateStatus(id, nextStatus)
  }

  const cyclePriority = async (id: string, currentPriority: Priority) => {
    const priorityOrder: Priority[] = ['LOW', 'MEDIUM', 'HIGH']
    const currentIndex = priorityOrder.indexOf(currentPriority)
    const nextPriority = priorityOrder[(currentIndex + 1) % priorityOrder.length]
    await updatePriority(id, nextPriority)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="pb-safe">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 mb-3 sm:mb-4">
              <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-1 sm:mb-2">
              Team To-Do Liste
            </h1>
            <p className="text-sm sm:text-base text-slate-500">
              Kollaborativ Aufgaben verwalten
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Neues Todo Formular */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <Input
                placeholder="Neue Aufgabe hinzufügen..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                className="text-base sm:text-lg border-0 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 px-3 sm:px-4 py-3 h-12 sm:h-auto"
              />
              <Textarea
                placeholder="Beschreibung (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="min-h-[80px] border-0 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 resize-none px-3 sm:px-4 py-3 text-base"
              />
              
              {/* Priority Select */}
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-slate-400" />
                <Select
                  value={newPriority}
                  onValueChange={(value) => setNewPriority(value as Priority)}
                >
                  <SelectTrigger className={cn(
                    "flex-1 sm:w-40 border-0 font-medium",
                    priorityConfig[newPriority].color,
                    priorityConfig[newPriority].bgColor
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className={config.color}>{config.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={addTodo}
                disabled={!newTitle.trim() || isAdding}
                className="w-full sm:w-auto sm:self-end bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/30 transition-all duration-200 px-6 h-12 sm:h-10 text-base font-medium"
              >
                {isAdding ? (
                  <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                )}
                Hinzufügen
              </Button>
            </div>
          </div>

          {/* Todo Liste */}
          <div className="space-y-2 sm:space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-base">Noch keine Aufgaben vorhanden</p>
                <p className="text-sm mt-1">Füge die erste Aufgabe hinzu!</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    "bg-white rounded-xl border transition-all duration-300 overflow-hidden",
                    todo.status === 'COMPLETE' 
                      ? "border-slate-200 opacity-70" 
                      : cn("shadow-sm active:shadow-md", priorityConfig[todo.priority].borderColor)
                  )}
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => toggleExpand(todo.id)}
                        className="flex-shrink-0 w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 transition-colors touch-manipulation"
                      >
                        {expandedId === todo.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            todo.priority === 'HIGH' && "bg-red-500",
                            todo.priority === 'MEDIUM' && "bg-amber-500",
                            todo.priority === 'LOW' && "bg-slate-400"
                          )} />
                          <h3
                            className={cn(
                              "font-medium text-slate-800 transition-all text-base sm:text-base cursor-pointer truncate",
                              todo.status === 'COMPLETE' && "line-through text-slate-400"
                            )}
                            onClick={() => toggleExpand(todo.id)}
                          >
                            {todo.title}
                          </h3>
                        </div>
                      </div>

                      {/* Desktop */}
                      <div className="hidden sm:flex items-center gap-2">
                        <Select
                          value={todo.priority}
                          onValueChange={(value) => updatePriority(todo.id, value as Priority)}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-auto border-0 font-medium text-sm h-9",
                              priorityConfig[todo.priority].color,
                              priorityConfig[todo.priority].bgColor,
                              "hover:opacity-80 transition-opacity"
                            )}
                          >
                            <Flag className="w-3.5 h-3.5 mr-1" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(priorityConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <span className={config.color}>{config.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={todo.status}
                          onValueChange={(value) => updateStatus(todo.id, value as TodoStatus)}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-auto border-0 font-medium text-sm h-9",
                              statusConfig[todo.status].color,
                              statusConfig[todo.status].bgColor,
                              "hover:opacity-80 transition-opacity"
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <span className={config.color}>{config.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <button
                          onClick={() => setDeleteTodoId(todo.id)}
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 active:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Mobile */}
                      <div className="flex sm:hidden items-center gap-1">
                        <button
                          onClick={() => cyclePriority(todo.id, todo.priority)}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1.5 rounded-full font-medium text-xs touch-manipulation",
                            priorityConfig[todo.priority].color,
                            priorityConfig[todo.priority].bgColor,
                            "active:scale-95 transition-transform"
                          )}
                        >
                          <Flag className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => cycleStatus(todo.id, todo.status)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm touch-manipulation",
                            statusConfig[todo.status].color,
                            statusConfig[todo.status].bgColor,
                            "active:scale-95 transition-transform"
                          )}
                        >
                          {statusConfig[todo.status].icon}
                          <span>{statusConfig[todo.status].shortLabel}</span>
                        </button>

                        <button
                          onClick={() => setDeleteTodoId(todo.id)}
                          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center active:bg-red-100 text-slate-400 active:text-red-500 transition-colors touch-manipulation"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedId === todo.id && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                      <div className="pl-9 sm:pl-11 border-l-2 border-slate-100 ml-2 sm:ml-4">
                        {todo.description ? (
                          <p className="text-slate-600 whitespace-pre-wrap py-2 text-sm sm:text-base">
                            {todo.description}
                          </p>
                        ) : (
                          <p className="text-slate-400 italic py-2 text-sm sm:text-base">
                            Keine Beschreibung vorhanden
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
                          <span>
                            Erstellt: {new Date(todo.createdAt).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full",
                            priorityConfig[todo.priority].bgColor,
                            priorityConfig[todo.priority].color
                          )}>
                            Priorität: {priorityConfig[todo.priority].label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Stats */}
          {!isLoading && todos.length > 0 && (
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4 text-sm sm:text-base text-slate-500">
              <span className="bg-white px-3 py-2 rounded-lg border border-slate-200">
                <strong className="text-slate-700">{todos.filter(t => t.status !== 'COMPLETE').length}</strong> offen
              </span>
              <span className="bg-white px-3 py-2 rounded-lg border border-slate-200">
                <strong className="text-slate-700">{todos.filter(t => t.status === 'COMPLETE').length}</strong> erledigt
              </span>
              <span className="bg-white px-3 py-2 rounded-lg border border-red-200 text-red-600">
                <strong className="text-red-700">{todos.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETE').length}</strong> mit hoher Priorität
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Löschen Bestätigungsdialog */}
      <AlertDialog open={!!deleteTodoId} onOpenChange={() => setDeleteTodoId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Aufgabe löschen?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              Diese Aktion kann nicht rückgängig gemacht werden. Die Aufgabe wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto h-11 sm:h-10">Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTodo}
              className="w-full sm:w-auto h-11 sm:h-10 bg-red-500 hover:bg-red-600"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
