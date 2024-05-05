import React, { useState } from 'react';
import { ResultRow } from './helpers';
import useDataStore from './datastore';

const PostSummary = () => {
    const [activated, setActivated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState("");
    const redditData = useDataStore((state) => state.redditData);

    // grab only the posts
    const posts = (redditData === null) ? [] : redditData.filter((entry: ResultRow) => entry.type === "post" && entry.body !== "");
    console.log(posts);

    const generateSummary = async () => {
        setActivated(true);
        setLoading(true);
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: posts })
        });
        const data = await response.json();
        setSummary(data.summary);
        setLoading(false);
    }

    let cardBodyContent = null;
    if (!activated) {
        cardBodyContent = <div>
            <button className="btn btn-primary" onClick={generateSummary} disabled={redditData === null || posts.length === 0}>Generate Summary</button>
            {
                (redditData !== null) ? <p className="mt-2">There are {posts.length} posts available for summarization. Only Reddit self-posts are eligible</p> : null
            }
        </div>
    } else {
        if (loading) {
            cardBodyContent = <p>Generating summary...</p>
        } else {
            cardBodyContent = <p><b>Summary: </b>{summary}</p>
        }
    }

    return <div className="card mb-4 rounded-3 shadow-sm">
        <div className="card-header py-3">
            <h4 className="my-0 fw-normal">Summary of Posts</h4>
        </div>
        <div className="card-body">
            <p>
                This feature uses OpenAI's GPT-3.5 model to summarize all of the posts (not comments) that have been analyzed and provide a rough sentiment analysis overview. Due to the costs associated with the API, this feature is opt-in and can be run by clicking the button below.
            </p>
            {cardBodyContent}
        </div>
    </div>
}

export default PostSummary;
