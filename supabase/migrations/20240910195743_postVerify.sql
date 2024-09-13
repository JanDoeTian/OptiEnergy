CREATE TRIGGER on_email_verified AFTER UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_user_email_verified();


