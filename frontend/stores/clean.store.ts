import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type State = {
  targetColumn: string;
  nhs:
    | "rows"
    | "columns"
    | "mean"
    | "median"
    | "mode"
    | "zero"
    | "custom"
    | "none";
  normalization: string;
  customValue?: string;
  trimWhiteSpaces: boolean;
  removeDupRows: boolean;
  enableNormalization: boolean;
};

type Actions = {
  setTargetColumn: (value: string) => void;
  setNhs: (value: State["nhs"]) => void;
  setNormalization: (value: string) => void;
  setCustomValue: (value?: string) => void;
  setTrimingOption: (value: boolean) => void;
  setDupRemovalOption: (value: boolean) => void;
  setNormalizationOption: (value: boolean) => void;
};

const useCleanStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      targetColumn: "all",
      nhs: "none",
      normalization: "standard",
      trimWhiteSpaces: false,
      removeDupRows: false,
      enableNormalization: false,
      setTargetColumn: (value: string) => set({ targetColumn: value }),
      setNhs: (value: State["nhs"]) => set({ nhs: value }),
      setNormalization: (value: string) => set({ normalization: value }),
      setTrimingOption: (value: boolean) => set({ trimWhiteSpaces: value }),
      setDupRemovalOption: (value) => set({ removeDupRows: value }),
      setNormalizationOption: (value) => set({ enableNormalization: value }),
      setCustomValue: (value?: string) => set({ customValue: value }),
    }),
    {
      name: "cleanOptions",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useCleanStore };
