import requests 


#send a get request to the json endpoint 
result = requests.get(url ="https://www.reddit.com/search/.json?q=trump").json()


#prints resulting json for search page

 
print(result)

print(type(result))


#try to iterate through posts in search results 
children = result.get("data").get("children")

print(children)
print(type(children))
