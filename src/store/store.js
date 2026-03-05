import { create } from "zustand";

export const useLOIData = create((set) => ({
  selectedData: {},

  setSelectedData: (type, data) =>
    set((state) => ({
      selectedData: {
        ...state.selectedData,
        [type]: data,
      },
    })),

    setClean: (x) => set(()=>({selectedData:x}))
}));

export const usePreviewStore = create((set) => ({
  isPreview: { enable: false, msg: [], value: "",resolve: null },
  setIsPreview: (x) => set(() => ({ isPreview: x })),
}));



