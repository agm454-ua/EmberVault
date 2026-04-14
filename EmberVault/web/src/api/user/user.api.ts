import { client } from "@api/client";

export const userApi = {
    count: () => client.get('/user/api/users/count').then(res => res.data.count)
}