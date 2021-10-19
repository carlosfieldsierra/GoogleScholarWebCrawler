/*
    Author: Carlos Field-Sierra
    Desc:
*/

// TODO
// To set user agent
// await button.evaluate(b => b.click());
// https://stackoverflow.com/questions/51857070/puppeteer-in-nodejs-reports-error-node-is-either-not-visible-or-not-an-htmlele
//


// Imports
import puppeteer from "puppeteer-extra"
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
puppeteer.use(StealthPlugin())

// // Add adblocker plugin to block all ads and trackers (saves bandwidth)
// import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }))


import Paper from "./Paper.js"

export default class User{
    
    constructor(userId){
        this.userId = userId;
        this.urlPath = `https://scholar.google.com/citations?hl=en&user=${userId}`;
        this.page = null;
        this.json = {
            userId,
            urlPath:this.urlPath,
        }
    }
    
    // Random wait between 0 and 5 seconds
    async wait(){
        const wateTime = Math.floor(Math.random()*5000);
        await this.page.waitFor(wateTime);
    }

    // Run the scraping for user
    async run(){
        // <== Set up browser ==>
        const browser  = await puppeteer.launch({headless:false, defaultViewport:null,

        });
        const page = await browser.newPage();
        this.page = page;
        await page.goto(this.urlPath,{waitUntil:"networkidle0"});


        // const orgId = await this.getUsersOrgId().catch(e=>console.log(e));
        // <== Scrape the info ==>
        try{

            await this.getCitationHistory(); // Get citationsHistory
        } catch(err){
            // <== Keep track that this part failed ==>
            console.log(`\x1b[1m\x1b[31m\x1b[43m%s${"\x1b[0m"}`,`ERROR: ${"getCitationHistory"} error with ${this.urlPath}`)
            console.log(`\x1b[1m\x1b[41m\x1b[37m%s${"\x1b[0m"}`,err)
        }

        try{
            await this.getBasicInfo();  // Get basic Info

        } catch(err){
            // <== Keep track that this part failed ==>
            console.log(`${"getBasicInfo"} error with ${this.urlPath}`)
            console.log(err)
        }

        try{

            await this.getResearchIntrests(); // Get research intrest
        } catch(err){
            // <== Keep track that this part failed ==>
            console.log(`${"getResearchIntrests"} error with ${this.urlPath}`)
            console.log(err)
        }

        try{

            await this.getFullNameAndDesignation(); //  Gets full name and designation
        } catch(err){
            // <== Keep track that this part failed ==>
            console.log(`${"getFullNameAndDesignation"} error with ${this.urlPath}`)
            console.log(err)
        }

        // gets all papers to show
        try{

            await this.getAllPapersToShow(); // Gets all papers to show by pressing the show more button
        } catch(err){
            // <== Keep track that this part failed ==>
            console.log(`${"getAllPapersToShow"} error with ${this.urlPath}`)
            console.log(err)
            
        }


        // Gets all the papers json information
        try{
            await this.getAllPapers() 
        } catch(err){
            // <== Keep track that this part failed ==>
            console.log(`${"getAllPapers"} error with ${this.urlPath}`)
            console.log(err)
        }

        try{

            await this.getCoAuthors();
        } catch(err){
            console.log(`${"getCoAuthors"} error with ${this.urlPath}`)
            console.log(err)
        }


    
        console.log("DONE")
    }

    async getUsersOrgId(){
        //<== Html selectors ==>
        const linkToShcoolClassName = ".gsc_prf_ila";
        // <== Logic ==>
        const page = this.page;
        let orgId = null;
        const hrefs = await page.$$eval(linkToShcoolClassName, links => links.map(a => a.href));
        const href = hrefs[0];
        const urlParams = new URLSearchParams(href);
        orgId = urlParams.get("org");

        return orgId;
    }
    
