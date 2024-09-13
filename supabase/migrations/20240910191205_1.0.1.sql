create type "public"."ApplicationStatus" as enum ('new', 'applied');

revoke delete on table "public"."Test" from "anon";

revoke insert on table "public"."Test" from "anon";

revoke references on table "public"."Test" from "anon";

revoke select on table "public"."Test" from "anon";

revoke trigger on table "public"."Test" from "anon";

revoke truncate on table "public"."Test" from "anon";

revoke update on table "public"."Test" from "anon";

revoke delete on table "public"."Test" from "authenticated";

revoke insert on table "public"."Test" from "authenticated";

revoke references on table "public"."Test" from "authenticated";

revoke select on table "public"."Test" from "authenticated";

revoke trigger on table "public"."Test" from "authenticated";

revoke truncate on table "public"."Test" from "authenticated";

revoke update on table "public"."Test" from "authenticated";

revoke delete on table "public"."Test" from "service_role";

revoke insert on table "public"."Test" from "service_role";

revoke references on table "public"."Test" from "service_role";

revoke select on table "public"."Test" from "service_role";

revoke trigger on table "public"."Test" from "service_role";

revoke truncate on table "public"."Test" from "service_role";

revoke update on table "public"."Test" from "service_role";

alter table "public"."Test" drop constraint "Test_pkey";

drop index if exists "public"."Test_pkey";

drop table "public"."Test";

create table "public"."UserApplication" (
    "id" text not null,
    "userId" text not null,
    "jobTitle" text not null,
    "jobCompany" text not null,
    "jobLocation" text not null,
    "jobUrl" text not null,
    "applicationDate" timestamp(3) without time zone not null,
    "applicationStatus" "ApplicationStatus" not null default 'new'::"ApplicationStatus"
);


alter table "public"."UserApplication" enable row level security;

create table "public"."UserStat" (
    "id" text not null,
    "userId" text not null,
    "applicationSubmittedCount" integer not null
);


alter table "public"."UserStat" enable row level security;

create table "public"."UserUpload" (
    "id" text not null,
    "userId" text not null,
    "fileName" text not null,
    "fileId" text not null,
    "fileUrl" text not null,
    "updatedAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP
);


alter table "public"."UserUpload" enable row level security;

alter table "public"."User" drop column "name";

alter table "public"."User" drop column "race";

alter table "public"."User" add column "email" text not null;

alter table "public"."User" add column "onboarded" boolean not null default false;

alter table "public"."User" enable row level security;

CREATE UNIQUE INDEX "UserApplication_pkey" ON public."UserApplication" USING btree (id);

CREATE UNIQUE INDEX "UserStat_pkey" ON public."UserStat" USING btree (id);

CREATE UNIQUE INDEX "UserUpload_pkey" ON public."UserUpload" USING btree (id);

alter table "public"."UserApplication" add constraint "UserApplication_pkey" PRIMARY KEY using index "UserApplication_pkey";

alter table "public"."UserStat" add constraint "UserStat_pkey" PRIMARY KEY using index "UserStat_pkey";

alter table "public"."UserUpload" add constraint "UserUpload_pkey" PRIMARY KEY using index "UserUpload_pkey";

alter table "public"."UserApplication" add constraint "UserApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."UserApplication" validate constraint "UserApplication_userId_fkey";

alter table "public"."UserStat" add constraint "UserStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."UserStat" validate constraint "UserStat_userId_fkey";

alter table "public"."UserUpload" add constraint "UserUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."UserUpload" validate constraint "UserUpload_userId_fkey";

grant delete on table "public"."UserApplication" to "anon";

grant insert on table "public"."UserApplication" to "anon";

grant references on table "public"."UserApplication" to "anon";

grant select on table "public"."UserApplication" to "anon";

grant trigger on table "public"."UserApplication" to "anon";

grant truncate on table "public"."UserApplication" to "anon";

grant update on table "public"."UserApplication" to "anon";

grant delete on table "public"."UserApplication" to "authenticated";

grant insert on table "public"."UserApplication" to "authenticated";

grant references on table "public"."UserApplication" to "authenticated";

grant select on table "public"."UserApplication" to "authenticated";

grant trigger on table "public"."UserApplication" to "authenticated";

grant truncate on table "public"."UserApplication" to "authenticated";

grant update on table "public"."UserApplication" to "authenticated";

grant delete on table "public"."UserApplication" to "service_role";

grant insert on table "public"."UserApplication" to "service_role";

grant references on table "public"."UserApplication" to "service_role";

grant select on table "public"."UserApplication" to "service_role";

grant trigger on table "public"."UserApplication" to "service_role";

grant truncate on table "public"."UserApplication" to "service_role";

grant update on table "public"."UserApplication" to "service_role";

grant delete on table "public"."UserStat" to "anon";

grant insert on table "public"."UserStat" to "anon";

grant references on table "public"."UserStat" to "anon";

grant select on table "public"."UserStat" to "anon";

grant trigger on table "public"."UserStat" to "anon";

grant truncate on table "public"."UserStat" to "anon";

grant update on table "public"."UserStat" to "anon";

grant delete on table "public"."UserStat" to "authenticated";

grant insert on table "public"."UserStat" to "authenticated";

grant references on table "public"."UserStat" to "authenticated";

grant select on table "public"."UserStat" to "authenticated";

grant trigger on table "public"."UserStat" to "authenticated";

grant truncate on table "public"."UserStat" to "authenticated";

grant update on table "public"."UserStat" to "authenticated";

grant delete on table "public"."UserStat" to "service_role";

grant insert on table "public"."UserStat" to "service_role";

grant references on table "public"."UserStat" to "service_role";

grant select on table "public"."UserStat" to "service_role";

grant trigger on table "public"."UserStat" to "service_role";

grant truncate on table "public"."UserStat" to "service_role";

grant update on table "public"."UserStat" to "service_role";

grant delete on table "public"."UserUpload" to "anon";

grant insert on table "public"."UserUpload" to "anon";

grant references on table "public"."UserUpload" to "anon";

grant select on table "public"."UserUpload" to "anon";

grant trigger on table "public"."UserUpload" to "anon";

grant truncate on table "public"."UserUpload" to "anon";

grant update on table "public"."UserUpload" to "anon";

grant delete on table "public"."UserUpload" to "authenticated";

grant insert on table "public"."UserUpload" to "authenticated";

grant references on table "public"."UserUpload" to "authenticated";

grant select on table "public"."UserUpload" to "authenticated";

grant trigger on table "public"."UserUpload" to "authenticated";

grant truncate on table "public"."UserUpload" to "authenticated";

grant update on table "public"."UserUpload" to "authenticated";

grant delete on table "public"."UserUpload" to "service_role";

grant insert on table "public"."UserUpload" to "service_role";

grant references on table "public"."UserUpload" to "service_role";

grant select on table "public"."UserUpload" to "service_role";

grant trigger on table "public"."UserUpload" to "service_role";

grant truncate on table "public"."UserUpload" to "service_role";

grant update on table "public"."UserUpload" to "service_role";


