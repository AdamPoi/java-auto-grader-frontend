import axios from "@/lib/axios";
import type { SearchRequestParams, SearchResponse } from "@/types/api.types";
import type { User } from "./schema";

export const UserApi = {
    getUsers: async (params: SearchRequestParams): Promise<SearchResponse<User>> => {
        const response = await axios.get("/users", {
            params
        });
        return response.data;
    },

    createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'confirmPassword'>): Promise<User> => {
        const response = await axios.post("/users", userData);
        return response.data;
    },

    updateUser: async (userId: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'permissions' | 'isActive'>>): Promise<User> => {
        const filteredUserData = Object.fromEntries(
            Object.entries(userData).filter(([_, value]) => value !== null && value !== '' && !(Array.isArray(value) && value.length === 0))
        );
        const response = await axios.patch(`/users/${userId}`, filteredUserData);
        return response.data;
    },

    deleteUser: async (userId: string): Promise<void> => {
        await axios.delete(`/users/${userId}`);
    },
};
