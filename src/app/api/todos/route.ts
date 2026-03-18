import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Singleton Prisma Client for serverless
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// GET - Alle Todos abrufen
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    return NextResponse.json(todos)
  } catch (error: unknown) {
    console.error('GET Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Fehler beim Abrufen', details: errorMessage }, { status: 500 })
  }
}

// POST - Neues Todo erstellen
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, priority } = body

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Titel ist erforderlich' }, { status: 400 })
    }

    console.log('Creating todo:', { title, description, priority })

    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: 'TODO',
        priority: priority || 'MEDIUM'
      }
    })

    console.log('Created todo:', todo)
    return NextResponse.json(todo, { status: 201 })
  } catch (error: unknown) {
    console.error('POST Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Fehler beim Erstellen', details: errorMessage }, { status: 500 })
  }
}
