import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private isBrowser: boolean;

  constructor(
    public _storage: StorageMap,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async getStorage(key: string) {
    if (!this.isBrowser) return null; // Skip on server
    return await lastValueFrom(
      this._storage.get(`${environment.appName}-${key}`),
      { defaultValue: null },
    );
  }

  async setStorage(key: string, value: object | string | number | boolean) {
    if (!this.isBrowser) return; // Skip on server
    await lastValueFrom(
      this._storage.set(`${environment.appName}-${key}`, value),
    );
  }

  async deleteStorage(key: string) {
    if (!this.isBrowser) return; // Skip on server
    await lastValueFrom(
      this._storage.delete(`${environment.appName}-${key}`),
    );
  }

  async hasStorage(key: string) {
    if (!this.isBrowser) return false; // Skip on server
    return await lastValueFrom(
      this._storage.has(`${environment.appName}-${key}`),
      { defaultValue: false },
    );
  }

  watchStorage(key: string) {
    return this._storage.watch(`${environment.appName}-${key}`);
  }

  async updateStorage<T>(key: string, updatedItem: T, updateById: (item: T, updatedItem: T) => boolean) {

    const currentData = await this.getStorage(key) as T[] || [];

    if (Array.isArray(currentData)) {
      const updatedArray = currentData.map(item => {

        if (updateById(item, updatedItem)) {
          return { ...item, ...updatedItem };
        }
        return item;
      });


      const exists = currentData.some(item => updateById(item, updatedItem));
      if (!exists) {
        updatedArray.push(updatedItem);
      }


      await this.setStorage(key, updatedArray);
    } else {

      await this.setStorage(key, [updatedItem]);
    }
  }

}
