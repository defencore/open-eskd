import { clone, equal, validateProject } from '../domain/index.js';

export class StorageConflictError extends Error {
  constructor() {
    super('This project changed in another browser tab.');
    this.name = 'StorageConflictError';
    this.code = 'storage-conflict';
  }
}

export function openDatabase(
  factory = globalThis.indexedDB,
  name = 'open-eskd',
) {
  return new Promise((resolve, reject) => {
    if (!factory) return reject(new Error('Browser storage is unavailable.'));
    const request = factory.open(name, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('projects'))
        request.result.createObjectStore('projects', { keyPath: 'id' });
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      resolve(database);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error('Browser storage is blocked by another tab.'));
  });
}

export class ProjectStore {
  constructor(database) {
    this.database = database;
    this.expected = new Map();
  }

  readAll() {
    return this.read('getAll');
  }

  readCurrent(id) {
    return this.read('get', id);
  }

  read(method, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.database.transaction('projects', 'readonly');
      const store = transaction.objectStore('projects');
      const request = store[method](...(id === undefined ? [] : [id]));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async load() {
    const projects = [],
      rejected = [];
    for (const record of await this.readAll()) {
      try {
        validateProject(record);
        this.acknowledge(record.id, record);
        projects.push(record);
      } catch (error) {
        rejected.push({ record, reason: error.message });
      }
    }
    return { projects, rejected };
  }

  acknowledge(id, record) {
    this.expected.set(id, record === undefined ? undefined : clone(record));
  }

  save(project) {
    validateProject(project);
    return this.write(project.id, clone(project));
  }

  remove(id) {
    return this.write(id, undefined);
  }

  write(id, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.database.transaction('projects', 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.get(id);
      let conflict;
      request.onsuccess = () => {
        // Reading and comparing inside the write transaction makes the check atomic across tabs.
        if (!equal(request.result, this.expected.get(id))) {
          conflict = new StorageConflictError();
          transaction.abort();
          return;
        }
        if (value === undefined) store.delete(id);
        else store.put(value);
      };
      transaction.oncomplete = () => {
        this.acknowledge(id, value);
        resolve();
      };
      transaction.onabort = () =>
        reject(
          conflict ||
            transaction.error ||
            new Error('Storage transaction aborted.'),
        );
      transaction.onerror = () => reject(transaction.error);
    });
  }
}
