// To set user agent
// 
const puppeteer = require("puppeteer")
const Paper = require("./Paper") 


module.exports = class User{
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
        const browser  = await puppeteer.launch({headless:true, defaultViewport:null,});
        const page = await browser.newPage();
        this.page = page;
        await page.goto(this.urlPath,{waitUntil:"networkidle0"});

        // <== Scrape the info ==>
        try{

            await this.getCitationHistory(); // Get citationsHistory
        } catch{
            // <== Keep track that this part failed ==>
        }

        try{
            await this.getBasicInfo();  // Get basic Info

        } catch{
            // <== Keep track that this part failed ==>
        }

        try{

            await this.getResearchIntrests(); // Get research intrest
        } catch{
            // <== Keep track that this part failed ==>
        }

        try{

            await this.getFullNameAndDesignation(); //  Gets full name and designation
        } catch{
            // <== Keep track that this part failed ==>
        }

        try{

            await this.getAllPapersToShow(); // Gets all papers to show by pressing the show more button
        } catch{
            // <== Keep track that this part failed ==>
        }

        await this.getAllPapers() // Gets all the papers json information

        try{

        } catch{
            // <== Keep track that this part failed ==>
            console.log("error")
        }

        // const url = await page.url();
       
        // console.log(url);
        console.log("DONE")
        // browser.close();
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
        
        // ---- parellel get papers
        /*
        This ways much faster but could lead to overload
        and crashes
        */
    //    var start = new Date();
      

        this.json.papers = []
        const  getPaperData = async (href,idx)=>{
            const paper = new Paper(this.userId,href);
            await paper.run();
            paper.json.totalCitation = citedByValLst[idx];
            paper.json.year = citedByYearLst[idx];
            return paper.json
        }
    
        // does it in batches of 5 in parellel
        for (var i=0;hrefs.length-5>i;i+=5){
            
            const paperObjs = hrefs.slice(i,i+5).map((href,idx)=>{return getPaperData(href,idx)})
            const papersJson= await Promise.all(paperObjs).catch(e=>console.log(e));
            
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


    //     var finish = new Date();
    //     var difference = new Date();
    //     difference.setTime(finish.getTime() - start.getTime());
    //     console.log( "TIME TOOK-->",difference.getMilliseconds() );
        
        //---

        // Itervailey get papers
        /*
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

}



