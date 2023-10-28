const http = require('http')
const controllers = require('./controllers')
const crawler = require('./utils')
const qs = require('querystring')


const PORT = 5003;



function unhandled(res,url){
    res.writeHead(404,{'Content-Type':'text/html'})
    res.write(`<h2>404 | Not Found ;( </h2> <br/> the requested url : {${url}} does not exists`)
    res.end()
}

const server = http.createServer((req,res)=>{
    
    if(req.url==="/"){
        if (req.method==="GET"){
            controllers.FormPage(res)

        }
        
        else if(req.method==="POST"){
            let body = '';

            req.on('data', function (data) {
                body += data;

                if (body.length > 1e6)
                    req.connection.destroy();
            });

            req.on('end', async function () {
                let post = qs.parse(body);

                res.writeHead(200,{"Content-Type":"text/plain"})
                let fff = await crawler.start(post['site'])
                res.write(fff )
                
                res.end()




            });
            

        }
        
        else{
            unhandled(res)
        }
    }
    else{
        unhandled(res,req.url)
    }

})




server.listen(PORT,()=>{
    console.log(`Server started listening on PORT:${PORT}\n`);
})