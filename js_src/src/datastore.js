import { create } from 'zustand';

const useDataStore = create((set, get) => ({
    redditData: null,
    setRedditData: (data) => set({ redditData: data }),
    sentimentData: {},
    dangerouslySetSentimentData: (data) => set({ sentimentData: data }), // only used for resetting
    // append to the current sentiment data
    setSentimentData: (data) => {
        // merge the new data with the existing data
        let current = JSON.parse(JSON.stringify(get().sentimentData));
        // if the new data doesn't exist, then append. else find and merge
        for (let key in data) {
            if (current[key]) {
                current[key] = { ...current[key], ...data[key] };
            } else {
                current[key] = data[key];
            }
        }
        set({ sentimentData: current });
    },
    // allow showing multiple models
    sentimentMode: "flair",
    setSentimentMode: (mode) => set({ sentimentMode: mode }),
    numModes: 3, // number of sentiment modes, used for progress, etc.
}));

export default useDataStore;
