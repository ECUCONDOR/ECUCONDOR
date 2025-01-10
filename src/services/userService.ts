import { supabase } from '../lib/supabaseClient';
import { UserRecord, SelectResponse, SingleResponse } from '../types/supabase.types';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export class UserService {
  static async getUsers(): Promise<SelectResponse<UserRecord>> {
    const users = await supabase
      .from('users')
      .select('*');

    return users;
  }

  static async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<SingleResponse<UserRecord>> {
    const userResponse = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    return userResponse;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<SingleResponse<UserRecord>> {
    const userResponse = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return userResponse;
  }

  static async deleteUser(id: string): Promise<SingleResponse<UserRecord>> {
    const userResponse = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single();

    return userResponse;
  }
}
