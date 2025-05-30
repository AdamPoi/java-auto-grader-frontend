import type { SearchParams } from "@/types/backendTypes";
import type { User } from "./schema";
import axios from "@/utils/axios.config";

export const UserApi = {
    getUsers: async (params: SearchParams): Promise<User[]> => {
        return (await axios.put("/api/users", params));
    },

};