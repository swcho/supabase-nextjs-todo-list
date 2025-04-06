import { Database } from "./schema";
import { Nullable } from "./type-utils";

/**
 * Team interface with url_key for routing
 */
export interface Team {
  id: number;
  name: string | null;
  created_at: string | null;
  url_key: string | null;
  members?:
    | {
        id: string | null;
        aud: string | null;
        email: string | null;
        joined_at: string | null;
      }[]
    | null;
}

type TeamInvitationRpc =
  Database["public"]["Functions"]["get_team_invitations_v2"]["Returns"][0];

export type TeamInvitation = TeamInvitationRpc;

export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

export function getInvitationStatus(
  teamInvitation: Nullable<Pick<TeamInvitationRpc, 'accepted_at' | 'declined_at' | 'expires_at'>>
): InvitationStatus {
  if (teamInvitation.accepted_at) {
    return "accepted";
  } else if (teamInvitation.declined_at) {
    return "declined";
  } else if (new Date(teamInvitation.expires_at!).getTime() < Date.now()) {
    return "expired";
  }
  return "pending";
}

type UserInvitationRpc =
  Database["public"]["Functions"]["get_user_invitations_v2"]["Returns"][0];

export type UserInvitation = UserInvitationRpc;
