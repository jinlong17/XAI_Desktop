import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AiChatModule } from '../../../packages/plugin-web-ai-chat/src/AiChatModule.js';
afterEach(cleanup);
it('discarding an obsolete preference proposal shows the current stored preference',()=>{
 localStorage.setItem('xai_ai_insights','true');
 render(<AiChatModule lang="en"/>);
 expect(screen.getByRole('button',{name:'Hide insights'})).toBeTruthy();
 localStorage.setItem('xai_ai_insights','false');
 fireEvent.click(screen.getByRole('button',{name:'Hide insights'}));
 expect(screen.getByRole('alert')).toBeTruthy();
 expect(localStorage.getItem('xai_ai_insights')).toBe('false');
 fireEvent.click(screen.getByRole('button',{name:'Discard unsaved content'}));
 expect(localStorage.getItem('xai_ai_insights')).toBe('false');
 expect(screen.getByRole('button',{name:'Show insights'})).toBeTruthy();
});
