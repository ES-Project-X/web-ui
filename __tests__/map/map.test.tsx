import {Builder, By, Capabilities, until} from "selenium-webdriver"
import chrome from "selenium-webdriver/chrome"
import chromedriver from "chromedriver"

describe("MapPage", () => {

    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build())

    const URL = "http://localhost:3000/map"
    const driver = new Builder()
        .withCapabilities(Capabilities.chrome())
        .setChromeOptions(new chrome.Options().headless())
        .build();

    describe("Rotation", () => {

        beforeEach(async () => {
            await driver.get(URL)
            await driver.wait(until.elementLocated(By.id("map-container")), 10000)
        }, 30000)

        afterAll(async () => {
            await driver.quit()
        })

        it("Rotate map to the right", async () => {
            const pane = await driver.findElement({className: "leaflet-rotate-pane"})
            let paneStyle = await pane.getAttribute("style")
            expect(paneStyle).toBe("transform: translate3d(0px, 0px, 0px);")

            const rightBtn = await driver.findElement({id: "map-rotate-right-btn"})
            await rightBtn.click()

            paneStyle = await pane.getAttribute("style")
            expect(paneStyle).toContain("rotate(0.174533rad);")
        })

        it("Rotate map to the left", async () => {
            const pane = await driver.findElement({className: "leaflet-rotate-pane"})
            let paneStyle = await pane.getAttribute("style")
            expect(paneStyle).toBe("transform: translate3d(0px, 0px, 0px);")

            const leftBtn = await driver.findElement({id: "map-rotate-left-btn"})
            await leftBtn.click()

            paneStyle = await pane.getAttribute("style")
            expect(paneStyle).toContain("rotate(6.10865rad);")
        })

        it('Search for location', async ()=> {
            const searchBar = await driver.findElement({id: "search-bar"})
            await searchBar.sendKeys("Viseu")
            await searchBar.sendKeys("\n")

            await driver.wait(until.elementIsVisible(await driver.findElement({id: "location-text"})), 10000)

            const locationText = await driver.findElement({id: "location-text"})
            const locationTextValue = await locationText.getText()
            expect(locationTextValue).toBe("Viseu, Portugal")

            //check if style is not none
            const cardInfo = await driver.findElement({id: "card-info"})
            const cardInfoStyle = await cardInfo.getAttribute("style")
            expect(cardInfoStyle).toBe("z-index: 1; bottom: 3em; right: 20em; position: absolute; display: block;")

            //click card button
            const cardBtn = await driver.findElement({id: "card-btn"})
            await cardBtn.click()
            const cardInfoStyle2 = await cardInfo.getAttribute("style")
            expect(cardInfoStyle2).toBe("z-index: 1; bottom: 3em; right: 20em; position: absolute; display: none;")
        },20000)

        it('Search for coordinates', async () => {
            const searchBar = await driver.findElement({id: "search-bar"})
            await searchBar.sendKeys("40.65695,-7.91463")
            await searchBar.sendKeys("\n")

            await driver.wait(until.elementIsVisible(await driver.findElement({id: "location-text"})), 10000)

            const locationText = await driver.findElement({id: "location-text"})
            const locationTextValue = await locationText.getText()
            expect(locationTextValue).toBe("Praça da República, 3510-105 Viseu, Portugal")

            //check if style is not none
            const cardInfo = await driver.findElement({id: "card-info"})
            const cardInfoStyle = await cardInfo.getAttribute("style")
            expect(cardInfoStyle).toBe("z-index: 1; bottom: 3em; right: 20em; position: absolute; display: block;")

            //click card button
            const cardBtn = await driver.findElement({id: "card-btn"})
            await cardBtn.click()
            const cardInfoStyle2 = await cardInfo.getAttribute("style")
            expect(cardInfoStyle2).toBe("z-index: 1; bottom: 3em; right: 20em; position: absolute; display: none;")
        });
    })
})