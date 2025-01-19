'use client'

import { useState } from 'react'
import { createTeamTodo } from '@/lib/api'
import { User } from '@supabase/auth-helpers-react'
import { NullableProps, Optional } from '@/lib/types'
import { useForTeamTodoPage } from '@/hooks/database'


export default function TeamTodosClient({
  user,
  todos,
  teamId,
}: {
  user: User | null
  todos: useForTeamTodoPage.ReturnData['todos'] | null
  teamId: number
}) {
  const [newTaskText, setNewTaskText] = useState('')

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTeamTodo(teamId, newTaskText)
      setNewTaskText('')
      window.location.reload()
    } catch (error) {
      console.error('Error creating todo:', error)
    }
  }

  const handleToggleTodo = async (todoId: number, isComplete: boolean) => {
    try {
      const response = await fetch(`/todos/${todoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isComplete: !isComplete }),
      })

      if (!response.ok) {
        throw new Error('Failed to update todo')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const handleDeleteTodo = async (todoId: number) => {
    try {
      const response = await fetch(`/todos/${todoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete todo')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Todo Form */}
      <form onSubmit={handleCreateTodo} className="flex gap-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="할일 입력"
          required
          minLength={3}
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          추가
        </button>
      </form>

      {/* Todos List */}
      <div className="space-y-2">
        {todos?.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={todo.is_complete}
                onChange={() => handleToggleTodo(todo.id, todo.is_complete)}
                className="w-4 h-4"
              />
              <div>
                <p className={todo.is_complete ? 'line-through text-gray-500' : ''}>
                  {todo.task}
                </p>
                <p className="text-sm text-gray-500">
                  작성자: {todo.user_id === user?.id ? '나' : (todo as any).user.email}
                </p>
              </div>
            </div>
            {todo.user_id === user?.id && (
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="px-2 py-1 text-sm text-red-500 hover:text-red-600"
              >
                삭제
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}