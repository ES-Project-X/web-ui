import { render, screen } from "@testing-library/react"
import RootPage from "../app/page"
 
describe("Home", () => {
  it("renders a heading", () => {
    render(<RootPage />)
  })
})