const axios = require("axios");
const puppeteer = require("puppeteer");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { ArgumentParser } = require("argparse");
const fs = require("fs");
require("colors");

const banner = `
██     ██ ██   ██  █████  ████████     ██████   ██████  ████████ 
██     ██ ██   ██ ██   ██    ██        ██   ██ ██    ██    ██    
██  █  ██ ███████ ███████    ██        ██████  ██    ██    ██    
██ ███ ██ ██   ██ ██   ██    ██        ██   ██ ██    ██    ██    
 ███ ███  ██   ██ ██   ██    ██        ██████   ██████     ██    

`;

//configuração para passar parametros por cli
const parser = ArgumentParser({description: "parameters example"});
parser.add_argument("-n", "--number",  { help: "whatsapp number" });
var argNumber = parser.parse_args().number;

//msg enviada para os numeros
var message = `
Óla entre em contato com o email abaixo
para fazer parte de ....................

dasilvacarlosalberto344@gmail.com
`

class bot {
    constructor(number="") {
        this.number = number;
        console.clear();
        console.log(banner.green);
    }

    //verifica se existe a lista com numeros
    checkFile() {
        fs.readFile("numbers.txt", { encoding: "utf-8" }, err => {
            if(err) {
                console.log("[-] lista de telefones não encontrada".red);
                process.exit(1);
            }
        } );
    }

    //verifica se esta com internet
    async checkNet() {
        try {
            let res = await axios.get("https://google.com"); 
        } catch (err) {
            console.log("[-] internet OFF".red);
            process.exit(1);
        }
    }

    //manda mensagems para numeros da lista ou passado por parametro
    async start() {
        this.checkNet();
        let browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            headless: false,
        });
        let page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64; rv:104.0) Gecko/20100101 Firefox/104.0");
        await page.setExtraHTTPHeaders({'accept-language': 'en-US,en;q=0.9,hy;q=0.8'});
        await page.setViewport({ width: 1006, height: 550 });
        await page.goto("https://web.whatsapp.com");   
        await page.waitForNavigation();
        if(this.number !== "") {
            try {
                await page.goto(`http://web.whatsapp.com/send?phone=${this.number}&text=${message}`);
                await delay(7000); 
                await page.click("span[data-testid='send']");
                console.log(`[+] msg >>> ${this.number}`.green);
                await delay(2000);
                await browser.close();
            } catch (err) {
                console.log(`[-] msg >>> ${this.number}`.red);
            }
        } else {
            this.checkFile();
            let numbersFile = fs.readFileSync("numbers.txt", { encoding: "utf-8" });
            for (let num of numbersFile.split(/\r?\n/)) {
                try {
                    await page.goto(`http://web.whatsapp.com/send?phone=${num}&text=${message}`);
                    await delay(7000); 
                    await page.click("span[data-testid='send']");
                    console.log(`[+] msg >>> ${num}`.green);
                    await delay(2000); 
                } catch (err) {
                    console.log(`[-] msg >>> ${num}`.red);
                }
            }
            await browser.close();
        }
    }
}

const delay = (time) => {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

new bot(argNumber).start();
