import React from 'react';

const SentimentDisplay = (props: { sentiment: undefined | number }) => {
    if (props.sentiment === undefined) {
        return <span className="badge bg-secondary me-3">
            <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </span>
    } else {
        return <span className={`badge bg-${props.sentiment > 1 ? "success" : (props.sentiment > 0 ? "secondary" : (props.sentiment < 0 ? "danger" : "warning"))}`}>
            {Math.round((Math.abs(props.sentiment % 1) + Number.EPSILON) * 100) / 100}
        </span>
    }
}

export default SentimentDisplay;
