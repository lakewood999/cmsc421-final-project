import { create } from 'zustand';

const useDataStore = create((set, get) => ({
    redditData: null,
    setRedditData: (data) => set({ redditData: data }),
    sentimentData: {},
    // append to the current sentiment data
    setSentimentData: (data) => {
        set({ sentimentData: { ...get().sentimentData, ...data } });
    },
}));

export default useDataStore;
