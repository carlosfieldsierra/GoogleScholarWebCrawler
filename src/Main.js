/*
    Author: Carlos Field-Sierra
    Desc:  
*/
// Framework that helps web scrape
import puppeteer from "puppeteer-extra"

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
puppeteer.use(StealthPlugin())

// fs helps read and write files
import fs from "fs"

// Carlos's Classes
import User from "../Classes/User.js"
import Paper from "../Classes/Paper.js"
import School from "../Classes/School.js"

// Supress deprecated warnings
console.warn = () => {};


const writeToJson = async (err, data) => {
    var userKeyIds= data.split("\n");
    for (var i in userKeyIds){
        const id = userKeyIds[i];
        console.log(`Starting ${i}`)
        const user = new User(id);
        await user.run();
        const data = JSON.stringify(user.json);
        fs.writeFile(`./Fixes/User-${id}.json`,data,(err)=>{
                if (err){
                    console.log(err)
                }
        })
    }



}

async function Main(){
    // Writes file to json
    fs.readFile("ExtraFiles/users100Publication.txt", 'utf8' ,writeToJson)

}

Main();