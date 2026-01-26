import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

interface UseSyncedTitleParams {
  title: string;
  setEditedTitle: Dispatch<SetStateAction<string>>;
}

export const useSyncedTitle = ({ title, setEditedTitle }: UseSyncedTitleParams) => {
  useEffect(() => {
    setEditedTitle(title);
  }, [title, setEditedTitle]);
};
