import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Sidebar from "../../app/components/Sidebar"; // Import your Sidebar component here

describe("Sidebar", () => {

  let component: HTMLElement

  const findById = (id: string) => {
    return component.querySelector(`#${id}`) ?? undefined
  }

  it("test", () => {

    let routes = [{"name":"test","points":[{"latitude":1,"longitude":1}]},{"name":"test2","points":[{"latitude":2,"longitude":2}]}];

    const draw = (url:string) => {
      console.log(url);
    }

    const getRoutes = () => {
      console.log("test");
    }

    // Arrange
    component = render(<Sidebar routes={routes} draw={draw} getRoutes={getRoutes} />).container;

    const testElement = findById("test")
    expect(testElement).toBeDefined()
    fireEvent.click(testElement!)

  });
});
