import requests 



result = requests.get(url ="https://www.reddit.com/search/.json?q=trump") 


#prints resulting json for search page
print(result.json())