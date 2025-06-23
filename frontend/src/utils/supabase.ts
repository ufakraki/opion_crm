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

export const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: metadata || {}
        }
    });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
};

export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.log('Profile query error details:', error);
    }
    if (data) {
        console.log('Profile found:', data);
    } else {
        console.log('No profile found for user:', userId);
    }
    
    return { data, error };
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

// User management functions - Simplified version
export const createCompanyAdmin = async (userData: {
    email: string;
    password: string;
    full_name: string;
    company_id: string;
}) => {
    try {
        console.log('Creating company admin with data:', userData);
        
        // Use normal signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    full_name: userData.full_name,
                    role: 'company_admin'
                }
            }
        });
        
        if (authError) {
            console.error('Auth signup error:', authError);
            return { data: null, error: authError };
        }
        
        if (!authData.user) {
            console.error('No user returned from signup');
            return { data: null, error: new Error('User creation failed - no user returned') };
        }
        
        console.log('User created successfully:', authData.user.id);
        
        // Check if we need to update the profile (after trigger creates it)
        // Wait for trigger to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to get the profile first
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        
        console.log('Existing profile after trigger:', existingProfile);
        
        if (existingProfile) {
            // Update the profile with company info
            const { data: updatedProfile, error: updateError } = await supabase
                .from('profiles')
                .update({
                    role: 'company_admin',
                    company_id: userData.company_id,
                    full_name: userData.full_name
                })
                .eq('id', authData.user.id)
                .select()
                .single();
            
            if (updateError) {
                console.error('Profile update error:', updateError);
                return { data: null, error: updateError };
            }
            
            console.log('Profile updated successfully:', updatedProfile);
            return { data: updatedProfile, error: null };
        } else {
            // If trigger didn't work, create profile manually
            console.log('Creating profile manually...');
            const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email: userData.email,
                    username: userData.email.split('@')[0],
                    full_name: userData.full_name,
                    role: 'company_admin',
                    company_id: userData.company_id
                })
                .select()
                .single();
            
            if (insertError) {
                console.error('Profile creation error:', insertError);
                return { data: null, error: insertError };
            }
            
            return { data: newProfile, error: null };
        }
        
    } catch (error) {
        console.error('Unexpected error in createCompanyAdmin:', error);
        return { data: null, error };
    }
};

export const getCompanyUsers = async (companyId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
    return { data, error };
};

// Create Company User (by Company Admin)
export const createCompanyUser = async (userData: {
    email: string;
    password: string;
    full_name: string;
    company_id: string;
}) => {
    try {
        console.log('Creating company user with data:', userData);
        
        // Use normal signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    full_name: userData.full_name,
                    role: 'company_user'
                }
            }
        });
        
        if (authError) {
            console.error('Auth signup error:', authError);
            return { data: null, error: authError };
        }
        
        if (!authData.user) {
            console.error('No user returned from signup');
            return { data: null, error: new Error('User creation failed - no user returned') };
        }
        
        console.log('Company user created successfully:', authData.user.id);
        
        // Wait for trigger to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to get the profile first
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
        
        console.log('Existing profile after trigger:', existingProfile);
        
        if (existingProfile) {
            // Update the profile with company info
            const { data: updatedProfile, error: updateError } = await supabase
                .from('profiles')
                .update({
                    role: 'company_user',
                    company_id: userData.company_id,
                    full_name: userData.full_name
                })
                .eq('id', authData.user.id)
                .select()
                .single();
            
            if (updateError) {
                console.error('Profile update error:', updateError);
                return { data: null, error: updateError };
            }
            
            console.log('Profile updated successfully:', updatedProfile);
            return { data: updatedProfile, error: null };
        } else {
            // If trigger didn't work, create profile manually
            console.log('Creating profile manually...');
            const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email: userData.email,
                    username: userData.email.split('@')[0],
                    full_name: userData.full_name,
                    role: 'company_user',
                    company_id: userData.company_id
                })
                .select()
                .single();
            
            if (insertError) {
                console.error('Profile creation error:', insertError);
                return { data: null, error: insertError };
            }
            
            return { data: newProfile, error: null };
        }
        
    } catch (error) {
        console.error('Unexpected error in createCompanyUser:', error);
        return { data: null, error };
    }
};

