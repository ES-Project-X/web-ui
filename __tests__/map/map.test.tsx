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
    })
})