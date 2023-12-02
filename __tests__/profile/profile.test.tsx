import { render, screen } from "@testing-library/react";
import Page from "../../app/profile/page";
import { enableFetchMocks } from "jest-fetch-mock";
import { UserData } from "@/app/structs/user";

enableFetchMocks();

describe("Profile", () => {
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
      });

    it("renders a heading", () => {
        render(<Page />);

        expect(screen.getByText("Modify Profile")).toBeInTheDocument();
    });
});

