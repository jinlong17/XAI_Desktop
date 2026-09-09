import {it,expect} from 'vitest';
import {makeDefaultBoards} from '../internal/seed/board-data.js';
import {isBoardArray} from '../internal/isBoardArray.js';
import {readBoardStorage,preserveBoardStorageFormat} from '../internal/storageContract.js';
it('Board storage roundtrips pending Task intent and rejects malformed payloads',()=>{
 const boards=makeDefaultBoards();const card=boards[0]!.lists[0]!.cards[0]!;
 card.taskLink={source:'xai-web-tasks',taskId:'task',createdAt:'2026-01-01T00:00:00.000Z',pending:{title:{en:'original',zh:'original'},dueDate:'2026-01-02'}};
 expect(isBoardArray(boards)).toBe(true);
 const restored=JSON.parse(JSON.stringify(preserveBoardStorageFormat(boards,boards)));
 expect(readBoardStorage(restored)).toMatchObject({status:'valid',boards});
 const invalid=JSON.parse(JSON.stringify(boards));invalid[0].lists[0].cards[0].taskLink.pending.title=42;
 expect(isBoardArray(invalid)).toBe(false);
});
