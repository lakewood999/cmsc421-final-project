import React from 'react';
import useDataStore from './datastore';

const ModeSelector = () => {
    const mode = useDataStore((state) => state.sentimentMode);
    const setMode = useDataStore((state) => state.setSentimentMode);

    return (
        <div className="card mb-4 rounded-3 shadow-sm">
            <div className="card-header py-3">
                <h4 className="my-0 fw-normal">Model</h4>
            </div>
            <div className="card-body">
                <p>This dropdown allows you to choose the model whose results will be shown in the sentiment summary and in the tags for the posts and comments below. All available models are automatically loaded in the background so feel free to change the dropdown at any time, even after all results are loaded.</p>
                <select className="form-select" value={mode} onChange={(e) => setMode(e.target.value)}>
                    <option value="flair">Flair</option>
                    <option value="hf">HuggingFace model</option>
                    <option value="nltk">NLTK</option>
                </select>
            </div>
        </div>
    )
}

export default ModeSelector;
