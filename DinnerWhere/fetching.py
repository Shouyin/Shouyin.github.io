import requests
import time
import json
from bs4 import BeautifulSoup


HEADER = {
    "Host": "www.dianping.com",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
}


# main url for fetching restaurant info
DP_URL = "http://www.dianping.com/melbourne/ch10"

# it's a little bit messy to get this from the page, so..
PAGE_COUNT = 50

RSTRNT_FILE = "restaurants"

all_restaurants = {}

# main
def main():
    session = requests.Session()
    for i in range(PAGE_COUNT):
        print(i)
        pageResponse = session.get(getNextPageUrl(i), headers = HEADER)
        fetchingAPage(all_restaurants, pageResponse)

    session.close()


    with open("restaurants.txt", "w") as file:
        file.write(json.dumps(all_restaurants, ensure_ascii = False))


def fetchingAPage(restaurants, pageResponse):
    souped = BeautifulSoup(pageResponse.content, "html5lib", from_encoding = "utf-8")
    contentDivs = souped.find_all(id = "shop-all-list")
    mainContentDiv = contentDivs[0]
    mainUl = mainContentDiv.find_all("ul")[0]
    allLis = mainUl.find_all("li")
    # print(len(allLis))
    
    for li in allLis:
        tmp = dict()
        tmp["name"] = li.find_all("div", class_ = "tit")[0].a.h4.text
        print("nowgoing..")
        print(tmp["name"])
        commentDivs = li.find_all("div", class_ = "comment")[0]
        tagAddrDivs = li.find_all("div", class_ = "tag-addr")[0]
        addrSpans = tagAddrDivs.find_all("span", class_ = "addr")[0]
        tagAddrAs = tagAddrDivs.find_all("a")

        recommDivs = li.find_all("div", class_ = "recommend")[0]
        recommendedDishesAs = recommDivs.find_all("a")
        recmlist = [x.text for x in recommendedDishesAs]

        try:
            commentListSpan = li.find_all("span", class_ = "comment-list")[0]
            commentListSpans = commentListSpan.find_all("span")
            cmntlist = [x.b.text for x in commentListSpans]
        except IndexError as exception:
            cmntlist = []

        try:
            tmp["prices"] = commentDivs.find_all("a")[1].b.text
        except AttributeError as exception:
            tmp["prices"] = "-"
        tmp["type"] = tagAddrAs[0].span.text
        tmp["blurAddr"] = tagAddrAs[1].span.text
        tmp["actuAddr"] = addrSpans.text
        tmp["recommends"] = recmlist
        tmp["commentList"] = cmntlist

        if tmp["blurAddr"] not in restaurants:
            restaurants[tmp["blurAddr"]] = []
        restaurants[tmp["blurAddr"]].append(tmp)







def getNextPageUrl(nextPage):
    if nextPage:
        return DP_URL + "/p" + str(nextPage + 1)
    else:
        return DP_URL


def restaurantFileName():
    nowTime = time.localtime()
    yr = nowTime.tm_year
    mon = nowTime.tm_mon
    day = nowTime.tm_mday
    return RSTRNT_FILE + " - " + str(yr) + "/" + str(mon) + "/" + str(day) + ".txt"


if __name__ == "__main__":
    main()