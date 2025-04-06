import { useTeams, useTeamsSuspense } from "@/hooks/database";
import * as React from "react";

export type Props = {};

function Summaries(props: Props) {
  const {} = props;

  const { data: teams } = useTeamsSuspense();

  return (
    <div className="my-6">
      {teams.length === 0 && (
        <div className="text-center">
          <p className="text-gray-500">팀이 없습니다.</p>
          <p className="text-gray-500">팀을 생성하여 시작하세요.</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="border p-4 rounded-md">
            <h3 className="text-lg font-semibold">{team.name}</h3>
            <p>{team.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(Summaries);
