import praw
from prawcore.exceptions import PrawcoreException
import pandas as pd
#import numpy as np
from time import sleep
#from nltk.sentiment import SentimentIntensityAnalyzer

def build_df(query):
    '''I need to rewrite print statements as result statements'''

    reddit = praw.Reddit("sentimentbot", user_agent='sentiment user agent')
    reddit.read_only = True

    sub = reddit.subreddit("all")

    found = 0 # Total number of submissions
    replies = 0 # Total number of replies

    df_index = 0
    limit = 10
    if limit < 1000:
        lim = limit
    else:
        lim = 1000

    text_df = pd.DataFrame(columns=['ID', 'POST_TYPE', 'TEXT'])
    user_search = query
    searchstr = "self:true " + user_search
    try:
        posts = sub.search(query=searchstr, limit=lim)
        for submiss in posts:
            # Maybe some filtering stuff before if-statement
            if not submiss.over_18 and submiss.is_self: # This filtering step could be expanded
                ptype = 'submission'
                text_df.loc[df_index] = [submiss.id, ptype, submiss.selftext]

                found += 1
                df_index += 1


    except PrawcoreException as whoops:
        excp = 'Subreddit search failed: ' + str(whoops) + '\nShutting down...Please try again later.'
        return([excp], [], False)

    found_str = 'Found ' + str(found) + ' that match your search \"' + user_search + '\"'

    row = 0
    while row < found:
        try:
            curr_id = text_df['ID'][row]
            curr_submiss = reddit.submission(curr_id)
        except PrawcoreException as whoops:
            excp = 'Failure in re-attaining submission' + str(row) + ' due to ' + str(whoops) + ', moving on...'

        Liberty_Reservoir_CWMA = curr_submiss.comments
        while True:
            try:
                Liberty_Reservoir_CWMA.replace_more()
                break
            except PrawcoreException:
                sleep(0.5)
        coms = Liberty_Reservoir_CWMA.list()
        c = 0
        while c < len(coms) and df_index < limit:
            com = coms[c]
            ptype = 'comment'
            text_df.loc[df_index] = [com.id, ptype, com.body]
            replies += 1
            df_index += 1
            c += 1

        row += 1

    rep_str = 'There were a total of ' +  str(replies) + ' replies to the submissions found.'
    post_str = 'Total number of posts to analyze: ' + str(df_index)

    def sent_analysis(words):
        if len(words) == 0:
            return [0,0,0,0]
        #sid = SentimentIntensityAnalyzer()
        #ss = sid.polarity_scores(words)
        #return ss #pd.Series([ss['pos'], ss['neu'], ss['neg'], ss['compound']], index=['POS_SCORE', 'NEU_SCORE', 'NEG_SCORE', 'COM_SCORE'])

    text_df['SCORE_DICT'] = text_df['TEXT'].apply(sent_analysis)
    # Keys for sentiment dictionaries: 'neg', 'neu', 'pos', 'compound'

    sent_keys = ['pos', 'neu', 'neg', 'compound']
    # New columns: POS_SCORE, NEU_SCORE, NEG_SCORE, COMPOUND_SCORE
    for k in sent_keys:
        new_col = k.upper() + '_SCORE'
        text_df[new_col] = text_df['SCORE_DICT'].apply(lambda sdict: sdict[k])

    return [found_str, rep_str, post_str], [text_df.columns], True
