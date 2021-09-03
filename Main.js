// Imports
const puppeteer = require("puppeteer");
const fs = require('fs');

// Carlos's Classes
const User = require("./Classes/User") 
const Paper = require("./Classes/Paper");

// https://www.freecodecamp.org/news/promise-all-in-javascript-with-example-6c8c5aea3e32/

async function Main(){
    // const users = ["-GK79FcAAAAJ","P21gHIkAAAAJ","GAxnMe0AAAAJ","XP-jixMAAAAJ"]
    // const users=["XP-jixMAAAAJ","EH2LUukAAAAJ"];
    const users= ["XP-jixMAAAAJ"]
    for (var i in users){
        const id = users[i];
        const user = new User(id)
        await user.run();

        const data = JSON.stringify(user.json);
        fs.writeFile("user.json",data,(err)=>{
            if (err){
                throw err
            }
        })
    }
    // const paper = new Paper(users[0],'https://scholar.google.com/citations?view_op=view_citation&hl=en&user=XP-jixMAAAAJ&citation_for_view=XP-jixMAAAAJ:kzcrU_BdoSEC')
    // await paper.run()
   
}

Main();