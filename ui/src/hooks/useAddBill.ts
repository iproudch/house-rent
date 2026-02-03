import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBill } from "../api/bills";

export const useAddBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBill,

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["bills", data.house_id],
      });
    },
  });
};
