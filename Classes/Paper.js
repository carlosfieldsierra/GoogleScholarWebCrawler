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


export default class Paper{
    constructor(userId,link){
        this.page = null;
        this.userId=userId;
        this.link = link;
        this.citationId = this.getCitationId(link);
        this.json = {
            userId,
            link,
            citationId:this.citationId,
        }
    }
     /*
     Things to collect:
        - Publisher
        - Total citations
        - Publication date
        - Authors
        - Citation History
        - Conference
        - PDF link
        - Journal
        - Source
     */


    async run(){  
        // <== Set up ==>
        const browser  = await puppeteer.launch({headless:true, defaultViewport:null,});
        const page = await browser.newPage();
        this.page = page;
        await page.goto(this.link,{waitUntil:"networkidle0"});
        
        // <== Scrape ==>
        
        // gets basic info about paper
        try {
            await this.getBasicInfo(); 
        } catch{
            // let it be known that it failed
        }

        // gets citation history of paper
        try {
            await this.getCitationHistory(); 
        } catch{
           // let it be known that it failed
        }


        // <== Close ==>
        browser.close();

    }


    /**
      Gets the info below,
      
      "Authors",
      "Publication date",
      "Journal",
      "Volume",
      "Issue",
      "Pages",
      "Publisher",
      "Scholar articles",
     */
    async getBasicInfo(){
        //<== Html selectors ==>
        const fieldNameClassName = ".gsc_oci_field";
        const valueClassName = ".gsc_oci_value";

        // <== Logic ==>

        // get fields 
        const page = this.page;
        const fieldNameLst = await page.$$eval(fieldNameClassName, (options) =>
            options.map((option) => option.textContent
        ));
        const valueLst = await page.$$eval(valueClassName, (options) =>
            options.map((option) => option.textContent
        ));
        

        // <== Set data to json ==>
        for (var i in fieldNameLst){
            const fieldName = fieldNameLst[i];
            if (fieldName==="Description"){
                continue
            }
            if (fieldName=="Total citations"){
                continue
            }
            const value = valueLst[i];
            this.json[fieldName] = value
        }
        

    }


    /**
     * Gets the citation history
     */
    async getCitationHistory(){
        //<== Html selectors ==>
        const citationDateClassName = ".gsc_oci_g_t";
        const citationValClassName = ".gsc_oci_g_a";
        // <== Logic ==>

        const page = this.page;
        const datesLst = await page.$$eval(citationDateClassName, (options) =>
            options.map((option) => option.textContent
        ));
        const valLst = await page.$$eval(citationValClassName, (options) =>
            options.map((option) => option.textContent
        ));

        this.json.yearscitation = [];
        var totalCitations = 0
        for (var i in valLst){
            const date = datesLst[i];
            totalCitations+= parseInt(valLst[i], 10)
            this.json.yearscitation.push(
                {
                    [date]:valLst[i],
                }
            )
        }
        this.json.totalCitations = totalCitations

    }
   

  /**
   *  Every paper has its own paperId,
   *  this function gets it's from the url
   */
    getCitationId(link){
        const urlParameterForCitationId = 'citation_for_view';
        const urlParams = new URLSearchParams(link);
        const citationId = urlParams.get(urlParameterForCitationId);
        return citationId;
    }

}