from flask import Flask, jsonify, render_template, request
from api import sentiment_analysis, topic_search,  results_to_dataframe, summarize_content
import pandas as pd

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/search", methods=["POST"])
def api_search():
    """
    Responsible for taking the search term and calling Reddit's API to search for posts related to the search term.
    This is separate from the sentiment analysis API since sentiment analysis is slow; we'll want to call the sentiment analysis
    in batches from the front-end.
    """
    req = request.get_json()
    if req is None:
        return jsonify({"error": "Invalid request"})
    if "search_term" not in req:
        return jsonify({"error": "Missing search term"})
    
    search_term = req["search_term"]
    subreddit = req.get("subreddit", "all")
    target_posts = req.get("target_posts", 10)
    comments_depth = req.get("comments_depth", 3)
    max_comments = req.get("max_comments", -1)
    require_self_posts = req.get("require_self_posts", False)

    search_results = topic_search(search_term, subreddit, target_posts, comments_depth, max_comments, self_post_only = require_self_posts)
    df = results_to_dataframe(search_results)

    return jsonify({"results": df.to_dict(orient="records")})

# I'm not sure how we want to structure the data input for sentiment analysis, so this will be a TODO
@app.route("/api/sentiment", methods=["POST"])
def api_sentiment():
    """
    Takes in a list of the results from the search api and runs the sentiment analysis on them,
    returning a object with the id identifying the post/comment and a numerical score for sentiment.
    """
    content = request.get_json()
    if content is None:
        return jsonify({"error": "Invalid request"})
    if "data" not in content:
        return jsonify({"error": "Missing data"})
    if "method" not in content:
        return jsonify({"error": "Missing method"})
    if content['data'] == []:
        return jsonify({"results": []})

    # convert the content into a dataframe
    df = pd.DataFrame(content['data'])
    # run the sentiment analysis
    sentiment_df = sentiment_analysis(df, mode=content['method'])
    
    return jsonify({"results": sentiment_df.to_dict(orient="records")})

# Get a summary 
@app.route("/api/summarize", methods=["POST"])
def api_summarize():

    content = request.get_json()
    if content is None:
        return jsonify({"error": "Invalid request"})
    if "data" not in content:
        return jsonify({"error": "Missing data"})
    if content['data'] == []:
        return jsonify({"summary": ""})

    # convert the content into a dataframe
    df = pd.DataFrame(content['data'])
    # run the sentiment analysis
    summary = summarize_content(df)    
    return jsonify({"summary": summary})

if __name__ == '__main__':
    app.run(debug=True, port=8084)

