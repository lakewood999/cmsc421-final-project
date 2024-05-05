import React from "react";
import useDataStore from "./datastore";
import { ResultRow } from "./helpers";
import DisplayPost from "./DisplayPost";

const ResultsRender = () => {
    const data: ResultRow[] = useDataStore((state) => state.redditData);
    let body = [<p>No data available yet. Please make a search to continue!</p>];
    if (data === null) {
        body
    } else if (data.length > 0) {
        // filter out the posts
        const posts = data.filter((item) => item.type === "post")
        body = posts.map((post, i) => {
            return <DisplayPost postId={post.id} idx={i} />;
        })
    } else if (data.length === 0) {
        body = [<p>No results found for the given parameters. Try adjusting the advanced options or the search terms and try again.</p>];
    }
    return (
        <div>
            <h1>Results</h1>
            {body}
        </div>
    )
}

export default ResultsRender;
