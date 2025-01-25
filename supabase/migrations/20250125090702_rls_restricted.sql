drop policy "Enable read access for all users" on "public"."team_members";

drop policy "Only team owner can create members." on "public"."team_members";

drop policy "Only team owner can delete members." on "public"."team_members";

drop policy "Only team owner can update members." on "public"."team_members";

drop policy "Enable insert for users based on user_id" on "public"."teams";

drop policy "Only owner can delete teams." on "public"."teams";

drop policy "Team members can view their teams." on "public"."teams";

drop policy "Can only delete completed todos" on "public"."todos";

drop policy "Individuals can create todos." on "public"."todos";

drop policy "Individuals can update their own todos." on "public"."todos";

drop policy "Individuals can view their own todos. " on "public"."todos";

drop policy "Team members can add todos." on "public"."todos";

drop policy "Team members can view team todos." on "public"."todos";

create policy "team_members service_role restricted."
on "public"."team_members"
as restrictive
for all
to service_role
using (true)
with check (true);


create policy "teams service_role"
on "public"."teams"
as restrictive
for all
to service_role
using (true)
with check (true);


create policy "todos service_role"
on "public"."todos"
as restrictive
for all
to service_role
using (true)
with check (true);