    // Gets the citations history
    async  getCitationHistory(){
        //<== Html selectors ==>
        const openCitationHistortBtnId = '#gsc_hist_opn';
        const closeCitationHistortBtnId = "#gsc_md_hist-x"

        const citationsClassName = '.gsc_g_al';
        const citationsDateClassName = '.gsc_g_t';

        // <== Logic ==>

        // Opens page
        const page = this.page;

        await page.click(openCitationHistortBtnId);
    
        // Get citations and date
        const citations = await page.$$eval(citationsClassName, (options) =>
          options.map((option) => option.textContent
        ));
        const dates = await page.$$eval(citationsDateClassName, (options) =>
            options.map((option) => option.textContent)
        )
        // Wait a bit
        this.wait();
        // close
        await page.click(closeCitationHistortBtnId);     

        // <== Set data to json ==>
        this.json.yearscitation = [];
        for (var i in citations){
            const date = dates[i];
            this.json.yearscitation.push(
                {
                    [date]:citations[i],
                }
            )
        }
    }

    // Gets Citations & h-index & i10-index
    async getBasicInfo(){
         //<== Html selectors ==>
        const basicInfoTableNameClassName = ".gsc_rsb_sc1";
        const basicInfoTableDataClassName = ".gsc_rsb_std";

        // <== Logic ==>
        const page = this.page;
        // const infoNames = await page.$$eval(basicInfoTableNameClassName, (options) =>
        //   options.map((option) => option.textContent
        // ));
        const infoData = await page.$$eval(basicInfoTableDataClassName, (options) =>
            options.map((option) => option.textContent
        ));

        // <== Set data to json ==>
        try {
            this.json.citationsall = infoData[0]
            this.json.citationslastfiveyear = infoData[1];
            this.json.hindexall = infoData[2];
            this.json.hindexlastfiveyears = infoData[3];
            this.json.itenindexall = infoData[4];
            this.json.i10indexlastfiveyears = infoData[5];
        }
        catch{
            // <== Let it be know that this part failed in getting basicInfo for this user id
        }
        
        
    }

    // Gets research intrest
    async getResearchIntrests(){
        //<== Html selectors ==>
        const researchIntrestClassName = ".gsc_prf_inta.gs_ibl";

        // <== Logic ==>

        const page = this.page;
        // Get citations and date
        const researchIntrestLst = await page.$$eval(researchIntrestClassName, (options) =>
            options.map((option) => option.textContent
        ));

        // <== Set data to json ==>
        this.json.researchinterest = researchIntrestLst;
    } 

    // Gets full name and designation
    async getFullNameAndDesignation(){
        // <== Html selectors ==>
        const fullNameId = "#gsc_prf_in";
        const desginationDivClassName = ".gsc_prf_il";
        // <== Logic ==>
        const page = this.page;


        // gets full name
        const fullNameLst = await page.$$eval(fullNameId, (options) =>
            options.map((option) => option.textContent
        ));
        // gets the desigination
        const desginationDivLst = await page.$$eval(desginationDivClassName, (options) =>
            options.map((option) => option.textContent
        ));


        // <== Set data to json ==>

        // Put name to json
        try{ 
            this.json.fullname = fullNameLst[0];
        } catch{
            // <== let it be know that it failed ==>
        }

        // Put designation to json
        try{ 
            this.json.designation = desginationDivLst[0];
        } catch{
            // <== let it be know that it failed ==>
        }
    }

    // Opens up all the papers by keep pressing the show more button 
    async getAllPapersToShow(){
        //<== Html selectors ==>
        const showMoreBtnId = "#gsc_bpf_more";

        // <== Logic ==>
        const page = this.page;
        let isDisabled = await page.$eval(showMoreBtnId, (button) => {
            return button.disabled;
        });

        while (!isDisabled){
            isDisabled = await page.$eval(showMoreBtnId, (button) => {
                return button.disabled;
            });

            await page.click(showMoreBtnId);
            await this.wait();

        }

    }

