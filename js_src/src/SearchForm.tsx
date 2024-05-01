import React from "react";
import useDataStore from "./datastore";
import { ResultRow, dataToNested } from "./helpers";

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
    // Internal state
    const [isLoading, setIsLoading] = React.useState(false);
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [_, setErrorString] = React.useState(""); // TODO: implement error handling

    const setRedditData = useDataStore((state) => state.setRedditData);
    const setSentimentData = useDataStore((state) => state.setSentimentData);
    const dangerouslySetSentimentData = useDataStore((state) => state.dangerouslySetSentimentData);

    const apiCall = () => {
        setIsLoading(true);
        // clear out old data
        setRedditData(null);
        dangerouslySetSentimentData({});
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
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // add empty placeholder for sentiment
                const nestedData = dataToNested(data.results);
                setRedditData(data.results);
                setIsLoading(false);

                // grab the sentiment for posts - these are items in nestedData with "post-*" as the key
                const posts = Object.keys(nestedData.nested).filter((key) => key.startsWith("post-"));
                const postsData = posts.map((post) => nestedData.parentData[post]);
                getSentiment(postsData, (results: SentimentResult[]) => sentimentCallback(results, setSentimentData, "flair"), "flair");
                getSentiment(postsData, (results: SentimentResult[]) => sentimentCallback(results, setSentimentData, "hf"), "hf");

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
                }
            })
            .catch((error) => {
                setIsLoading(false);
                setErrorString("An error occurred. Please try again later.");
                console.error("Error:", error);
            });
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: "center" }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            apiCall();
        }}>
            <label className="form-label">
                What topic would you like to know Reddit's general sentiment of?
            </label>
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
            <a
                role="button"
                href="#advancedOptionsCollapsible"
                data-bs-toggle="collapse"
                onClick={() => setShowAdvanced(!showAdvanced)}
            >
                {showAdvanced ? "Hide" : "Show"} advanced options
            </a>
            <div className="collapse" id="advancedOptionsCollapsible">
                <div className="row">
                    <div className="col-md-3">
                        <label className="form-label">Subreddit</label>
                        <input
                            type="text"
                            className="form-control"
                            value={subreddit}
                            onChange={(e) => {
                                setSubreddit(e.target.value);
                            }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label">Target total posts</label>
                        <input
                            type="number"
                            className="form-control"
                            value={targetPosts}
                            onChange={(e) => {
                                setTargetPosts(parseInt(e.target.value));
                            }}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label">Max comments depth</label>
                        <input
                            type="number"
                            className="form-control"
                            value={commentsDepth}
                            onChange={(e) => {
                                setCommentsDepth(parseInt(e.target.value));
                            }}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Max comments per post</label>
                        <input
                            type="number"
                            className="form-control"
                            value={maxComments}
                            onChange={(e) => {
                                setMaxComments(parseInt(e.target.value));
                            }}
                        />
                    </div>
                </div>
            </div>
        </form>
    );
}
