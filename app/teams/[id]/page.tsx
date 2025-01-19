"use client";

import { cookies } from "next/headers";
import TeamTodosClient from "./team-todos-client";
import Link from "next/link";
import { useSupabaseClient } from "@/lib/initSupabase";
import { useSession } from "@supabase/auth-helpers-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useForTeamTodoPage } from "@/hooks/database";

export default function TeamTodosPage({
  params: { id },
}: {
  params: { id: number };
}) {
  const {
    data: { user, todos, team },
  } = useForTeamTodoPage(id);

  if (!team) {
    return <div>Team not found</div>;
  }

  const { team_members } = team;
  if (!(team_members instanceof Array)) {
    return <div>Invalid team_members type</div>;
  }

  // Check if user is a member of the team
  const isMember = team_members?.some(
    (member) => member.user_id === user?.id
  );
  if (!isMember) {
    return <div>Access denied</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{team.name} - 할일 목록</h1>
        <Link
          href="/teams"
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          팀 목록으로
        </Link>
      </div>
      <TeamTodosClient user={user} todos={todos} teamId={id} />
    </div>
  );
}
