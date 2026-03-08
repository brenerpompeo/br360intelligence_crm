import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://drrmwajjxgvkugpslpsl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRycm13YWpqeGd2a3VncHNscHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTUwMDYsImV4cCI6MjA4NzUzMTAwNn0.odtUJB-Itso49PHTajDpL-1qil7WAiIc88tIgNceqR4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser() {
    console.log('Attempting to create user with standard gmail domain...');
    const { data, error } = await supabase.auth.signUp({
        email: 'brener.demo.br360@gmail.com',  // Real domain to pass validation
        password: 'senha_segura_123',
        options: {
            data: {
                full_name: 'Usuário Demo'
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created successfully:', data.user?.email);
        console.log('Needs confirm:', data.user?.identities?.length === 0 ? 'Maybe' : 'Identities created');
    }
}

createUser();
