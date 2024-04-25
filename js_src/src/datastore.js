import {create} from 'zustand';

const useDataStore = create((set, get) => ({
    redditData: null,
    setRedditData: (data) => set({redditData: data}),
    sentData: [],
    setSentData: (data) => set({sentData: data})
}));

export default useDataStore;