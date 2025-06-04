import axios from "@/lib/axios";
import type { SearchRequestParams } from "@/types/api.types";
import type { User } from "./schema";

export const UserApi = {
    getUsers: async (params: SearchRequestParams): Promise<User[]> => {
        return (await axios.put("/api/users", params));
    },

};