    // Gets information about all the papers 
    async getAllPapers(){
        //<== Html selectors ==>
        const paperLinksClassName = ".gsc_a_at";
        const citedByClassName = ".gsc_a_ac.gs_ibl";
        const citedByYearClassName = ".gsc_a_h.gsc_a_hc.gs_ibl"
        
        // <== Logic ==>
        const page = this.page;


        // Gets all the total citiations and dates on the users page
        const citedByValLst = await page.$$eval(citedByClassName, (options) =>
            options.map((option) => option.textContent
        ));
        const citedByYearLst = await page.$$eval(citedByYearClassName, (options) =>
            options.map((option) => option.textContent
        ));

        
        // <== Set data to json ==>

        // Visit all the papers as links
        const hrefs = await page.$$eval(paperLinksClassName, links => links.map(a => a.href));
        
        // <---- parellel get papers --->
        /*
        This ways much faster but could lead to overload
        and crashes
        */
        this.json.papers = []
        const  getPaperData = async (href,idx)=>{
            const paper = new Paper(this.userId,href);
            await this.wait();
            await paper.run();
            paper.json.totalCitation = citedByValLst[idx];
            paper.json.year = citedByYearLst[idx];
            return paper.json
        }
    
        // does it in batches of 5 in parellel
        for (var i=0;hrefs.length-5>i;i+=5){
            
            const paperObjs = hrefs.slice(i,i+5).map((href,idx)=>{return getPaperData(href,idx)})
            const papersJson= await Promise.all(paperObjs).catch(e=>ç(e));
            
            this.json.papers= this.json.papers.concat(papersJson)
        }
        /* 
            If length of papers array of links 
            is less than 5, then gets the extra papers
            skipped at the end
        */
        const leftIdx = hrefs.length%5;
        const paperObjs = hrefs.slice(hrefs.length-leftIdx,hrefs.length).map((href,idx)=>{return getPaperData(href,idx)})
        const papersJson= await Promise.all(paperObjs).catch(e=>console.log(e));
        this.json.papers = this.json.papers.concat(papersJson)
        
        

        /*
        <====== Itervailey get papers ======>
        This ways very very very slow, but reliable
        */
        //    var start = new Date();

        //     this.json.papers = [];
        //     for (var i in hrefs){
        //         const href = hrefs[i];
        //         const paper = new Paper(this.userId,href);
        //         await paper.run();
        //         /* 
        //             This is setting the paper.json
        //             with the total citation and year 
        //             based on the list from the user page
        //         */
        //         paper.json.totalCitation = citedByValLst[i];
        //         paper.json.year = citedByYearLst[i];
        //         // -----------
        //         this.json.papers.push(
        //             paper.json
        //         )
        //     }  
            
        //     var finish = new Date();
        //     var difference = new Date();
        //     difference.setTime(finish.getTime() - start.getTime());
        //     console.log( "TIME TOOK-->",difference.getMilliseconds() )
        //     //-----
    }

    // getsUserId from link
    getUserId(link){
        const urlParameterForCitationId = 'user';
        const urlParams = new URLSearchParams(link);
        const userId = urlParams.get(urlParameterForCitationId);
        return userId;
    }
    // Gets the coAuthors
    async getCoAuthors(){
        // <== Html selectors ==>
        const coAuthorOpenIdName = "#gsc_coauth_opn";
        const exitCoAuthorIdName = "#gsc_md_cod-x";
        const coAuthorsLinkClassName = ".gs_ai_name a"
        // <== Logic ==>
        const page = this.page
   
        await page.click(coAuthorOpenIdName); // Open page 
        await this.wait();

        // get all links to coAuthors
        const hrefs = await page.$$eval(coAuthorsLinkClassName, links => links.map(a => a.href));
        const userIdsList = hrefs.map(link=>{ return this.getUserId(link)})
        // <== Set data to json ==>
        this.json.coAuthors = userIdsList;

        await page.click(exitCoAuthorIdName); // Close page
        

    }

}



