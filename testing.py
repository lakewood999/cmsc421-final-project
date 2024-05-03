import flair
from flair.data import Sentence
from flair.nn import Classifier
from transformers import AutoModelForSequenceClassification
from transformers import AutoTokenizer, AutoConfig
from nltk.sentiment import SentimentIntensityAnalyzer

import pandas as pd
from scipy.special import softmax

# Dataset of reddit comments with an analysis score of 1, 0, or -1
df = pd.read_csv('Reddit_Data.csv')

# Load the sentiment analysis model
model_path = "cardiffnlp/twitter-roberta-base-sentiment-latest"
tokenizer = AutoTokenizer.from_pretrained(model_path)
config = AutoConfig.from_pretrained(model_path)
# PT
model = AutoModelForSequenceClassification.from_pretrained(model_path)

# Load the sentiment analysis model
tagger = Classifier.load('sentiment')

print(df)