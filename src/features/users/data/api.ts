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

};
