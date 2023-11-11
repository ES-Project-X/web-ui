import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CreatePOIModal from "../../app/components/CreatePOIModal"

const mockLatitude = 12.345;
const mockLongitude = 67.890;

const mockOnClose = jest.fn();
const mockOnCreatePOI = jest.fn();
const mockHandleKeyDown = jest.fn();

const defaultProps = {
  latitude: mockLatitude,
  longitude: mockLongitude,
  onClose: mockOnClose,
  onCreatePOI: mockOnCreatePOI,
  handleKeyDown: mockHandleKeyDown,
};

// Helper function to render the CreatePOIModal component with custom props
const renderCreatePOIModal = (props) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<CreatePOIModal {...mergedProps} />);
};

describe("CreatePOIModal", () => {

  it("triggers onCreatePOI when the 'Save POI' button is clicked", () => {
    const saveButton = screen.getByText("Create POI");
    
    fireEvent.click(saveButton);
    
    expect(mockOnCreatePOI).toHaveBeenCalled();
  });

  it("triggers onClose when the 'Close' button is clicked", () => {
    const closeButton = screen.getByText("Close");
    
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it("handles onKeyDown event", () => {
    const saveButton = screen.getByText("Create POI");

    fireEvent.keyDown(saveButton, { key: "Enter" });
    
    expect(mockHandleKeyDown).toHaveBeenCalled();
  });
});
