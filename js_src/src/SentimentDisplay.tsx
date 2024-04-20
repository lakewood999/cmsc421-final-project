import React from 'react';

const SentimentDisplay = (props: { sentiment: undefined | number }) => {
    if (props.sentiment === undefined) {
        return <span className="badge bg-secondary me-3">
            <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </span>
    } else {
        return <span className={`badge bg-${props.sentiment > 0 ? "success" : props.sentiment < 0 ? "danger" : "warning"}`}>
            {Math.round((props.sentiment + Number.EPSILON) * 100) / 100}
        </span>
    }
}

export default SentimentDisplay;
