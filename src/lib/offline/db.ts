/**
 * The offline store: a tiny promise wrapper over IndexedDB holding the outbox
 * of changes made while the network was down. Nothing here runs on first
 * paint — the module is imported lazily, the first time a change is queued or
 * the connectivity banner needs a count.
 */

const DB_NAME = "ana-quran-offline";
const DB_VERSION = 1;
const STORE = "outbox";

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
};

const withStore = async <T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = run(tx.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const outboxGetAll = () =>
  withStore("readonly", (store) => store.getAll());

export const outboxPut = <T>(item: T) =>
  withStore("readwrite", (store) => store.put(item));

export const outboxDelete = (id: string) =>
  withStore("readwrite", (store) => store.delete(id));