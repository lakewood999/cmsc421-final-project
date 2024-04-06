import {create} from 'zustand';

const useDataStore = create((set, get) => ({
    redditData: null,
    setRedditData: (data) => set({redditData: data}),
}));

export default useDataStore;