import { GenerateRequestBody } from "@/lib/@types/generate.request";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type State = {
  targetUrl: string;
  paginationUrlTemplate?: string;
  pages: number;
  container: string;
  selectors: GenerateRequestBody["selectors"];
};

type Actions = {
  setTargetUrl: (arg: string) => void;
  setContainerSelector: (arg: string) => void;
  setPaginationUrlTemplate: (arg: string) => void;
  setPages: (arg: number) => void;
  addSelector: (arg: State["selectors"][number]) => void;
  updateSelector: (arg: State["selectors"][number]) => void;
  removeSelector: (arg: State["selectors"][number]) => void;
};

const useSetup = create<State & Actions>()(
  persist(
    (set, get) => ({
      targetUrl: "",
      pages: 1,
      container: "",
      selectors: [
        {
          id: 0,
          columnName: "Product Name",
          selector: ".product-title h1",
          dataType: "text",
          selectorType: "content",
        },
        {
          id: 1,
          columnName: "Price",
          selector: ".price-box .price",
          dataType: "text",
          selectorType: "content",
        },
        {
          id: 2,
          columnName: "Description",
          selector: ".product-description p",
          dataType: "text",
          selectorType: "content",
        },
      ],
      setTargetUrl: (url: string) => set({ targetUrl: url }),
      setPaginationUrlTemplate: (url: string) =>
        set({ paginationUrlTemplate: url }),
      setPages: (pages: number) => set({ pages }),
      setContainerSelector: (container: string) =>
        set({ container: container }),

      addSelector: (selector: State["selectors"][number]) =>
        set({ selectors: [...get().selectors, selector] }),

      updateSelector: (selector: State["selectors"][number]) =>
        set({
          selectors: get().selectors.map((s) =>
            s.id === selector.id ? selector : s
          ),
        }),

      removeSelector: (selector: State["selectors"][number]) =>
        set({ selectors: get().selectors.filter((x) => x.id !== selector.id) }),
    }),
    {
      name: "setup",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useSetup };
