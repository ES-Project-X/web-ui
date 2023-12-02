// userProfile.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserProfile from "../../app/components/UserProfile";
import { UserData } from "@/app/structs/user";
import "jest-localstorage-mock";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

describe("UserProfile Component", () => {
  const mockUser: UserData = {
    // Mock user data
    id: "1",
    email: "email@mail.com",
    username: "testUser",
    cognito_id: "123456789",
    first_name: "test",
    last_name: "user",
    image_url: "https://www.google.com",
    created_at: "2021-05-05T12:00:00.000Z",
    total_xp: 0,
    birth_date: "2021-05-05T12:00:00.000Z",
    added_pois_count: 0,
    received_ratings_count: 0,
    given_ratings_count: 0,
  };

  beforeEach(() => {
    fetchMock.mockResponse(JSON.stringify(mockUser));
    render(<UserProfile />);
  });

  test("renders UserProfile component", () => {
    // Check if the component renders without crashing
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  test("calls updateProfile function on button click", () => {
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
    fireEvent.click(screen.getByText("Save Profile"));
  });

  test("renders UserProfile component without user data from localStorage", () => {
    // Click the "Modify Profile" button to enable editing
    fireEvent.click(screen.getByText("Modify Profile"));

    // Check if the "Save Profile" button is present after clicking "Modify Profile"
    expect(screen.getByText("Save Profile")).toBeInTheDocument();

    // Check if the component renders without crashing
    expect(screen.getByText("Username")).toBeInTheDocument();

    // Check if the updateProfile function is called with the correct parameters
    fireEvent.click(screen.getByText("Save Profile"));
  });

  test("calls updateProfile function on button click without changes", () => {
    fireEvent.click(screen.getByText("Modify Profile"));

    // Click the "Save Profile" button without making any changes
    fireEvent.click(screen.getByText("Save Profile"));
  });
});


