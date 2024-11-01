## Trigger

```
set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into "public"."User" (id, email)
  values (new.id, new.email);
  return new;
end;
$function$
;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


```

## FP Connect trigger after success callback

```

create function public.handle_fp_connect_success()
returns trigger
language plpgsql
security definer set search_path = 'extensions'
as $$
declare
  new_key text;
  new_id text;
  expire_at timestamp;

begin
  -- Only run if fp_status is 'success'

  if NEW.fp_status = 'success' then
    -- Generate a unique key and secret
    new_id  := gen_random_uuid()::text;
    new_key := gen_random_uuid()::text;
    expire_at := now() + interval '1 minute';

    -- Insert the new key and secret into InternalKey table
    INSERT INTO "public"."InternalKey" (id, key, "expireAt")
    VALUES (new_id, new_key, expire_at);

    -- Call the exchange API route with a POST request
    perform http_post('http://host.docker.internal:8082/api/fp-exchange-token', '{"id": "' || new_id || '", "key": "' || new_key || '", "fp_id": "' || NEW.id || '"}', 'application/json');
  end if;
  return new;
end;
$$;

CREATE TRIGGER on_fp_connect_success AFTER UPDATE ON "public"."FPConnectSession" FOR EACH ROW EXECUTE FUNCTION handle_fp_connect_success();

```

<!--  -->
