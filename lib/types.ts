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

export type TeamInvitation = {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
};
