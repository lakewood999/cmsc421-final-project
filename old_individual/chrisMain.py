import requests 


#returns list of reddit links posts related to the given search term
#n defines the number of posts we want to retrieve 
    #TODO: implement a way to detect when "n" is unreachable... I assume this is whenever after is none
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

        #if after becomes none we have no more posts to go through
        if after is None:
            break

        print(after)
        print("trying to find more posts", len(links))
        result = requests.get(url =f"https://www.reddit.com/search/.json?q={term}&after={after}",  headers = {'User-agent': 'your bot 0.1'}).json()
        
        children = result.get("data").get("children")

        for child in children: 
            links.add("https://www.reddit.com/"+child.get("data").get("permalink"))
        
        #update after
        after = result.get("data").get("after")
        
    
    return list(links)

res = search("wowPosts", 1000)
print(len(res))
print(res)