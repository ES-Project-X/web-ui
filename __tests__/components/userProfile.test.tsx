// userProfile.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserProfile from "../../app/components/UserProfile"; // Update the path accordingly
import { UserProps } from "@/app/structs/user";
import "jest-localstorage-mock";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

describe("UserProfile Component", () => {
  const mockUser: UserProps = {
    // Mock user data
    id: 1,
    username: "testUser",
    fname: "John",
    lname: "Doe",
    email: "waaaa.doe@a.com",
    avatar: "https://example.com/avatar.jpg",
  };

  test("renders UserProfile component", () => {
    render(<UserProfile user={mockUser} />);

    // Check if the component renders without crashing
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  test("renders UserProfile component with user data from localStorage", () => {
    // Mock the localStorage getItem method using jest-localstorage-mock
    localStorage.setItem("user", JSON.stringify(mockUser));

    render(<UserProfile user={mockUser} />);

    // Check if the component renders without crashing
    expect(screen.getByDisplayValue("testUser")).toBeInTheDocument();
    expect(screen.getByDisplayValue("waaaa.doe@a.com")).toBeInTheDocument();
  });

  test("calls updateProfile function on button click", () => {
    // Mock the localStorage getItem method using jest-localstorage-mock
    localStorage.setItem("user", JSON.stringify(mockUser));
  
    // Mock the console.log method
    const consoleSpy = jest.spyOn(console, "log");
  
    render(<UserProfile user={mockUser} />);
  
    // Click the "Modify Profile" button to enable editing
    fireEvent.click(screen.getByText("Modify Profile"));
  
    // Change the username
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "newUsername" },
    });
  
    // Click the "Password(Confirm Changes)" button
    fireEvent.click(screen.getByLabelText("Password(Confirm Changes)"));
  
    // Change the password
    fireEvent.change(screen.getByLabelText("Password(Confirm Changes)"), {
      target: { value: "newPassword" },
    });
  
    // Click the "Save Profile" button by id
    fireEvent.click(screen.getByTitle("Save Profile"));
  
    // Check if the updateProfile function is called with the correct parameters
    expect(consoleSpy).toHaveBeenCalledWith("update profile");
    expect(consoleSpy).toHaveBeenCalledWith("user:", mockUser);
    expect(consoleSpy).toHaveBeenCalledWith("userLS:", mockUser);
    // Restore the console.log method
    consoleSpy.mockRestore();
  });

  test("renders UserProfile component without user data from localStorage", () => {
    // Mock the console.log method
    const consoleSpy = jest.spyOn(console, "log");

    render(<UserProfile user={mockUser} />);

    // Click the "Modify Profile" button to enable editing
    fireEvent.click(screen.getByText("Modify Profile"));

    // Check if the "Save Profile" button is present after clicking "Modify Profile"
    expect(screen.getByText("Save Profile")).toBeInTheDocument();

    // Check if the component renders without crashing
    expect(screen.getByDisplayValue("testUser")).toBeInTheDocument();

    // Check if the updateProfile function is called with the correct parameters
    fireEvent.click(screen.getByText("Save Profile"));

    // Assuming your component logs "update profile" to the console
    expect(consoleSpy).toHaveBeenCalledWith("update profile");
    expect(consoleSpy).toHaveBeenCalledWith("username:", "testUser");
    expect(consoleSpy).toHaveBeenCalledWith("email:", "waaaa.doe@a.com");

    // Restore the console.log method
    consoleSpy.mockRestore();
  });

  test("calls updateProfile function on button click without changes", () => {
    // Mock the localStorage getItem method using jest-localstorage-mock
    localStorage.setItem("user", JSON.stringify(mockUser));

    // Mock the console.log method
    const consoleSpy = jest.spyOn(console, "log");

    render(<UserProfile user={mockUser} />);

    fireEvent.click(screen.getByText("Modify Profile"));

    // Click the "Save Profile" button without making any changes
    fireEvent.click(screen.getByTitle("Save Profile"));

    // Check if the updateProfile function is not called
    expect(consoleSpy).toHaveBeenCalledWith("update profile");

    // Restore the console.log method
    consoleSpy.mockRestore();
  });
});


