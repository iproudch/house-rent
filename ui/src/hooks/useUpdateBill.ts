import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBill, type UpdateBillPayload } from "../api/bills";

export const useUpdateBill = (houseId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBillPayload }) =>
      updateBill(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills", houseId] });
    },
  });
};
