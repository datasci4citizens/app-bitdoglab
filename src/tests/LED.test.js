import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LED from "../components/LED";

describe("LED Component", () => {
  it("renders correctly with default props", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <LED id="0-0" selected={false} onPress={onPressMock} />
    );

    // Component should exist
    const ledComponent = getByTestId("led-0-0");
    expect(ledComponent).toBeTruthy();
  });

  it("changes appearance when selected", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <LED id="0-0" selected={true} onPress={onPressMock} />
    );

    const ledComponent = getByTestId("led-0-0");

    // Selected LED should have different style properties
    // These would be checked with proper style extraction in a real test
    expect(ledComponent.props.style).toContainEqual(
      expect.objectContaining({
        borderWidth: 2,
        borderColor: "#FFF",
      })
    );
  });

  it("calls onPress when pressed", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <LED id="0-0" selected={false} onPress={onPressMock} />
    );

    const ledComponent = getByTestId("led-0-0");
    fireEvent.press(ledComponent);

    expect(onPressMock).toHaveBeenCalledWith("0-0");
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("renders with the provided color", () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <LED id="0-0" selected={false} color="#FF0000" onPress={onPressMock} />
    );

    const ledComponent = getByTestId("led-0-0");

    // Check that the LED has the correct background color
    expect(ledComponent.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: "#FF0000",
      })
    );
  });
});
