import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { accountScope } from '@repo/plugin-web-storage';
import { onWebEvent } from '@repo/xai-web-event-bus';
import { MatrixModule } from '../MatrixModule.js';
const initial={schemaVersion:1,q1:[{id:'original',title:{en:'Original A',zh:'Original A'}}],q2:[],q3:[],q4:[]};
const key=()=>accountScope.physicalKey('xai_matrix_state');
beforeEach(()=>{
  localStorage.setItem(key(),JSON.stringify(initial));
  HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  HTMLDialogElement.prototype.close=function(){this.open=false;};
});
afterEach(()=>vi.restoreAllMocks());
function deny(){const target=key(),original=Storage.prototype.setItem;return vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,name,value){if(name===target)throw new DOMException('quota','QuotaExceededError');original.call(this,name,value);});}
function enter(title:string){fireEvent.change(document.querySelector('.matrix-composer__input')!,{target:{value:title}});}
function save(){fireEvent.click(document.querySelector('.matrix-composer__btn--primary')!);}
function move(){fireEvent.keyDown(document.querySelector('[data-card-id=original]')!,{key:'ArrowRight',ctrlKey:true});}
describe('Matrix save-result recovery',()=>{
 it('quota keeps native dialog and latest draft; retry creates exactly one latest card',()=>{
  render(<MatrixModule lang="en"/>);fireEvent.click(screen.getByRole('button',{name:'Add'}));enter('First');const fault=deny();save();
  expect(document.querySelector('dialog')!.open).toBe(true);expect(screen.getByRole('alert').textContent).toContain('Not saved');expect(localStorage.getItem(key())).toBe(JSON.stringify(initial));
  enter('Latest draft');const cancel=new Event('cancel',{cancelable:true});fireEvent(document.querySelector('dialog')!,cancel);expect(cancel.defaultPrevented).toBe(true);expect(document.querySelector('dialog')!.open).toBe(true);
  fault.mockRestore();save();expect(document.querySelector('dialog')!.open).toBe(false);const stored=JSON.parse(localStorage.getItem(key())!);expect(stored.q1).toHaveLength(2);expect(stored.q1[1].title.en).toBe('Latest draft');
 });
 it('failed move emits no success and retains original quadrant; retry emits once after persistence',()=>{
  const events:unknown[]=[];const off=onWebEvent('web:matrix:priority-tagged',event=>events.push(event));render(<MatrixModule lang="en"/>);const fault=deny();move();
  expect(events).toHaveLength(0);expect(localStorage.getItem(key())).toBe(JSON.stringify(initial));expect(document.querySelector('[data-card-id=original]')!.getAttribute('data-quadrant')).toBe('q1');
  fault.mockRestore();fireEvent.click(screen.getByRole('button',{name:'Retry save'}));expect(events).toHaveLength(1);expect(JSON.parse(localStorage.getItem(key())!).q2[0].id).toBe('original');off();
 });
 it('retry preserves newer external bytes and does not emit an obsolete move',()=>{
  const events:unknown[]=[];const off=onWebEvent('web:matrix:priority-tagged',event=>events.push(event));render(<MatrixModule lang="en"/>);const fault=deny();move();fault.mockRestore();
  const newer=JSON.stringify({...initial,q3:[{id:'newer',title:{en:'Newer',zh:'Newer'}}]});localStorage.setItem(key(),newer);
  fireEvent.click(screen.getByRole('button',{name:'Retry save'}));expect(localStorage.getItem(key())).toBe(newer);expect(events).toHaveLength(0);expect(screen.getByRole('alert').textContent).toContain('Newer stored data');off();
 });
 it('old account draft cannot retry or export into B',()=>{
  render(<MatrixModule lang="en"/>);fireEvent.click(screen.getByRole('button',{name:'Add'}));enter('A secret draft');const fault=deny();save();fault.mockRestore();const aKey=key();
  act(()=>{accountScope.activate(accountScope.lock('B'),'B');});const bKey=key();const bBytes=localStorage.getItem(bKey);save();fireEvent.click(screen.getByRole('button',{name:'Export draft'}));
  expect(screen.getByRole('alert').textContent).toContain('Export failed');expect(localStorage.getItem(aKey)).toBe(JSON.stringify(initial));expect(localStorage.getItem(bKey)).toBe(bBytes);
 });
});
