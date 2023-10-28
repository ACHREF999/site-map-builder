function FormPage(res){
    const html = `<h1>Site Map Builder </h1><br/>
    <form method="POST">
        <label for="site">Enter the baseURL in here : </label>
        <input type="text" name="site" id="site" />
        <button>Get SiteMap</button>
    </form>`
    res.writeHead(200,{'Content-Type':'text/html'})
    res.write(html)
    res.end()
    

}


module.exports = {
    FormPage,

}