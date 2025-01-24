import { useState } from 'react'
import { createTeam, addTeamMember, removeTeamMember } from '@/lib/api'
import { User } from '@supabase/auth-helpers-react'
import { useTeams } from '@/hooks/database'

export default function TeamsClient({
  user,
  teams,
}: {
  user: User
  teams: useTeams.ReturnData;
}) {
  const [newTeamName, setNewTeamName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<useTeams.TeamWithMembers | null>(null)

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTeam(user, newTeamName)
      setNewTeamName('')
      window.location.reload()
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam) return

    try {
      await addTeamMember(selectedTeam.id, newMemberEmail)
      setNewMemberEmail('')
      window.location.reload()
    } catch (error) {
      console.error('Error adding team member:', error)
    }
  }

  const handleRemoveMember = async (teamId: number, userId: string) => {
    try {
      await removeTeamMember(teamId, userId)
      window.location.reload()
    } catch (error) {
      console.error('Error removing team member:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Create Team Form */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">새 팀 만들기</h2>
        <form onSubmit={handleCreateTeam} className="flex gap-2">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="팀 이름"
            required
            minLength={3}
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            생성
          </button>
        </form>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">내 팀</h2>
        {teams?.map((team) => (
          <div key={team.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{team.name}</h3>
              <button
                onClick={() => setSelectedTeam(selectedTeam?.id === team.id ? null : team)}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                {selectedTeam?.id === team.id ? '접기' : '팀원 관리'}
              </button>
            </div>

            {selectedTeam?.id === team.id && (
              <div className="space-y-4">
                {/* Add Member Form */}
                {team.owner_id === user?.id && (
                  <form onSubmit={handleAddMember} className="flex gap-2">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="팀원 이메일"
                      required
                      className="flex-1 px-3 py-2 border rounded"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      추가
                    </button>
                  </form>
                )}

                {/* Team Members List */}
                <div className="space-y-2">
                  {team.team_members.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>
                        {member.user_id === user?.id ? '나' : member.user_id}{' '}
                        {member.role === 'owner' && '(팀장)'}
                      </span>
                      {team.owner_id === user?.id && member.user_id !== user?.id && (
                        <button
                          onClick={() => handleRemoveMember(team.id, member.user_id)}
                          className="px-2 py-1 text-sm text-red-500 hover:text-red-600"
                        >
                          제거
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}