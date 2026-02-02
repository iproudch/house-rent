// hooks/useAddBill.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBill } from "../../../api/src/api/bills";

export const useAddBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBill,

    onSuccess: (data) => {
      // optional: refetch bills list
      queryClient.invalidateQueries({
        queryKey: ["bills", data.house_id],
      });
    },
  });
};
