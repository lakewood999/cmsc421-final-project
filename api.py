from dataclasses import dataclass, field
import heapq
from typing import List
import praw, praw.models, os, dotenv
import pandas as pd
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
import flair
from flair.data import Sentence
from flair.nn import Classifier
from scipy.special import softmax
from transformers import AutoModelForSequenceClassification
from transformers import AutoTokenizer, AutoConfig

from openai import OpenAI

# Load the environment variable
from dotenv import load_dotenv

from pathlib import Path
flair.cache_root = Path(os.getenv('FLAIR_CACHE_ROOT', '/.cache/flair'))

# Load the sentiment analysis model - for hugging face
model_path = "cardiffnlp/twitter-roberta-base-sentiment-latest"
tokenizer = AutoTokenizer.from_pretrained(model_path)
config = AutoConfig.from_pretrained(model_path)
# PT
model = AutoModelForSequenceClassification.from_pretrained(model_path)

# Load the sentiment analysis model - for flair
tagger = Classifier.load('sentiment-fast')

# Load the model for NLTK
# only download if not already downloaded
nltk.data.path.append("/root/nltk_data")
try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon', download_dir='/root/nltk_data')
sia = SentimentIntensityAnalyzer()

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

def topic_search(query: str, subreddit: str, target_posts: int = 10, comments_depth: int = 3, max_comments: int = -1,
                 prefer_recent: bool = True, self_post_only: bool = False) -> list:
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
        if self_post_only and not submission.is_self:
            continue
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

def hf_preprocess_text(words: str) -> str:
    new_text = []
    for t in words.split(" "):
        t = 'u/user' if t.startswith('u/') and len(t) > 2 else t
        t = 'r/sub' if t.startswith('r/') and len(t) > 2 else t
        t = 'http' if t.startswith('http') else t
        new_text.append(t)
    return " ".join(new_text)

def sentiment_analysis(df: pd.DataFrame, column: str = 'body', mode: str = "flair") -> pd.DataFrame:
    """Uses the flair library to perform sentiment analysis on a DataFrame.

    :param pd.DataFrame df: The DataFrame to perform sentiment analysis on.
    :param str column: The column to perform sentiment analysis on. Defaults to 'body'.
    :return: The original DataFrame with an additional column containing the sentiment analysis results.
    """
    # Drop any rows with empty bodies
    df[column] = df[column].apply(lambda x: x.strip() if isinstance(x, str) else x)
    df = df[df[column] != ''].copy()
    if mode == "flair":
        # trunace the sentences to 480 tokens to be safe
        df[column] = df[column].apply(lambda x: x[:480])
        # Convert body to Flair sentences
        df['sentence'] = df[column].apply(lambda x: Sentence(x)) # type: ignore
        # Perform sentiment analysis
        df['sentence'].apply(lambda x: tagger.predict(x))
        df['sentiment_result'] = df['sentence'].apply(lambda x: x.labels[0].value)
        df['sentiment_score'] = df['sentence'].apply(lambda x: x.labels[0].score)
        # Drop the intermediate columns
        df.drop(columns=['sentence'], inplace=True)
    elif mode == "hf":
        # Preprocess text
        df['sentence'] = df[column].apply(lambda x: hf_preprocess_text(x))
        # tokenize
        df['tokens'] = df['sentence'].apply(lambda x: tokenizer(x, padding=True, truncation=True,
                                                                max_length=512, return_tensors='pt'))
        df['output'] = df['tokens'].apply(lambda x: model(**x))
        df['scores'] = df['output'].apply(lambda x: softmax(x[0][0].detach().numpy()))
        df['ranking'] = df['scores'].apply(lambda x: x.argsort()[::-1])
        df['sentiment_result'] = df['ranking'].apply(lambda x: config.id2label[x[0]])
        df['first_ranking'] = df['ranking'].apply(lambda x: x[0])
        # only do the below if first_ranking isn't empty
        if not df['first_ranking'].empty:
            df['sentiment_score'] = df.apply(lambda x: x['scores'][x['first_ranking']], axis=1)
        #df['sentiment_score'] = df.apply(lambda x: x['scores'][x['ranking'][0]], axis=1)
        # Drop the intermediate columns
        df.drop(columns=['sentence', 'tokens', 'output', 'scores', 'ranking'], inplace=True)
    elif mode == "nltk":
        df['sentiment_tmp'] = df[column].apply(lambda x: sia.polarity_scores(x))
        df['sentiment_score'] = df['sentiment_tmp'].apply(lambda x: x['compound'])
        df['sentiment_result'] = df['sentiment_score'].apply(lambda x: 'positive' if x >= 0.05 else ('negative' if x <= -0.05 else 'neutral'))
        df.drop(columns=['sentiment_tmp'], inplace=True)
    return df

# Function to request chatGPT for a summary of what is being said in the comments 
def summarize_content(df: pd.DataFrame, column: str = 'body'):
    """Summarizes the content of a DataFrame using OpenAI's ChatGPT.

    :param pd.DataFrame df: The DataFrame containing the text to summarize.
    :param str column: The name of the column in df that contains the text.
    """
    load_dotenv()

    api_key = os.getenv('OPENAI_API_KEY')
    client = OpenAI(api_key=api_key)

    # Ensure that the DataFrame column exists and is not empty
    if column in df.columns and not df[column].isnull().all():
        # Join all text items into a single string with new lines separating them
        text_content = "\n".join(df[column].dropna().tolist())

        # Prompt the API call
        prompt = "Given the following array of opinions/comments provided, please generate a concise and informative summary that captures the key themes and perspectives expressed. Ensure the summary maintains a neutral and professional tone, presenting the opinions objectively without bias. Focus on distilling the main points and overarching sentiment conveyed in the array.\n\nHere are the opinions/comments: " + text_content

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo", 
                messages=[{"role": "user", "content": prompt}]
            )
            # Check if the response is valid and print the summary
            if response and response.choices and len(response.choices) > 0:
                summary = response.choices[0].message.content
                print("Generated summary:", summary)
                return summary
            else:
                print("No response or unexpected response format.")
        except Exception as e:
            print("Error during API call:", str(e))
            return f"Error during API call: {str(e)}"
    else:
        print("The specified column does not exist or is completely empty.")
        return "Error: The specified column does not exist or is completely empty."
