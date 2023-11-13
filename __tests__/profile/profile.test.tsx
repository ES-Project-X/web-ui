import { render, screen } from "@testing-library/react";
import Page from "../../app/profile/page";

describe("Profile", () => {
    it("renders a heading", () => {
        render(<Page />);

        expect(screen.getByText("Modify Profile")).toBeInTheDocument();
    });
});

