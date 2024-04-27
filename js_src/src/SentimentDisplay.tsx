import React from 'react';
import useDataStore from './datastore';

const SentimentDisplay = (props: { objId: string }) => {
    const sentimentMode = useDataStore((state) => state.sentimentMode);
    const sentimentData = useDataStore((state) => state.sentimentData);

    const sentimentResult = sentimentData[props.objId];
    if (sentimentResult === undefined || sentimentResult[sentimentMode] === undefined) {
        return <span className="badge bg-secondary me-3">
            <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </span>
    } else {
        let sentimentScore = sentimentResult[sentimentMode].score;
        let sentimentLabel = sentimentResult[sentimentMode].label;
        return <span className={`badge bg-${sentimentLabel === "positive" ? "success" : sentimentLabel === "negative" ? "danger" : "warning"}`}>
            {Math.round((sentimentScore + Number.EPSILON) * 100) / 100}
        </span>
    }
}

export default SentimentDisplay;