// Delete User (for Company Admin and Super Admin)
export const deleteUser = async (userId: string) => {
    try {
        // First get user's email to check for conflicts
        const { data: userData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single();

        if (!userData) {
            return { error: { message: 'Kullanıcı bulunamadı' } };
        }

        // Delete from profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error('Profile deletion error:', profileError);
            return { error: profileError };
        }

        // Try to delete from auth.users using admin API
        // This requires service role key, but let's try with anon key
        try {
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);
            if (authError) {
                console.warn('Could not delete from auth.users (expected with anon key):', authError);
                // This is expected with anon key, continue anyway
            } else {
                console.log('Successfully deleted from auth.users');
            }
        } catch (authDeleteError) {
            console.warn('Auth delete failed (expected):', authDeleteError);
            // This is expected, continue
        }

        console.log('User profile deleted successfully');
        return { error: null };
    } catch (error) {
        console.error('Unexpected error in deleteUser:', error);
        return { error };
    }
};

// Check if email exists in auth.users (for conflict detection)
export const checkEmailConflict = async (email: string) => {
    try {
        // Try to sign up with the email to check if it exists
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: 'temp-password-check-123456' // Temporary password
        });

        if (error?.message === 'User already registered') {
            return { exists: true, error: null };
        }

        // If signup succeeded, we need to clean up
        if (data?.user && !error) {
            // Try to delete the test user
            try {
                await supabase.auth.admin.deleteUser(data.user.id);
            } catch (deleteError) {
                console.warn('Could not delete test user:', deleteError);
            }
            return { exists: false, error: null };
        }

        return { exists: false, error: error };
    } catch (error) {
        console.error('Error checking email conflict:', error);
        return { exists: false, error: error };
    }
};

// ========================
// CUSTOMER COMPANIES (FIRMA KARTLARI) TYPES & FUNCTIONS
// ========================

// TypeScript interface for Customer Company
export interface CustomerCompany {
    id?: string;
    name: string;
    sector?: string;
    phone?: string;
    email?: string;
    address?: string;
    contact_person?: string;
    website?: string;
    notes?: string;
    sales_made?: boolean;
    not_attending_fair?: boolean;
    attending_fair?: boolean;
    assigned_user_id?: string;
    created_by?: string;
    company_id: string;
    last_contact_date?: string;
    next_reminder_date?: string;
    created_at?: string;
    updated_at?: string;
}

