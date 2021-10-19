
/*
    Author: Carlos Field-Sierra
    Desc:
*/
import puppeteer from "puppeteer"
import User from "./User.js";

export default class School{

    constructor(orgId){
        this.urlPath =   `https://scholar.google.com/citations?view_op=view_org&hl=en&org=${orgId}`;
        this.orgId = orgId;
        this.page = null;
        this.json ={
            faculty:[],
            totalCitations:0,
            averageCitations:0,
        }
    }
    async run(){
        // <== Set up browser ==>
        const browser  = await puppeteer.launch({headless:true, defaultViewport:null,});
        const page = await browser.newPage();
        this.page = page;
        await page.goto(this.urlPath,{waitUntil:"networkidle0"});
        // Scrape
        let  pagesOver = await this.pagesOver();
        while (!pagesOver){
            try {
                await this.getNextPage();
            } catch (err){
                console.log(`Error at School.js at getNextPage()`)
                console.log(err)
            }
            try {
                await this.getFacultyOnPage();
            } catch (err){
                console.log("Error at School.js at getFacultyOnPage()")
                console.log(err)
            }
            pagesOver = await this.pagesOver();
        }
        
    }

    getUserId(link){
        const urlParameterForCitationId = 'user';
        const urlParams = new URLSearchParams(link);
        const userId = urlParams.get(urlParameterForCitationId);
        return userId;
    }
    async getFacultyOnPage(){
        // <== Html selectors ==>
        const scholarLinksClassName = ".gs_ai_name a";
        // <== Logic ==>
        const page = this.page;
        const hrefs = await page.$$eval(scholarLinksClassName, links => links.map(a => a.href));
        const userIds = hrefs.map(link=>{return this.getUserId(link)});
        // <== Store Data ==>
        const getFaucltyData = async (userId)=>{
            const user =new  User(userId);
            await user.run();
            return user.json;
        }
        const userObjs = userIds.slice(8,10).map(userId=>{return getFaucltyData(userId)})
        const userJsonLst= await Promise.all(userObjs).catch(e=>console.log(e));
        
        this.json.faculty= this.json.faculty.concat(userJsonLst)

    }
    // Random wait between 0 and 5 seconds
    async wait(){
        const wateTime = Math.floor(Math.random()*5000);
        await this.page.waitFor(wateTime);
    }

    async getNextPage(){
        //<== Html selectors ==>
        const nextPageBtnClassName = ".gs_btnPR.gs_in_ib.gs_btn_half.gs_btn_lsb.gs_btn_srt.gsc_pgn_pnx";
        // <== Logic ==>
        const page = this.page;
        await page.click(nextPageBtnClassName);
        await this.wait();
    }

    async pagesOver(){
         //<== Html selectors ==>
         const nextPageBtnClassName = ".gs_btnPR.gs_in_ib.gs_btn_half.gs_btn_lsb.gs_btn_srt.gsc_pgn_pnx";
         // <== Logic ==>
         const page= this.page;
         const isDisabled = await page.$eval(nextPageBtnClassName, (button) => {
            return button.disabled;
         });
        return isDisabled;
    }


}