import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  ChevronsUpDown,
  PlusCircle,
  Users,
  UserPlus,
  Settings,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useTeamsSuspense } from "@/hooks/database";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { InviteUserDialog } from "../InviteUserDialog";
import { useAppContext } from "../AppContext";
import { createTeam } from "@/lib/rpc/team";
import { TEST_ID_CREATE_TEAM_BUTTON, TID_SETTINGS } from "@/test/test-id-list";
export type Props = {};

function HeaderInner(props: Props) {
  const {} = props;

  const session = useSession();
  if (!session) {
    throw new Error("Access denied");
  }
  const { activeTeam, setActiveTeam } = useAppContext();
  const supabaseClient = useSupabaseClient();

  const [open, setOpen] = useState(false);
  const { data: teams = [], refetch } = useTeamsSuspense();
  const { user } = session;
  const [createTeamOpen, setCreateTeamOpen] = useState(false);

  const handleCreateTeam = async (team: {
    name: string;
    urlKey: string;
    description: string;
    image: string;
  }) => {
    // console.log("handleCreateTeam", team);
    const newTeam = await createTeam(team.name, team.urlKey);
    await refetch();
    setActiveTeam(newTeam);
  };

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "/";
  };

  useEffect(() => {
    if (!activeTeam && teams.length > 0) {
      setActiveTeam(teams[0]);
    }
  }, [teams, activeTeam, setActiveTeam]);
  return (
    <>
      <div className="flex items-center gap-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  {/* <AvatarImage src={selectedTeam.image} alt={selectedTeam.name} /> */}
                  <AvatarFallback>{activeTeam?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                {activeTeam?.name}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search team..." />
              <CommandList>
                <CommandEmpty>No team found.</CommandEmpty>
                <CommandGroup>
                  {teams.map((team) => (
                    <CommandItem
                      key={team.id}
                      value={team.name || ""}
                      onSelect={() => {
                        setActiveTeam(team);
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          {/* <AvatarImage src={team.image} alt={team.name} /> */}
                          <AvatarFallback>
                            {team.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {team.name}
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          activeTeam?.id === team.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {activeTeam && (
          <>
            <Button
              data-testid={TID_SETTINGS}
              variant="outline"
              size="icon"
              onClick={() =>
                activeTeam &&
                (window.location.href = `/teams/${activeTeam.url_key}/settings`)
              }
              title="Team settings"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </>
        )}
        <Button
          data-testid={TEST_ID_CREATE_TEAM_BUTTON}
          variant="outline"
          size="icon"
          onClick={() => setCreateTeamOpen(true)}
          title="Create team"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only">Create team</span>
        </Button>
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 rounded-full"
            >
              <Avatar className="h-8 w-8">
                {/* <AvatarImage src={user.image} alt={user.name} /> */}
                <AvatarFallback>{user.email?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!activeTeam}
              onClick={() => {
                activeTeam &&
                  (window.location.href = `/teams/${activeTeam.url_key}`);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Team page</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!activeTeam}
              onClick={() => {
                activeTeam &&
                  (window.location.href = `/teams/${activeTeam.url_key}/settings`);
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Team settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CreateTeamDialog
        open={createTeamOpen}
        onOpenChange={setCreateTeamOpen}
        onCreateTeam={handleCreateTeam}
      />
    </>
  );
}

export default React.memo(HeaderInner);
