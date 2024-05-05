import React from 'react';
import useDataStore from './datastore';

const ModeSelector = () => {
    const mode = useDataStore((state) => state.sentimentMode);
    const setMode = useDataStore((state) => state.setSentimentMode);

    return (
        <>
            <h1>Sentiment Analysis Algorithm</h1>
            <p>Note: this can be changed after all results are loaded</p>
            <select className="form-select" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="flair">Flair</option>
                <option value="hf">HuggingFace model</option>
                <option value="nltk">NLTK</option>
            </select>
        </>
    )
}

export default ModeSelector;
