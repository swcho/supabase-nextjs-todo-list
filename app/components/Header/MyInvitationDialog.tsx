"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarDays, Users } from "lucide-react";
import { getMyInvitations } from "@/lib/rpc/invitation";
import { UserInvitation } from "@/lib/types";
import {
  TID_ACCEPT_INVITATION,
  TID_DECLINE_INVITATION,
} from "@/test/test-id-list";

// export interface TeamInvitation {
//   id: string
//   teamId: string
//   teamName: string
//   inviterName: string
//   inviterEmail: string
//   inviterAvatar: string
//   role: "Admin" | "Member" | "Viewer"
//   createdAt: string
//   expiresAt: string
// }

interface Props {
  invitation: UserInvitation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
}

export function MyInvitationDialog({
  invitation,
  open,
  onOpenChange,
  onAccept,
  onDecline,
}: Props) {
  if (!invitation) return null;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin":
        return "default";
      case "Member":
        return "secondary";
      case "Viewer":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "Admin":
        return "모든 설정 및 팀원 관리 권한";
      case "Member":
        return "작업 생성 및 수정 권한";
      case "Viewer":
        return "읽기 전용 권한";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>팀 초대</DialogTitle>
          <DialogDescription>
            {invitation.team_name} 팀에서 초대를 보냈습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              {/* <AvatarImage src={invitation.inviterAvatar} alt={invitation.team_name} /> */}
              <AvatarFallback>
                {invitation.team_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{invitation.team_name}</h4>
              {/* <p className="text-sm text-muted-foreground">{invitation.inviterEmail}</p> */}
              <p className="text-sm mt-1">
                {invitation.team_name} 팀에 참여하도록 초대했습니다.
              </p>
            </div>
          </div>

          {/* <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">초대된 역할:</span>
              <Badge variant={getRoleBadgeVariant(invitation.role) as any}>{invitation.role}</Badge>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{getRoleDescription(invitation.role)}</p>
          </div> */}

          {/* <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">만료일:</span>
            <span className="text-sm font-medium">{format(new Date(invitation.expiresAt), "yyyy년 MM월 dd일")}</span>
          </div> */}
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button
            data-testid={TID_DECLINE_INVITATION}
            variant="outline"
            onClick={() => onDecline(invitation.id!)}
          >
            거절하기
          </Button>
          <Button
            data-testid={TID_ACCEPT_INVITATION}
            onClick={() => onAccept(invitation.id!)}
          >
            수락하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
