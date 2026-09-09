import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { accountScope } from "@repo/plugin-web-storage";
import { DashHeader } from "../DashHeader.js";
let key: string;
const nativeSet = Storage.prototype.setItem;
beforeEach(() => { accountScope.activate(accountScope.lock("A"), "one"); key = accountScope.physicalKey("xai_pref_dashboard_header_note"); localStorage.setItem(key, "Original"); });
afterEach(() => vi.restoreAllMocks());
function mount() {
 const ui = render(<DashHeader lang="en" now={new Date()}/>);
 const edit = () => fireEvent.click(ui.getByRole("button", { name: "Edit dashboard note" }));
 const input = () => ui.getByRole("textbox") as HTMLInputElement;
 const save = () => fireEvent.click(ui.getByRole("button", { name: "Save dashboard note" }));
 return { ...ui, edit, input, save };
}
describe("Dashboard header persistence recovery", () => {
 it("keeps latest draft on quota, retries it, and warns before unload only while dirty", () => {
  const ui = mount(); ui.edit(); fireEvent.change(ui.input(), { target: { value: "Unsaved" } });
  const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(this: Storage,k,v){if(k===key)throw new DOMException("quota","QuotaExceededError");nativeSet.call(this,k,v);});
  ui.save(); expect(ui.input().value).toBe("Unsaved"); expect(ui.getByRole("alert")).toBeTruthy(); expect(localStorage.getItem(key)).toBe("Original");
  fireEvent.change(ui.input(), {target:{value:"Latest"}});const event = new Event("beforeunload",{cancelable:true}); window.dispatchEvent(event);expect(event.defaultPrevented).toBe(true);
  spy.mockRestore();fireEvent.click(ui.getByText("Retry note save"));expect(localStorage.getItem(key)).toBe("Latest");expect(ui.queryByRole("textbox")).toBeNull();
  const clean = new Event("beforeunload",{cancelable:true});window.dispatchEvent(clean);expect(clean.defaultPrevented).toBe(false);
 });
 it("rejects newer raw data and old-account retry/export", () => {
  const ui=mount();ui.edit();fireEvent.change(ui.input(),{target:{value:"Local draft"}});localStorage.setItem(key,"Newer external");ui.save();expect(localStorage.getItem(key)).toBe("Newer external");expect(ui.input().value).toBe("Local draft");
  act(()=>{accountScope.activate(accountScope.lock("B"),"two");});const b=accountScope.physicalKey("xai_pref_dashboard_header_note");localStorage.setItem(b,"B original");fireEvent.click(ui.getByText("Retry note save"));fireEvent.click(ui.getByText("Export note draft"));expect(ui.getByText("Export failed. Please retry.")).toBeTruthy();expect(localStorage.getItem(b)).toBe("B original");expect(localStorage.getItem(key)).toBe("Newer external");
 });
 it("retains failed clear with its original persistence", () => {
  const ui=mount();const offset="xai_pref_dashboard_header_note_x";const spy=vi.spyOn(Storage.prototype,"setItem").mockImplementation(function(this: Storage,k,v){if(k===key||k===offset)throw new DOMException("quota","QuotaExceededError");nativeSet.call(this,k,v);});
  fireEvent.click(ui.getByRole("button",{name:"Clear dashboard note"}));expect(ui.input().value).toBe("");expect(localStorage.getItem(key)).toBe("Original");spy.mockRestore();fireEvent.click(ui.getByText("Retry note save"));expect(localStorage.getItem(key)).toBe("");
 });
 it("retains latest position on quota and refuses newer device raw on retry", () => {
  const ui=mount();const offset="xai_pref_dashboard_header_note_x";
  const lane=ui.container.querySelector(".dash-note-lane")!;const note=ui.container.querySelector(".dash-note")!;
  Object.defineProperty(lane,"clientWidth",{value:760});Object.defineProperty(note,"offsetWidth",{value:360});
  const spy=vi.spyOn(Storage.prototype,"setItem").mockImplementation(function(this:Storage,k,v){if(k===offset)throw new DOMException("quota","QuotaExceededError");nativeSet.call(this,k,v);});
  fireEvent.pointerDown(note,{button:0,clientX:200,pointerId:1});fireEvent.pointerMove(note,{clientX:260,pointerId:1});fireEvent.pointerMove(note,{clientX:290,pointerId:1});fireEvent.pointerUp(note,{clientX:290,pointerId:1});
  expect(localStorage.getItem(offset)).toBe("0");expect(ui.getByRole("alert")).toBeTruthy();spy.mockRestore();fireEvent.click(ui.getByText("Retry note save"));expect(localStorage.getItem(offset)).toBe("90");
  localStorage.setItem(offset,"100");fireEvent.pointerDown(note,{button:0,clientX:200,pointerId:2});fireEvent.pointerMove(note,{clientX:220,pointerId:2});fireEvent.pointerUp(note,{clientX:220,pointerId:2});fireEvent.click(ui.getByText("Retry note save"));expect(localStorage.getItem(offset)).toBe("100");
 });

});
