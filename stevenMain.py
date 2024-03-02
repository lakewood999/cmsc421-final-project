from more_itertools import last
import praw, dotenv, os
import pandas as pd
from flair.data import Sentence
from flair.nn import Classifier
#from pandarallel import pandarallel

# Initialize parallel processing
#pandarallel.initialize(progress_bar=True)

# Load the sentiment analysis model
tagger = Classifier.load('sentiment')

# Securely store credentials in a .env file
dotenv.load_dotenv()

# Create a Reddit instance
reddit = praw.Reddit(
    client_id=os.getenv('REDDIT_CLIENT_ID'),
    client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
    user_agent=os.getenv('REDDIT_USER_AGENT'),
    username=os.getenv('REDDIT_USERNAME'),
    password=os.getenv('REDDIT_PASSWORD')
)

def expand_comments(submission, limit: int = 3) -> list:
    """Expands a Reddit submission to include its comments.

    :param praw.models.Submission submission: The submission to expand.
    :return: A list containing the submission and its comments.
    """
    # Expand the submission
    submission.comments.replace_more(limit=limit)
    # Extract the comments
    comments = submission.comments.list()
    # Parse the comments
    comments = [
        {
            'body': comment.body,
            'url': comment.permalink,
            'score': comment.score
        } for comment in comments if comment.body != '[removed]' and comment.body != '[deleted]'
    ]
    return comments

def topic_search(query: str, subreddit: str, target_posts: int = 10, include_comments: bool = False, prefer_recent: bool = True) -> list:
    """Uses the Reddit API to search for posts related to a given query.

    :param str query: The search term to use.
    :param str subreddit: The subreddit to search in.
    :param int target_posts: The number of posts to retrieve.
    :param bool include_comments: Whether to include comments in the search results. Defaults to False.
    :param bool prefer_recent: Whether to prefer recent posts. Defaults to True.
    :return: A list of processed search results
    """
    search_results = []
    num_posts_to_search = int(target_posts * 2)  # Search more posts than needed to account for removed/deleted posts
    kwargs = {
        'limit': num_posts_to_search,
        'sort': 'new' if prefer_recent else 'relevance'
    }
    call = reddit.subreddit(subreddit).search(query, **kwargs)
    added = 0
    for submission in call:
        if added >= target_posts:
            break
        # Skip removed or deleted posts
        if submission.selftext == '[removed]' or submission.selftext == '[deleted]':
            continue
        # Include only self-posts
        if not submission.is_self:
            continue
        # Drop nsfw
        if submission.over_18:
            continue
        # Add the post to the search results
        search_results.append({
            'title': submission.title,
            'url': submission.permalink,
            'score': submission.score,
            'upvote_ratio': submission.upvote_ratio,
            'body': submission.selftext,
            'comments': expand_comments(submission) if include_comments else None
        })
        added += 1
    return search_results

def results_to_dataframe(results: list) -> pd.DataFrame:
    """Converts a list of search results to a pandas DataFrame.

    :param list results: The search results to convert.
    :return: A pandas DataFrame containing the search results.
    """
    # Rearrange results into more of a dataframe structures
    processed_posts = [{ "title": post['title'], 'url': post['url'], 'body': post['body'], 'type': 'post' } for post in results]
    comment_blocks = [post['comments'] for post in results if post['comments'] is not None]
    # Flatten the list of comments
    comments = [comment for block in comment_blocks for comment in block]
    processed_comments = [{ "title": "Comment", 'url': comment['url'], 'body': comment['body'], 'type': 'comment' } for comment in comments]
    # Combine the posts and comments into a single list
    combined = processed_posts + processed_comments
    # Convert the list to a DataFrame
    df = pd.DataFrame(combined)
    return df

def sentiment_analysis(df: pd.DataFrame, column: str = 'body') -> pd.DataFrame:
    """Uses the flair library to perform sentiment analysis on a DataFrame.

    :param pd.DataFrame df: The DataFrame to perform sentiment analysis on.
    :param str column: The column to perform sentiment analysis on. Defaults to 'body'.
    :return: The original DataFrame with an additional column containing the sentiment analysis results.
    """
    # Convert body to Flair sentences
    df['sentence'] = df[column].apply(lambda x: Sentence(x)) # type: ignore
    # Perform sentiment analysis
    df['sentence'].apply(lambda x: tagger.predict(x))
    df['sentiment_result'] = df['sentence'].apply(lambda x: x.labels[0].value)
    df['sentiment_score'] = df['sentence'].apply(lambda x: x.labels[0].score)
    # Drop the intermediate columns
    df.drop(columns=['sentence'], inplace=True)
    return df

# Example usage
results = topic_search('donald trump judgement', 'politics', 5, True)
df = results_to_dataframe(results)
df = sentiment_analysis(df)
print(df.head(n=30))