var request = require("request");
var cheerio = require("cheerio");
var http = require("http");

var fs = require("fs");
var async = require("async");

http.globalAgent.maxSockets = 1000;

var volumes = [];

var website = "http://www.sahih-bukhari.com";

request(website,function(err,response,html){

    var $ = cheerio.load(html);
    var itemProcessed = 0;


    var menu = $("tr td#menu-m").children();
    var book_links;

    for(var i=0;i<menu.length;i++){

        if($(menu[i]).is("div[align='left']")){
            var vol = {
                name: "",
                books: []
            };

            volumes.push(vol);
            vol.name = $(menu[i]).find("strong").text();
            console.log(vol.name);

            book_links = $(menu[i]).next("p").children();

            for(var j=0;j<book_links.length;j++){
                if($(book_links[j]).is("a")){
                    var book = {
                        name: $(book_links[j]).text(),
                        hadiths: []
                    };

                    vol.books.push(book);

                    var url = website+"/"+$(book_links[j]).attr("href");
                    saveHadiths(book,url);
                }
            }
        }
    }

    function saveHadiths(book,url){
        console.log(url);
        request(url,function(err,res,html){

            if(err){

                console.log("error on url: "+url);
                return console.log(err);

            }

            var $ = cheerio.load(html);

            var hadiths = $("table[width='730']").children();

            for(var i=0;i<hadiths.length;i++){
                if($(hadiths[i]).next().next().find("td").attr("align") == 'justify'){
                    book.hadiths.push({
                        info: $(hadiths[i]).find("td").text(),
                        by: $(hadiths[i]).next("tr").find("td").text(),
                        text: $(hadiths[i]).next("tr").next("tr").find("td").text()
                    });
                }
            }

            console.log("content saved from "+url);

            saveToFile();

        })
    }

    function saveToFile(){
        fs.writeFile("sahih_bukhari.json",JSON.stringify(volumes),function(err){
            if(err) return console.log(err);
        });

        console.log("done");
    }
});