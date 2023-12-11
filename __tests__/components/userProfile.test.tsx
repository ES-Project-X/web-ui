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

  test.skip("renders UserProfile component", () => {
    // Check if the component renders without crashing
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  
});


