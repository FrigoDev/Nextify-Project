import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Dropdown from ".";

const options = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
];

describe("Dropdown", () => {
  it("renders options and children when open", () => {
    const { getByText } = render(
      <Dropdown
        options={options}
        onSelect={vi.fn()}
        isOpen
        onClose={vi.fn()}
      >
        <span>children</span>
      </Dropdown>
    );
    expect(getByText("Option 1")).toBeInTheDocument();
    expect(getByText("children")).toBeInTheDocument();
  });

  it("calls onSelect with the chosen option", () => {
    const onSelect = vi.fn();
    render(
      <Dropdown options={options} onSelect={onSelect} isOpen onClose={vi.fn()} />
    );
    fireEvent.click(screen.getByText("Option 1"));
    expect(onSelect).toHaveBeenCalledWith(options[0]);
  });

  it("calls onClose when clicking outside the dropdown", () => {
    const onClose = vi.fn();
    render(
      <div>
        <Dropdown options={options} onSelect={vi.fn()} isOpen onClose={onClose} />
        <div data-testid="outside">outside</div>
      </div>
    );
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(onClose).toHaveBeenCalled();
  });

  it("does not attach a global listener when isOpen is false (no leak)", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(
      <Dropdown options={options} onSelect={vi.fn()} isOpen={false} onClose={vi.fn()} />
    );
    expect(addSpy).not.toHaveBeenCalledWith("mousedown", expect.any(Function));
    unmount();
    removeSpy.mockRestore();
    addSpy.mockRestore();
  });

  it("removes its global listener on unmount", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(
      <Dropdown options={options} onSelect={vi.fn()} isOpen onClose={vi.fn()} />
    );
    const addCalls = addSpy.mock.calls.filter(([type]) => type === "mousedown");
    expect(addCalls.length).toBe(1);
    unmount();
    const removeCalls = removeSpy.mock.calls.filter(([type]) => type === "mousedown");
    expect(removeCalls.length).toBe(1);
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
