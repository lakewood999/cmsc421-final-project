import React from "react";
import useDataStore from "./datastore";
import { dataToNested } from "./helpers";

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
  const [errorString, setErrorString] = React.useState(""); // TODO: implement error handling

  const setRedditData = useDataStore((state) => state.setRedditData);

  const apiCall = () => {
    setIsLoading(true);
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
        console.log(data.results);
        console.log(dataToNested(data.results));
        setRedditData(data.results);
        setIsLoading(false);
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
