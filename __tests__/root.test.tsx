import { render, screen } from "@testing-library/react";
import RootPage from "../app/page";
import { redirect } from "next/navigation";

// Simula a função de redirecionamento
jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));
describe("Home", () => {
    it("renders a heading", () => {
        render(<RootPage />);

        expect(redirect).toHaveBeenCalledWith("/map");
    });
});