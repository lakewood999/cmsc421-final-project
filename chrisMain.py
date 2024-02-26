import requests 


#returns list of reddit links posts related to the given search term
#n defines the number of posts we want to retrieve 
    #TODO: implement n so we can get n posts
def search(term, n): 
    links = set()

    #the link we will be sending a GET request to
    link = f"https://www.reddit.com/search/.json?q={term}"
    # print(link)

    result = requests.get(url =link,  headers = {'User-agent': 'your bot 0.1'}).json()
    # print(result)
    #just incase we got a bad response, just try again 

    
    children = result.get("data").get("children")

    for child in children: 
        links.add("https://www.reddit.com/"+child.get("data").get("permalink"))

    
    after = result.get("data").get("after")
    print(after)

    while len(links) < n: 
        print(after)
        print("trying to find more posts", len(links))
        result = requests.get(url =f"https://www.reddit.com/search/.json?q={term}&after={after}",  headers = {'User-agent': 'your bot 0.1'}).json()
        
        children = result.get("data").get("children")

        for child in children: 
            links.add("https://www.reddit.com/"+child.get("data").get("permalink"))
        
        #update after
        after = result.get("data").get("after")
        
    
    return list(links)

res = search("wowPosts", 100)
print(len(res))
print(res)