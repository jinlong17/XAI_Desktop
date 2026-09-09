import React from 'react';
import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { describe, expect, it, afterEach, vi } from 'vitest';
import { accountScope, setPref } from '@repo/plugin-web-storage';
import { onWebEvent } from '@repo/xai-web-event-bus';
import { DashboardModule } from '../DashboardModule.js';
import { useWidgetLayout } from '../internal/useWidgetLayout.js';
import { useWidgetAppearance } from '../internal/useWidgetAppearance.js';
import { useDashOrder } from '../internal/useDashOrder.js';
const widgets=[{id:'alpha',span:'w-stat' as const,render:()=> <div>Alpha body</div>},{id:'bravo',span:'w-stat' as const,render:()=> <div>Bravo body</div>}];
const key=(suffix:string)=>accountScope.physicalKey('xai_pref_'+suffix);
function deny(target:string){const set=Storage.prototype.setItem;return vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===target)throw new DOMException('quota','QuotaExceededError');set.call(this,k,v);});}
afterEach(()=>vi.restoreAllMocks());
describe('Independent Dashboard grid failure business oracles',()=>{
 it('failed layout must not silently publish new dimensions',()=>{
  const physical=key('dashboard_widget_layout'),initial={alpha:{cols:2,minHeight:118}};localStorage.setItem(physical,JSON.stringify(initial));const {result}=renderHook(()=>useWidgetLayout(widgets));deny(physical);act(()=>result.current.setWidgetLayout('alpha',{cols:8,minHeight:300}));expect(localStorage.getItem(physical)).toBe(JSON.stringify(initial));expect(result.current.getLayout('alpha','w-stat')).toEqual(initial.alpha);
 });
 it('failed appearance must not silently publish new color',()=>{
  const physical=key('dashboard_widget_appearance'),initial={alpha:{tone:'clear',alpha:.42}};localStorage.setItem(physical,JSON.stringify(initial));const {result}=renderHook(()=>useWidgetAppearance(widgets));deny(physical);act(()=>result.current.setWidgetAppearance('alpha',{tone:'rose',alpha:.6}));expect(localStorage.getItem(physical)).toBe(JSON.stringify(initial));expect(result.current.getAppearance('alpha')).toEqual(initial.alpha);
 });
 it('failed widget removal keeps widget or provides visible unsaved recovery',()=>{
  setPref('xai_dash_order',['alpha','bravo']);render(<DashboardModule lang="en" widgets={widgets}/>);deny(accountScope.physicalKey('xai_dash_order'));fireEvent.click(document.querySelector('[data-widget-id=bravo] .widget-shell__remove')!);expect(localStorage.getItem(accountScope.physicalKey('xai_dash_order'))).toBe('["alpha","bravo"]');expect(Boolean(document.querySelector('[data-widget-id=bravo]')||document.querySelector('[role=alert]'))).toBe(true);
 });
 it('failed add keeps picker and must not emit widget-added success',()=>{
  HTMLDialogElement.prototype.showModal=function(){this.open=true};HTMLDialogElement.prototype.close=function(){this.open=false};setPref('xai_dash_order',['alpha']);const added:unknown[]=[];const off=onWebEvent('web:dashboard:widget-added',event=>added.push(event));render(<DashboardModule lang="en" widgets={widgets}/>);fireEvent.click(document.querySelector('.dash-add')!);deny(accountScope.physicalKey('xai_dash_order'));fireEvent.click(document.querySelector('.awp-card')!);expect(localStorage.getItem(accountScope.physicalKey('xai_dash_order'))).toBe('["alpha"]');off();expect(added).toHaveLength(0);expect(document.querySelector('dialog')!.open).toBe(true);
 });
 it('layout physical storage notification must refresh rendered saved size',()=>{
  const physical=key('dashboard_widget_layout');localStorage.setItem(physical,JSON.stringify({alpha:{cols:2,minHeight:118}}));const {result}=renderHook(()=>useWidgetLayout(widgets));const newer=JSON.stringify({alpha:{cols:6,minHeight:240}});act(()=>{localStorage.setItem(physical,newer);window.dispatchEvent(new StorageEvent('storage',{key:physical,newValue:newer,storageArea:localStorage}))});expect(result.current.getLayout('alpha','w-stat')).toEqual({cols:6,minHeight:240});
 });
 it('old A layout callback must not seed A map into B',()=>{
  localStorage.setItem(key('dashboard_widget_layout'),JSON.stringify({alpha:{cols:9,minHeight:300}}));const {result}=renderHook(()=>useWidgetLayout(widgets));const old=result.current.setWidgetLayout;act(()=>accountScope.activate(accountScope.lock('B'),'B'));const bKey=key('dashboard_widget_layout'),before=localStorage.getItem(bKey);act(()=>old('bravo',{cols:4,minHeight:200}));expect(localStorage.getItem(bKey)).toBe(before);
 });
 it('a newer external layout entry must survive a local edit of another widget',()=>{
  const physical=key('dashboard_widget_layout');localStorage.setItem(physical,JSON.stringify({alpha:{cols:2,minHeight:118}}));const {result}=renderHook(()=>useWidgetLayout(widgets));localStorage.setItem(physical,JSON.stringify({alpha:{cols:8,minHeight:250}}));act(()=>result.current.setWidgetLayout('bravo',{cols:4,minHeight:200}));expect(JSON.parse(localStorage.getItem(physical)!).alpha).toEqual({cols:8,minHeight:250});
 });
 it('order failure control retains original persisted and rendered order',()=>{
  setPref('xai_dash_order',['alpha','bravo']);const {result}=renderHook(()=>useDashOrder(widgets));deny(accountScope.physicalKey('xai_dash_order'));act(()=>result.current[1](['bravo','alpha']));expect(result.current[0]).toEqual(['alpha','bravo']);expect(localStorage.getItem(accountScope.physicalKey('xai_dash_order'))).toBe('["alpha","bravo"]');
 });
});