// Create customer company
export const createCustomerCompany = async (customerData: CustomerCompany) => {
    try {
        console.log('Creating customer company with data:', customerData);
          // Data'yı temizle ve gerekli alanları hazırla
        const cleanData = {
            name: customerData.name,
            sector: customerData.sector || null,
            phone: customerData.phone || null,
            email: customerData.email || null,
            address: customerData.address || null,
            contact_person: customerData.contact_person || null,
            website: customerData.website || null,
            notes: customerData.notes || null,
            sales_made: customerData.sales_made || false,
            not_attending_fair: customerData.not_attending_fair || false,
            attending_fair: customerData.attending_fair !== undefined ? customerData.attending_fair : null,
            company_id: customerData.company_id,
            assigned_user_id: customerData.assigned_user_id || null,
            created_by: customerData.created_by || null,
            last_contact_date: customerData.last_contact_date || null,
            next_reminder_date: customerData.next_reminder_date || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('Cleaned data for database:', cleanData);
        
        const { data, error } = await supabase
            .from('customer_companies')
            .insert([cleanData])
            .select();
            
        if (error) {
            console.error('Supabase error creating customer company:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return { data: null, error };
        }
        
        console.log('Customer company created successfully:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error creating customer company:', error);
        return { data: null, error };
    }
};

// Get customer companies for a specific company
export const getCustomerCompanies = async (companyId: string) => {
    try {
        console.log('Fetching customer companies for company:', companyId);
        
        const { data, error } = await supabase
            .from('customer_companies')
            .select(`
                *,
                assigned_user:assigned_user_id(id, full_name, email),
                creator:created_by(id, full_name, email)
            `)
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error fetching customer companies:', error);
            return { data: [], error };
        }
        
        console.log(`Found ${data?.length || 0} customer companies`);
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Unexpected error fetching customer companies:', error);
        return { data: [], error };
    }
};

// Update customer company
export const updateCustomerCompany = async (id: string, updateData: Partial<CustomerCompany>) => {
    try {
        console.log('Updating customer company:', id, updateData);
        
        const { data, error } = await supabase
            .from('customer_companies')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();
            
        if (error) {
            console.error('Error updating customer company:', error);
            return { data: null, error };
        }
        
        console.log('Customer company updated successfully:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error updating customer company:', error);
        return { data: null, error };
    }
};

// Delete customer company
export const deleteCustomerCompany = async (id: string) => {
    try {
        console.log('Deleting customer company:', id);
        
        const { error } = await supabase
            .from('customer_companies')
            .delete()
            .eq('id', id);
            
        if (error) {
            console.error('Error deleting customer company:', error);
            return { error };
        }
        
        console.log('Customer company deleted successfully');
        return { error: null };
    } catch (error) {
        console.error('Unexpected error deleting customer company:', error);
        return { error };
    }
};

// Get single customer company by ID
export const getCustomerCompanyById = async (id: string) => {
    try {
        console.log('Fetching customer company by ID:', id);
        
        const { data, error } = await supabase
            .from('customer_companies')
            .select(`
                *,
                assigned_user:assigned_user_id(id, full_name, email),
                creator:created_by(id, full_name, email)
            `)
            .eq('id', id)
            .single();
            
        if (error) {
            console.error('Error fetching customer company by ID:', error);
            return { data: null, error };
        }
        
        console.log('Customer company found:', data);
        return { data, error: null };
    } catch (error) {
        console.error('Unexpected error fetching customer company by ID:', error);
        return { data: null, error };
    }
};

// Search customer companies
export const searchCustomerCompanies = async (companyId: string, searchTerm: string) => {
    try {
        console.log('Searching customer companies:', { companyId, searchTerm });
        
        const { data, error } = await supabase
            .from('customer_companies')
            .select(`
                *,
                assigned_user:assigned_user_id(id, full_name, email),
                creator:created_by(id, full_name, email)
            `)
            .eq('company_id', companyId)
            .or(`name.ilike.%${searchTerm}%,sector.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error searching customer companies:', error);
            return { data: [], error };
        }
        
        console.log(`Found ${data?.length || 0} customer companies matching search`);
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Unexpected error searching customer companies:', error);
        return { data: [], error };
    }
};

// Get customer companies stats
export const getCustomerCompaniesStats = async (companyId: string) => {
    try {
        console.log('Fetching customer companies stats for company:', companyId);
        
        const { data, error } = await supabase
            .from('customer_companies')
            .select('attending_fair')
            .eq('company_id', companyId);
            
        if (error) {
            console.error('Error fetching stats:', error);
            return { 
                total: 0, 
                attendingFair: 0, 
                notAttendingFair: 0, 
                underDiscussion: 0,
                error 
            };
        }
        
        const stats = {
            total: data?.length || 0,
            attendingFair: data?.filter(item => item.attending_fair === true).length || 0,
            notAttendingFair: data?.filter(item => item.attending_fair === false).length || 0,
            underDiscussion: data?.filter(item => item.attending_fair === null || item.attending_fair === undefined).length || 0,
            error: null
        };
        
        console.log('Customer companies stats:', stats);
        return stats;
    } catch (error) {
        console.error('Unexpected error fetching stats:', error);
        return { 
            total: 0, 
            attendingFair: 0, 
            notAttendingFair: 0, 
            underDiscussion: 0,
            error 
        };
    }
};