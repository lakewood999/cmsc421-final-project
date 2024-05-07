import React from "react";
import useDataStore from "./datastore";
import { ResultRow, dataToNested } from "./helpers";
import SentProgress from "./SentProgress";
import { Tooltip } from "react-tooltip";
import { QuestionCircle } from 'react-bootstrap-icons';

async function getSentiment(data: ResultRow[], callback: (results: object[]) => void, method: string = "flair") {
    const response = await fetch("/api/sentiment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: data, method: method }),
    });
    const results = await response.json();
    callback(results.results!);
}

function sentimentCallback(results: SentimentResult[], setData: (data: object) => void, method: string = "flair") {
    const resultDict = results.reduce((acc, result) => {
        const resultDict: { [key: string]: { label: string, score: number } } = {};
        resultDict[method] = {
            label: result.sentiment_result.toLowerCase(),
            score: result.sentiment_score,
        }
        acc[result.id] = resultDict;
        return acc;
    }, {} as { [key: string]: { [key: string]: { label: string, score: number } } });
    setData(resultDict);
}

type SentimentResult = {
    id: string;
    sentiment_score: number;
    sentiment_result: string;
};

export default function SearchForm() {
    // api parameters
    const [searchTerm, setSearchTerm] = React.useState("");
    const [subreddit, setSubreddit] = React.useState("politics");
    const [targetPosts, setTargetPosts] = React.useState(2);
    const [commentsDepth, setCommentsDepth] = React.useState(3);
    const [maxComments, setMaxComments] = React.useState(-1);
    const [requireSelfPosts, setRequireSelfPosts] = React.useState(true);
    // Internal state
    const [isLoading, setIsLoading] = React.useState(false);
    const [showAdvanced, setShowAdvanced] = React.useState(true);
    const [errorString, setErrorString] = React.useState(""); // TODO: implement error handling

    const redditData = useDataStore((state) => state.redditData);
    const setRedditData = useDataStore((state) => state.setRedditData);
    const setSentimentData = useDataStore((state) => state.setSentimentData);
    const dangerouslySetSentimentData = useDataStore((state) => state.dangerouslySetSentimentData);

    const apiCall = () => {
        setIsLoading(true);
        // clear out old data
        setRedditData(null);
        dangerouslySetSentimentData({});
        setErrorString("");
        fetch("/api/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                search_term: searchTerm,
                subreddit: subreddit,
                target_posts: targetPosts,
                comments_depth: commentsDepth,
                max_comments: maxComments,
                require_self_posts: requireSelfPosts,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // check if empty
                if (data.results.length === 0) {
                    setIsLoading(false);
                    setErrorString("No results found for the given parameters. Try adjusting the advanced options or the search terms and try again. Also, ensure that there are no typos in the subreddit name or search query.");
                    return;
                }
                // add empty placeholder for sentiment
                const nestedData = dataToNested(data.results);
                setRedditData(data.results);
                setIsLoading(false);

                // grab the sentiment for posts - these are items in nestedData with "post-*" as the key
                const posts = Object.keys(nestedData.nested).filter((key) => key.startsWith("post-"));
                const postsData = posts.map((post) => nestedData.parentData[post]);
                getSentiment(postsData, (results: SentimentResult[]) => sentimentCallback(results, setSentimentData, "flair"), "flair");
                getSentiment(postsData, (results: SentimentResult[]) => sentimentCallback(results, setSentimentData, "hf"), "hf");
                getSentiment(postsData, (results: SentimentResult[]) => sentimentCallback(results, setSentimentData, "nltk"), "nltk");

                // grab the sentiment for comments, preferring top level comments
                // TODO: need to actually include depth to sort by it
                const commentsData = data.results.filter((item: ResultRow) => item.type === "comment");
                // for now, group into sets of 50
                const commentGroups = [];
                for (let i = 0; i < commentsData.length; i += 50) {
                    commentGroups.push(commentsData.slice(i, i + 50));
                }
                // sort by depth, so we get top level comments first
                //commentsData.sort((a, b) => a.depth - b.depth);
                for (const group of commentGroups) {
                    getSentiment(group, (results: SentimentResult[]) => sentimentCallback(results, setSentimentData, "flair"), "flair");
                    getSentiment(group, (results: SentimentResult[]) => sentimentCallback(results, setSentimentData, "hf"), "hf");
                    getSentiment(group, (results: SentimentResult[]) => sentimentCallback(results, setSentimentData, "nltk"), "nltk");
                }
            })
            .catch((error) => {
                setIsLoading(false);
                setErrorString("An error occurred. Please try again later. Check for spelling errors in the subreddit name or search query.");
                console.error("Error:", error);
            });
    };


    let sentimentProgress = null;
    if (redditData !== null) {
        sentimentProgress = <div>
            <hr />
            <p>Sentiment analysis progress:</p>
            <SentProgress />
        </div>;
    }

    let errorDisplay = null;
    if (errorString !== "") {
        errorDisplay = <div className="alert alert-danger" role="alert">
            {errorString}
        </div>;
    }

    let cardBody = null;
    if (isLoading) {
        cardBody = <div style={{ textAlign: "center" }}>
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div><br />
            Loading Reddit results...
        </div>;
    } else {
        cardBody = <div>
            <form onSubmit={(e) => {
                e.preventDefault();
                apiCall();
            }}>
                <label className="form-label"><b>
                    What topic would you like to know Reddit's general sentiment of?
                </b></label>
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                    />
                    <button className="btn btn-primary" type="submit">
                        Search
                    </button>
                </div>
                {errorDisplay}
                <a
                    role="button"
                    href="#advancedOptionsCollapsible"
                    data-bs-toggle="collapse"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    {showAdvanced ? "Hide" : "Show"} advanced options
                </a>
                <div className="collapse show" id="advancedOptionsCollapsible">
                    <div className="row">
                        <div className="col-md-2">
                            <label className="form-label"><b>Subreddit</b><QuestionCircle data-tooltip-id="subreddit-help" data-tooltip-content="Name of the subreddit. Do not include r/" className="ms-2" color="black" /><Tooltip id="subreddit-help" /></label>
                            <div className="input-group">
                                <span className="input-group-text">r/</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={subreddit}
                                    onChange={(e) => {
                                        setSubreddit(e.target.value);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label"><b>Target total posts</b><QuestionCircle data-tooltip-id="target-total-posts-help" data-tooltip-content="Total number of posts to attempt to retrieve on best effort; not guaranteed post-filtering" className="ms-2" color="black" /><Tooltip id="target-total-posts-help" /></label>
                            <input
                                type="number"
                                className="form-control"
                                value={targetPosts}
                                onChange={(e) => {
                                    setTargetPosts(parseInt(e.target.value));
                                }}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label"><b>Max comments depth</b><QuestionCircle data-tooltip-id="max-comments-depth-help" data-tooltip-content="Max nesting of comments to retrieve, keep low for performance" className="ms-2" color="black" /><Tooltip id="max-comments-depth-help" /></label>
                            <input
                                type="number"
                                className="form-control"
                                value={commentsDepth}
                                onChange={(e) => {
                                    setCommentsDepth(parseInt(e.target.value));
                                }}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label"><b>Max comments per post</b><QuestionCircle data-tooltip-id="max-comments-post-help" data-tooltip-content="Max comments per post, prioritizing top level nesting. -1 for no limit besides depth" className="ms-2" color="black" /><Tooltip id="max-comments-post-help" /></label>
                            <input
                                type="number"
                                className="form-control"
                                value={maxComments}
                                onChange={(e) => {
                                    setMaxComments(parseInt(e.target.value));
                                }}
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label"><b>Require self-posts</b><QuestionCircle data-tooltip-id="self-posts-help" data-tooltip-content="Filter only self-posts (user text instead of link posts)" className="ms-2" color="black" /><Tooltip id="self-posts-help" /></label><br />
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={requireSelfPosts}
                                onChange={(e) => {
                                    setRequireSelfPosts(e.target.checked);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </form>
            {sentimentProgress}
        </div>;
    }
    return <div className="card mb-4 rounded-3 shadow-sm mb-3">
        <div className="card-header py-3">
            <h4 className="my-0 fw-normal">Search Reddit</h4>
        </div>
        <div className="card-body">
            <p>Submit a query on Reddit to analyze the sentiment of. Additional options, such as the desired subreddit, number of posts and comments, and more can be modified via the Advanced Options area.</p>
            {cardBody}
        </div>
    </div>;
}
