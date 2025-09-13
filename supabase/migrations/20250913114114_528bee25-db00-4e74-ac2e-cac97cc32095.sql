-- Fix data ownership for kanouk@gmail.com user
-- First, let's find the correct user_id for kanouk@gmail.com
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the user ID for kanouk@gmail.com
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'kanouk@gmail.com';
    
    -- If user exists, update all services and episodes to belong to this user
    IF target_user_id IS NOT NULL THEN
        -- Update all services to belong to kanouk@gmail.com
        UPDATE public.services 
        SET user_id = target_user_id;
        
        -- Update all episodes to belong to kanouk@gmail.com
        UPDATE public.episodes 
        SET user_id = target_user_id;
        
        RAISE NOTICE 'Updated data ownership for user: %', target_user_id;
    ELSE
        RAISE NOTICE 'User kanouk@gmail.com not found in auth.users table';
    END IF;
END $$;