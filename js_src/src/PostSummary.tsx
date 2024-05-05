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
            body: JSON.stringify({ posts: [] })
        });
        const data = await response.json();
        setSummary(data.summary);
        setLoading(false);
    }

    if (!activated) {
        return <div>
            <h1>Summary of Posts</h1>
            <p>If you would like to generate a summary of the posts analyzed and a description of the overall sentiments expressed, click on the button below. Note that this feature is opt-in to reduce the costs associated with using the OpenAI API.</p>
            <button className="btn btn-primary" onClick={generateSummary} disabled={redditData === null}>Generate Summary</button>
        </div>
    } else {
        if (loading) {
            return <div>
                <h1>Summary of Posts</h1>
                <p>Generating summary...</p>
            </div>
        }
        return <div>
            <h1>Summary of Posts</h1>
            <p>{summary}</p>
        </div>
    }
}

export default PostSummary;
