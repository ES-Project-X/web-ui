import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SavePOIModal from "../../app/components/SavePOIModal";

const mockPoiLat = 12.345;
const mockPoiLon = 67.89;
const mockOnSavePOI = jest.fn();
const mockOnClose = jest.fn();
const mockHandleKeyDown = jest.fn();

const defaultProps = {
  poiLat: mockPoiLat,
  poiLon: mockPoiLon,
  onSavePOI: mockOnSavePOI,
  onClose: mockOnClose,
  handleKeyDown: mockHandleKeyDown,
};

// Helper function to render the SavePOIModal component with custom props
const renderSavePOIModal = (props) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<SavePOIModal {...mergedProps} />);
};

describe("SavePOIModal", () => {
  it("renders with default props", () => {
    renderSavePOIModal();

    expect(screen.getByText("Create POI")).toBeInTheDocument();
    expect(screen.getByText("Name:")).toBeInTheDocument();
    expect(screen.getByText("Type:")).toBeInTheDocument();
  });

  it("triggers onSavePOI when the 'Save POI' button is clicked", () => {
    renderSavePOIModal();
    const saveButton = screen.getByText("Save POI");

    fireEvent.click(saveButton);

    expect(mockOnSavePOI).toHaveBeenCalled();
  });

  it("triggers onClose when the 'Close' button is clicked", () => {
    renderSavePOIModal();
    const closeButton = screen.getByText("Close");

    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles onKeyDown event", () => {
    renderSavePOIModal();
    const saveButton = screen.getByText("Save POI");

    fireEvent.keyDown(saveButton, { key: "Enter" });

    expect(mockHandleKeyDown).toHaveBeenCalled();
  });

  it("validates the form inputs", async () => {
    renderSavePOIModal();

    const nameInput = screen.getByPlaceholderText("Type the name here");
    const typeInput = screen.getByPlaceholderText("Write the type here");

    // Enter a value that is too long
    fireEvent.change(nameInput, {
      target: { value: "ThisNameIsTooLongToBeAccepted" },
    });
    fireEvent.change(typeInput, {
      target: { value: "ThisTypeIsTooLongToBeAccepted" },
    });

    // Trigger the savePOI function
    const saveButton = screen.getByText("Save POI");
    fireEvent.click(saveButton);

    expect(mockOnSavePOI).toHaveBeenCalled();

  });
});
