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
                    saveHadiths(book,url,book_links.length-1);
                }
            }
        }
    }



    /*$("tr td#menu-m").children().each(function(index){

        if($(this).attr("align") == 'left'){


            if($(this).is("div")){

                var vol = {
                    name: "",
                    books: []
                };

                volumes.push(vol);

                vol.name = $(this).find("strong").text();

                $(this).next("p").children().each(function(i){
                    if($(this).is("a")){

                        var book = {
                            name: $(this).text(),
                            hadiths: []
                        };

                        vol.books.push(book);
                        var url = website+"/"+$(this).attr("href");
                        saveHadiths(book,url);
                        /!*new Promise(function(next){
                            saveHadiths(book,url,next)
                        }).then(function(){
                            /!*console.log(index);
                            console.log($("tr td#menu-m").children().length-1);*!/
                            if(i == $(this).next("p").children().length-1){
                                itemProcessed++;
                                if(index == $("tr td#menu-m").children().length-1)
                                    finished();
                            }


                        });*!/
                    }
                })
            }
        }

        /!*if(index == $("tr td#menu-m").children().length -1)
            finished();*!/

    });*/

    function saveHadiths(book,url,link_length){
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

            finished();


            /*$("table[width='730']").children().each(function(index){
                if($(this).next().next().find("td").attr("align") == 'justify'){

                    book.hadiths.push({
                        info: $(this).find("td").text(),
                        by: $(this).next("tr").find("td").text(),
                        text: $(this).next("tr").next("tr").find("td").text()
                    });

                    console.log($(this).find("td").text());

                    /!*console.log($(this).find("td").text());
                    console.log($(this).next("tr").find("td").text());
                    console.log($(this).next("tr").next("tr").find("td").text());*!/
                }

                if(index == $("table[width='730']").children().length-1){
                    //next();
                    fs.writeFile("sahih_bukhari.json",JSON.stringify(volumes))
                }

                /!*if(index == $("table[width='730']").children().length-1){
                    itemProcessed++;
                    if(itemProcessed == parent_length)
                        finished();
                }*!/
            })*/
        })
    }

    function finished(){
        /*console.log("done with this");
        console.log(JSON.stringify(volumes));*/
        fs.writeFile("sahih_bukhari.json",JSON.stringify(volumes),function(err){
            if(err) return console.log(err);
        });

        /*request("http://www.sahih-bukhari.com/Pages/Bukhari_1_01.php",function(err,res,html){
            var $ = cheerio.load(html);
            $("table[width='730']").children().each(function(index){
                if($(this).find("td").attr("valign") == 'middle'){
                    console.log($(this).find("td").text());
                    console.log($(this).next("tr").find("td").text());
                    console.log($(this).next("tr").next("tr").find("td").text());
                }
            })
        })*/

        console.log("done");
    }

    /*$("tr td#menu-m").children().each(function(){

        var vol = {};

        if($(this).attr("align") == 'left'){
            if($(this).is("div"))
                /!*console.log($(this).find("strong").text());*!/
                vol.name = $(this).find("strong").text();
            else if($(this).is("p"))
                $(this).children().each(function(){
                    console.log($(this).text());
                })
        }
    });*/

    /*$("table[align='center']").children().each(function(){
        //console.log($(this).find("tr td#menu-m").html());
        console.log("hello");

        $(this).find("tr td#menu-m").children().each(function(){
            if($(this).attr("align") == 'left'){
                if($(this).is("div")){}
                    //console.log($(this).find("strong").text());
            }
        })
    })*/
});