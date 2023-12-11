import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RegisterUserModal from "../../app/components/RegisterUserModal";

const mockOnClose = jest.fn();
const mockOnRegisterUser = jest.fn();
const mockHandleKeyDown = jest.fn();

const defaultProps = {
  onClose: mockOnClose,
  onRegisterUser: mockOnRegisterUser,
  handleKeyDown: mockHandleKeyDown,
};

// Helper function to render the RegisterUserModal component with custom props
const renderRegisterUserModal = (props) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<RegisterUserModal {...mergedProps} />);
};

describe.skip("RegisterUserModal", () => {
  it("renders the RegisterUserModal component", () => {
    renderRegisterUserModal();
    expect(screen.getByText("Username:")).toBeInTheDocument();
  });

  it("triggers onRegisterUser when the 'Register User' button is clicked", () => {
    renderRegisterUserModal();
    const registerButton = screen.getByText("Register User");

    fireEvent.click(registerButton);

    expect(mockOnRegisterUser).toHaveBeenCalled();
  });

  it("triggers onClose when the 'Close' button is clicked", () => {
    renderRegisterUserModal();
    const closeButton = screen.getByText("Close");

    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
 
  it("handles onKeyDown event for the 'Register User' button", () => {
    renderRegisterUserModal();
    const registerButton = screen.getByText("Register User");

    fireEvent.keyDown(registerButton, { key: "Enter" });

    expect(mockHandleKeyDown).toHaveBeenCalled();
  });

  it("handles user input changes", () => {
    renderRegisterUserModal();
    const usernameInput = screen.getByLabelText("Username:");

    fireEvent.change(usernameInput, { target: { value: "testUser" } });

    expect(usernameInput.value).toBe("testUser");
  }); /**/
  

  // Add more tests as needed to cover the specific functionality of your component
});
