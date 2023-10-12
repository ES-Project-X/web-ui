import {Builder, By, Capabilities, until} from "selenium-webdriver"
import chrome from "selenium-webdriver/chrome"
import chromedriver from "chromedriver"

describe("Map", () => {

    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build())

    const URL = "http://localhost:3000/map"
    const driver = new Builder()
        .withCapabilities(Capabilities.chrome())
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
            expect(paneStyle).toBe("transform: translate3d(77.0902px, -75.1449px, 0px) rotate(0.174533rad);")
        })

        it("Rotate map to the left", async () => {
            const pane = await driver.findElement({className: "leaflet-rotate-pane"})
            let paneStyle = await pane.getAttribute("style")
            expect(paneStyle).toBe("transform: translate3d(0px, 0px, 0px);")

            const leftBtn = await driver.findElement({id: "map-rotate-left-btn"})
            await leftBtn.click()

            paneStyle = await pane.getAttribute("style")
            expect(paneStyle).toBe("transform: translate3d(-62.8702px, 87.3898px, 0px) rotate(6.10865rad);")
        })
    })
})