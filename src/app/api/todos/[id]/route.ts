import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Singleton Prisma Client for serverless
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// PUT - Todo aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, status, priority } = body

    const updateData: {
      title?: string
      description?: string | null
      status?: string
      priority?: string
    } = {}

    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority

    console.log('Updating todo:', { id, updateData })

    const todo = await prisma.todo.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(todo)
  } catch (error: unknown) {
    console.error('PUT Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Fehler beim Aktualisieren', details: errorMessage }, { status: 500 })
  }
}

// DELETE - Todo löschen
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.todo.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Fehler beim Löschen', details: errorMessage }, { status: 500 })
  }
}
