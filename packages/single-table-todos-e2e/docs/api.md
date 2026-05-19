# single-table-todos-e2e — API

## Todo Sync Store

```ts
createTodoSyncStore(driver, options?): TodoSyncStore
```

`TodoSyncStore` exposes:

- `putTodo(todo, { mutationId, clientUpdatedAtMs? })`
- `applyRemoteTodo(todo)`
- `getTodo(id)`
- `listTodos()`
- `listOutbox()`
- `removeOutbox(mutationIds)`

`putTodo()` is the atomic local mutation path: it writes `account_todos` and
`sync_outbox` in one driver transaction.

## SQL Contract

`TODO_SYNC_SQL` exports the SQL statements used by the local store so integration
tests can assert transaction grouping without parsing arbitrary SQL text.
