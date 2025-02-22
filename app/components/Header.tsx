"use client";

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
import { Check, ChevronsUpDown, PlusCircle, Users } from "lucide-react";
import { useMemo, useState } from "react";
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
import { useTeams } from "@/hooks/database";
import { createTeam, Team } from "@/lib/api";
import { useSession } from "@supabase/auth-helpers-react";
import { CreateTeamDialog } from "./CreateTeamDialog";

function Header() {
  const session = useSession();
  if (!session) {
    throw new Error("Access denied");
  }

  const [open, setOpen] = useState(false);
  const { data: teams = [], refetch } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null | undefined>(teams[0]?.id ?? undefined);
  const selectedTeam = useMemo(() => teams.find((team) => team.id === selectedTeamId), [teams, selectedTeamId]);
  const { user } = session;
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const handleCreateTeam = async (team: {
    name: string;
    description: string;
    image: string;
  }) => {
    console.log("handleCreateTeam", team);
    const newTeam = await createTeam(team.name)
    await refetch();
    setSelectedTeamId(newTeam);
    // setTeams([...teams, newTeam])
    // setSelectedTeam(newTeam)
  };
  

  // console.log("Header", { teams });
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-4">
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
                    <AvatarFallback>
                      {selectedTeam?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedTeam?.name}
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
                          setSelectedTeamId(team.id);
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
                            selectedTeam?.id === team.id
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCreateTeamOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">Create team</span>
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {/* <AvatarImage src={user.image} alt={user.name} /> */}
                  <AvatarFallback>{user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  {/* <p className="text-sm font-medium leading-none">
                    {user.email}
                  </p> */}
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                <span>Team settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CreateTeamDialog
        open={createTeamOpen}
        onOpenChange={setCreateTeamOpen}
        onCreateTeam={handleCreateTeam}
      />
    </header>
  );
}

export default Header;
