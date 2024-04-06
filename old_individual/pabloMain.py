import pandas as pd
import praw
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk

# Reddit credentials 
user = ""
password = ""
user_agent = ""
client_id = ""
client_secret = ""

reddit = praw.Reddit(client_id=client_id,
                     client_secret=client_secret,
                     user_agent=user_agent,
                     username= user,
                     password=password)

# NLTK Lexicon & Sentiment Analysis
nltk.download('vader_lexicon')
sia = SentimentIntensityAnalyzer()

topic = 'Opinion on Biden'
index = 1

# List to store dictionaries of data
data = []

for post in reddit.subreddit('all').search(topic, limit=1000):
    if not post.is_self:
        continue  # Skipping non-text posts

    sentiment = sia.polarity_scores(post.selftext)
    compound_score = sentiment['compound']
    sentiment_type = 'Neutral'  # Sentiment = Neutral by default 

    if compound_score > 0.05:
        sentiment_type = 'Positive'
    elif compound_score < -0.05:
        sentiment_type = 'Negative'

    # Append a dictionary for each post to the list
    data.append({
        'Index': index,
        'Text': post.selftext,
        'Compound': compound_score,
        'Sentiment': sentiment_type,
        'Neg': sentiment['neg'],
        'Neu': sentiment['neu'],
        'Pos': sentiment['pos']
    })

    index += 1

df = pd.DataFrame(data)