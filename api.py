from dataclasses import dataclass, field
import heapq
from typing import List
import praw, praw.models, os, dotenv
from prawcore.exceptions import PrawcoreException
import pandas as pd
#from nltk.sentiment import SentimentIntensityAnalyzer
#import nltk
from flair.data import Sentence
from flair.nn import Classifier

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

@dataclass(order=True)
class PrioritizedComment:
    priority: int
    comment: praw.models.Comment | praw.models.MoreComments = field(compare=False)
    parent: str = field(compare=False)

def expand_comments(submission, post_id, limit: int = 3, total_limit: int = -1) -> list:
    """Expands a Reddit submission to include its comments up to an optional depth limit.
    Also allows a total comment limit which will stop expanding comments once reached, no matter
    the depth or overall progress.

    :param praw.models.Submission submission: The submission to expand.
    :param int limit: The depth limit of comments to explore. Defaults to 3.
    :param int total_limit: The total number of comments to include. Defaults to -1 (no limit).
    :return: A list containing the submission and its comments.
    """
    # Queue will be in format of (comment, depth, parent)
    final_comments = []
    comments_queue: List[PrioritizedComment] = [PrioritizedComment(1, comment, f"post-{post_id}") for comment in submission.comments]  # Seed with top-level comments
    while len(comments_queue) > 0 and (total_limit == -1 or len(final_comments) < total_limit):
        c = heapq.heappop(comments_queue)
        depth, comment, parent = c.priority, c.comment, c.parent
        if depth > limit:
            continue
        if isinstance(comment, praw.models.Comment):
            if not (comment.body == '[removed]' or comment.body == '[deleted]'):
                final_comments.append({
                    'body': comment.body,
                    'url': comment.permalink,
                    'score': comment.score,
                    'parent': parent,
                    'id': f'comment-{comment.id}'
                })
                comments_queue.extend([PrioritizedComment(depth + 1, reply, f"comment-{comment.id}") for reply in comment.replies])
                heapq.heapify(comments_queue)
        elif isinstance(comment, praw.models.MoreComments):
            comments_queue.extend([PrioritizedComment(depth, reply, parent) for reply in comment.comments()])
            heapq.heapify(comments_queue)
    return final_comments

def topic_search(query: str, subreddit: str, target_posts: int = 10, comments_depth: int = 3, max_comments: int = -1, prefer_recent: bool = True) -> list:
    """Uses the Reddit API to search for posts related to a given query.

    :param str query: The search term to use.
    :param str subreddit: The subreddit to search in.
    :param int target_posts: The number of posts to retrieve.
    :param int comments_depth: The depth of comments to retrieve. Defaults to 3. 
    :param int max_comments: The maximum number of comments to retrieve PER POST. Defaults to -1 (no limit).
    :param bool prefer_recent: Whether to prefer recent posts. Defaults to True.
    :return: A list of processed search results
    """
    search_results = []
    num_posts_to_search = int(target_posts * 5)  # Search more posts than needed to account for removed/deleted posts
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
        #if not submission.is_self:
        #    continue
        # Drop nsfw
        if submission.over_18:
            continue
        # Add the post to the search results
        search_results.append({
            'subreddit': submission.subreddit.display_name.lower(),
            'title': submission.title,
            'url': submission.permalink,
            'score': submission.score,
            'upvote_ratio': submission.upvote_ratio,
            'body': submission.selftext,
            'id': f"post-{submission.id}",
            'comments': expand_comments(submission, submission.id, comments_depth, max_comments)
        })
        added += 1
    return search_results

def results_to_dataframe(results: list) -> pd.DataFrame:
    """Converts a list of search results to a pandas DataFrame.

    :param list results: The search results to convert.
    :return: A pandas DataFrame containing the search results.
    """
    # Rearrange results into more of a dataframe structures
    processed_posts = [{ "title": post['title'], 'url': post['url'], 'body': post['body'], 'type': 'post', 'parent': 'none', 'id': post['id'] } for post in results]
    comment_blocks = [post['comments'] for post in results if post['comments'] is not None]
    # Flatten the list of comments
    comments = [comment for block in comment_blocks for comment in block]
    processed_comments = [{ "title": "Comment", 'url': comment['url'], 'body': comment['body'], 'type': 'comment', 'parent': comment['parent'], 'id': comment['id'] } for comment in comments]
    # Combine the posts and comments into a single list
    combined = processed_posts + processed_comments
    # Convert the list to a DataFrame
    df = pd.DataFrame(combined)
    return df