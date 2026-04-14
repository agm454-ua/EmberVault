import { userApi } from "@/api/user/user.api"
import { avgStaleTime } from "@/core/config/constants"
import { useQuery } from "@tanstack/react-query"

export const useCountUsers = () => {
    return useQuery({
        queryKey: ['countUsers'],
        queryFn: userApi.count,
        staleTime: avgStaleTime
    })
}