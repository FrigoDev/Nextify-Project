import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import Dropdown from ".";

it("test_dropdown_renders_with_options_and_selected_option", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];
  const onSelect = vi.fn();
  const isOpen = true;
  const onClose = vi.fn();
  const children = <div>Test Children</div>;
  const { getByText } = render(
    <Dropdown
      options={options}
      onSelect={onSelect}
      isOpen={isOpen}
      onClose={onClose}
    >
      {children}
    </Dropdown>
  );
  expect(getByText("Option 1"));
  expect(getByText("Test Children"));
});

it("test_user_selects_option_and_on_select_function_is_called", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];
  const onSelect = vi.fn();
  const isOpen = true;
  const onClose = vi.fn();
  render(
    <Dropdown
      options={options}
      onSelect={onSelect}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
  fireEvent.click(screen.getAllByText("Option 1")[1]);
  vi.spyOn(onSelect, "call");
  expect(onSelect).toBeCalledWith({ value: "option1", label: "Option 1" });
});

it("test_dropdown_closes_on_outside_click", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];
  const onSelect = vi.fn();
  const isOpen = true;
  const onClose = vi.fn();
  render(
    <Dropdown
      options={options}
      onSelect={onSelect}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
  fireEvent.click(document);
  vi.spyOn(onClose, "call");
  expect(onClose).toBeCalled();
});
