import React from 'react';
import useDataStore from './datastore';

const SentimentDisplay = (props: { objId: string }) => {
    const sentimentMode = useDataStore((state) => state.sentimentMode);
    const sentimentData = useDataStore((state) => state.sentimentData);

    const sentimentResult = sentimentData[props.objId];
    console.log(sentimentResult)
    console.log(props.objId)
    console.log(sentimentData)
    if (sentimentResult === undefined) {
        return <span className="badge bg-secondary me-3">
            <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </span>
    } else {
        let sentimentScore = sentimentResult[sentimentMode].score;
        return <span className={`badge bg-${sentimentScore > 0 ? "success" : sentimentScore < 0 ? "danger" : "warning"}`}>
            {Math.round((sentimentScore + Number.EPSILON) * 100) / 100}
        </span>
    }
}

export default SentimentDisplay;
