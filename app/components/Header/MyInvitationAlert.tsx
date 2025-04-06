"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MyInvitationDialog } from "./MyInvitationDialog";
import { useMyInvitations, useMyInvitationsSuspense, useTeams } from "@/hooks/database";
import { acceptTeamInvitation } from "@/lib/rpc/invitation";
import { TID_CHECK_INVITATION } from "@/test/test-id-list";

interface Props {
  // invitations: TeamInvitation[]
  // onViewInvitation: (invitation: TeamInvitation) => void
}

export function MyInvitationAlert({}: Props) {
  const [dismissed, setDismissed] = useState(false);

  const { data: myInvitationsAll, isLoading, isPending, refetch } = useMyInvitationsSuspense();
  const { refetch: refetchTeams} = useTeams();

  const pendingInvitations = myInvitationsAll.filter((inv) => inv.status === "pending");

  const [activeInvitation, setActiveInvitation] = useState(
    pendingInvitations[0] || null
  );
  const [open, setOpen] = useState(false);

  if (pendingInvitations.length === 0 || dismissed) {
    return null;
  }

  // console.log("MyInvitationAlert", { isLoading, isPending, activeInvitation });
  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-md p-4 mb-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">닫기</span>
        </Button>

        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-full">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">
              {pendingInvitations.length}개의 팀 초대가 있습니다
            </h3>
            <p className="text-sm text-muted-foreground">
              {pendingInvitations.map((inv) => inv.team_name).join(", ")} 팀에서
              초대를 보냈습니다.
            </p>
          </div>
          <Button
            data-testid={TID_CHECK_INVITATION}
            variant="default"
            className="shrink-0 mr-8"
            onClick={() => {
              setOpen(true);
            }}
          >
            확인하기
          </Button>
        </div>
      </div>
      <MyInvitationDialog
        invitation={activeInvitation}
        open={open}
        onAccept={async () => {
          // console.log("onAccept", activeInvitation);
          await acceptTeamInvitation(activeInvitation.token);
          await refetch();
          await refetchTeams();
          setOpen(false);
        }}
        onDecline={() => {
          // handle decline
          setOpen(false);
        }}
        onOpenChange={setOpen}
      />
    </>
  );
}
