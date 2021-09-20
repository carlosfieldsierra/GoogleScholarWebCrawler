/*
    Author: Carlos Field-Sierra
*/

// Imports
import puppeteer from "puppeteer-extra"
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
puppeteer.use(StealthPlugin())

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))



import fs from "fs"
// Carlos's Classes
import User from "../Classes/User.js"
import Paper from "../Classes/Paper.js"
import School from "../Classes/School.js"
// https://www.freecodecamp.org/news/promise-all-in-javascript-with-example-6c8c5aea3e32/
// if you want cordanition
// zookeeper, spring or microsoft orleans

async function Main(){
    var userKeyIds=[];
    fs.readFile("ExtraFiles/users100Publication.txt", 'utf8' , async (err, data) => {
        userKeyIds= data.split("\n");
       
        userKeyIds.slice(0,1).map(async id=>{
            const user = new User(id);
            await user.run();
            const data = JSON.stringify(user.json);
            console.log(data);
            // fs.writeFile("user.json",data,(err)=>{
            //         if (err){
            //             throw err
            //         }
            //     })
            // }
            
    
        })
    })
      





    // const users = ["-GK79FcAAAAJ","P21gHIkAAAAJ","GAxnMe0AAAAJ","XP-jixMAAAAJ"]
    // const users=["XP-jixMAAAAJ","EH2LUukAAAAJ"];
    // const users= ["XP-jixMAAAAJ"]
    // for (var i in users){
    //     const id = users[i];
    //     const user = new User(id)
    //     await user.run();

    //     const data = JSON.stringify(user.json);
    //     fs.writeFile("user.json",data,(err)=>{
    //         if (err){
    //             throw err
    //         }
    //     })
    // }

}

Main();