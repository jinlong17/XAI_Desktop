# G8-E2 Web Data Driver Feature Brief

## Scope

Add browser-safe data driver scaffolds:
- `IndexedDBAdapter<T>`
- `RemoteEncryptedBlobAdapter<T>` mock
- `OfflineFirstStrategy<T>`

## Behavior

Writes go to IndexedDB first. When online, pending IDs sync to the mock remote encrypted blob adapter.
