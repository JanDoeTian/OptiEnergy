set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_user_email_verified()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'extensions'
AS $function$
begin

    IF NEW.id IS NULL OR NEW.email IS NULL THEN
        RAISE EXCEPTION 'User ID or email is missing';
    END IF;

    if new.email_confirmed_at IS NOT NULL AND old.email_confirmed_at IS null then
        INSERT INTO users (id, email)
        VALUES (NEW.id, NEW.email)
        ON CONFLICT (id) DO NOTHING;  -- Avoid inserting duplicate users
    end if;
    return new;
end;
$function$
;


