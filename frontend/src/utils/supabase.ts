import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth functions with proper TypeScript types
export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
    });
    return { data, error };
};

export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
    });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

// Company management functions
export const fetchCompanies = async () => {
    const { data, error } = await supabase
        .from('companies')
        .select('*');
    return { data, error };
};

export const createCompany = async (companyData: any) => {
    const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select();
    return { data, error };
};

export const updateCompany = async (id: string, companyData: any) => {
    const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', id)
        .select();
    return { data, error };
};

export const deleteCompany = async (id: string) => {
    const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
    return { error };
};