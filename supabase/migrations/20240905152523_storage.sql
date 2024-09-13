drop policy "Authed can upload 22ox_0" on "storage"."objects";

create policy "Give users access to own folder 22ox_0"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'app'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to own folder 22ox_1"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'app'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to own folder 22ox_2"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'app'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to own folder 22ox_3"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'app'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



