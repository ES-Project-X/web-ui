import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Sidebar from "../../app/components/Sidebar"; // Import your Sidebar component here

describe("Sidebar", () => {
  it("should clear inputs after searching route", () => {
    // Arrange
    const { container } = render(<Sidebar />);

    // Mock input values
    const originInput = container.querySelector("#origin_input") as HTMLInputElement;
    const destInput = container.querySelector("#dest_input") as HTMLInputElement;

    originInput.value = "Origin Value";
    destInput.value = "Destiny Value";

    // Act
    const searchButton = container.querySelector(".btn");
    fireEvent.click(searchButton);

    // Assert
    expect(originInput.value).toBe("");
    expect(destInput.value).toBe("");
  });

  it("should log the origin and destiny when searching route", () => {
    // Arrange
    const { container } = render(<Sidebar />);

    // Mock input values
    const originInput = container.querySelector("#origin_input") as HTMLInputElement;
    const destInput = container.querySelector("#dest_input") as HTMLInputElement;

    originInput.value = "Origin Value";
    destInput.value = "Destiny Value";

    const consoleLogSpy = jest.spyOn(console, "log");
    consoleLogSpy.mockImplementation(() => {}); // Mock the console.log to prevent actual logging.

    // Act
    const searchButton = container.querySelector(".btn");
    fireEvent.click(searchButton);

    // Assert
    expect(consoleLogSpy).toHaveBeenCalledWith("searching route from origin to destiny");
    expect(consoleLogSpy).toHaveBeenCalledWith("org:", "Origin Value");
    expect(consoleLogSpy).toHaveBeenCalledWith("dest:", "Destiny Value");

    // Clean up
    consoleLogSpy.mockRestore(); // Restore the original console.log
  });
});
