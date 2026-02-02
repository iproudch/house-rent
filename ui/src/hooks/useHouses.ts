import { useQuery } from "@tanstack/react-query";
import { fetchHouses } from "../../../api/src/api/houses";

export const useHouses = () => {
  return useQuery({
    queryKey: ["houses"],
    queryFn: fetchHouses,
  });
};