describe('Dashboard recovery proposals',()=>{
 it('latest layout proposal retries once while committed view stays unchanged',()=>{
  const physical=key('dashboard_widget_layout');localStorage.setItem(physical,'{}');const {result}=renderHook(()=>useWidgetLayout(widgets));const fault=deny(physical);
  act(()=>{result.current.setWidgetLayout('alpha',{cols:4,minHeight:200})});act(()=>{result.current.setWidgetLayout('alpha',{cols:9,minHeight:320})});
  expect(result.current.getLayout('alpha','w-stat')).toEqual({cols:2,minHeight:118});expect(result.current.recovery.snapshot().draft).toEqual({alpha:{cols:9,minHeight:320}});
  fault.mockRestore();act(()=>{expect(result.current.recovery.retry()).toBe(true)});expect(result.current.getLayout('alpha','w-stat')).toEqual({cols:9,minHeight:320});expect(result.current.recovery.retry()).toBe(false);
 });
 it('appearance latest change and reset are recoverable; old owner export is blocked',()=>{
  const physical=key('dashboard_widget_appearance');localStorage.setItem(physical,JSON.stringify({alpha:{tone:'rose',alpha:.5}}));const {result}=renderHook(()=>useWidgetAppearance(widgets));const fault=deny(physical);
  act(()=>{result.current.setWidgetAppearance('alpha',{tone:'mint',alpha:.6})});act(()=>{result.current.resetWidgetAppearance('alpha')});expect(result.current.getAppearance('alpha')).toEqual({tone:'rose',alpha:.5});expect(result.current.recovery.snapshot().draft).toEqual({});fault.mockRestore();act(()=>{expect(result.current.recovery.retry()).toBe(true)});expect(JSON.parse(localStorage.getItem(physical)!)).toEqual({});
  const old=result.current.setWidgetAppearance;act(()=>accountScope.activate(accountScope.lock('other'),'other'));const target=key('dashboard_widget_appearance');act(()=>old('bravo',{tone:'aqua',alpha:.4}));expect(localStorage.getItem(target)).toBeNull();expect(()=>result.current.recovery.snapshot()).toThrow();
 });
 it('actual add retry emits once only after saving and closes picker; removal retry commits',()=>{
  HTMLDialogElement.prototype.showModal=function(){this.open=true};HTMLDialogElement.prototype.close=function(){this.open=false};setPref('xai_dash_order',['alpha']);const events:unknown[]=[];const off=onWebEvent('web:dashboard:widget-added',event=>events.push(event));render(<DashboardModule lang="en" widgets={widgets}/>);fireEvent.click(document.querySelector('.dash-add')!);const fault=deny(accountScope.physicalKey('xai_dash_order'));fireEvent.click(document.querySelector('.awp-card')!);expect(events).toHaveLength(0);expect(document.querySelector('dialog')!.open).toBe(true);fault.mockRestore();fireEvent.click(document.querySelector('dialog [role=alert] button')!);expect(events).toHaveLength(1);expect(document.querySelector('dialog')!.open).toBe(false);expect(localStorage.getItem(accountScope.physicalKey('xai_dash_order'))).toBe('["alpha","bravo"]');
  const failure=deny(accountScope.physicalKey('xai_dash_order'));fireEvent.click(document.querySelector('[data-widget-id=bravo] .widget-shell__remove')!);expect(document.querySelector('[data-widget-id=bravo]')).toBeTruthy();failure.mockRestore();fireEvent.click(document.querySelector('[role=alert] button')!);expect(document.querySelector('[data-widget-id=bravo]')).toBeNull();expect(events).toHaveLength(1);off();
 });
});

it('failed order reconciliation remains pending and can retry rather than marking it saved',()=>{
  setPref('xai_dash_order',['alpha','unknown']);const fault=deny(accountScope.physicalKey('xai_dash_order'));const {result}=renderHook(()=>useDashOrder(widgets));expect(result.current[0]).toEqual(['alpha']);expect(result.current.recovery.error).toBeTruthy();expect(localStorage.getItem(accountScope.physicalKey('xai_dash_order'))).toBe('["alpha","unknown"]');fault.mockRestore();act(()=>{expect(result.current.recovery.retry()).toBe(true)});expect(localStorage.getItem(accountScope.physicalKey('xai_dash_order'))).toBe('["alpha"]');expect(result.current.recovery.error).toBeNull();
});
