create policy "Authed can upload 22ox_0"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'app'::text) AND (auth.role() = 'authenticated'::text)));



