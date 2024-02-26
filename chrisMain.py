import requests 


#returns list of reddit links posts related to the given search term
#n defines the number of posts we want to retrieve 
    #TODO: implement n so we can get n posts
def search(term, n): 
    links = []

    #the link we will be sending a GET request to
    link = f"https://www.reddit.com/search/.json?q={term}"
    # print(link)

    result = requests.get(url =link,  headers = {'User-agent': 'your bot 0.1'}).json()
    # print(result)
    #just incase we got a bad response, just try again 

    
    children = result.get("data").get("children")

    for child in children: 
        links.append("https://www.reddit.com/"+child.get("data").get("permalink"))
    
    return links


print(len(search("wowPosts", 1)))