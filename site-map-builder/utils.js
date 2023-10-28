const {JSDOM} = require('jsdom')

function normalizeURL(url){

        let _url  = new URL(url)
        let newURL = `${_url.hostname}${_url.pathname}`
        if(newURL.length && newURL.slice(-1)==="/") newURL= newURL.slice(0,-1)

        return newURL
    

}

function getURLs(html,baseURL){
    const urls= []

    const dom = new JSDOM(html)

    const links = dom.window.document.querySelectorAll("a")


    for (let linkElement of links){

        if(linkElement.href.slice(0,1)==="/"){
            try{
                const new_url = new URL(`${baseURL}${linkElement.href}`)
                urls.push(new_url.href)

            }
            catch(err){
                console.log(`Invalid Relative URL ${baseURL}${linkElement.href} \n ${err.message}`)

            }
        }
        else{
            try{
                const new_url = new URL(`${linkElement.href}`)
                urls.push(new_url.href)
            }
            catch(err){
                try{
                    const new_url = new URL(`${baseURL.slice(-1)==="/"?baseURL:`${baseURL}/`}${linkElement.href.slice(0)==="/"?linkElement.href.slice(1):linkElement.href}`)
                    urls.push(new_url)
                }
                catch(err){

                console.log(`Invalid Absolute URL ${linkElement.href} \n ${err.message}`)
                }


            }
        }

    }



    return urls
}


const fixLink = (link)=>{
    try{
    const lst = link?.split("://")

    lst[1] = lst[1]?.replaceAll("//","/")
    const newLink =lst.join("://")
    
    console.log(newLink)
    return `<url>
                        <loc>${newLink}</loc>
            </url>`}
    catch(err){
        return `<url>
                        <loc>${link}</loc>
            </url>`
    }
}


function buildSiteMap(urls){

    let finishedURLs = []



    
    return `
    <?xml	version="1.0"	encoding="UTF-8"?>
    <urlset	xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                <url>
                            <loc>http://www.example.com/</loc>
                </url>
                ${urls.map(fixLink).join("\n\t\t")}
    </urlset>`
}


async function start(baseURL){
    // const normalizedBaseURL = normalizeURL(baseURL)
    let urls = []
    // console.log("reached")

    await crawl(baseURL,baseURL,urls)
    // urls=['http://www.example.com/hello','http://www.example.com/panic']
    let result = buildSiteMap(urls)



    return result




}

async function crawl(currentURL,baseURL,urls){
    try{
    const baseURLObj = new URL(baseURL)
    const currentURLObj = new URL(currentURL)
    if(baseURLObj.hostname !== currentURLObj.hostname) return urls

    // const normalaizedCurrentURL = normalizeURL(currentURL)

    if (urls.includes(currentURL)){
        return urls
    }
    else{
        urls.push(currentURL)
    }

    try{
        const resp = await fetch(currentURL)

        if (resp.status > 399){
            console.log(`Error with status : ${resp.status}`)
            return urls
        }

        const contentType  = resp.headers.get('content-type')
        if (!contentType.includes('text/html')){
            console.log(`This ${contentType} Not Parseable Sorry`)
            return urls
        }

        const html = await resp.text()

        const links = getURLs(html,baseURL)

        for (let link of links) {
            crawl(link,baseURL,urls)
        }
        return urls

    }
    catch(err){
        console.log(`An error occured : ${err}`)
    }

    }
    catch(err){
        console.log('Non Valid URL')
    }
}

module.exports = {
    crawl,
    start,
    buildSiteMap,
    getURLs,
    normalizeURL,
}