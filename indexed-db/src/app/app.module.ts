import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';
import { FormsModule } from '@angular/forms';

const dbConfig: DBConfig  = {
  name: 'myDb',
  version: 1,
  objectStoresMeta: [{
    store: 'movies',
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'name', keypath: 'name', options: { unique: false } },
      { name: 'type', keypath: 'type', options: { unique: false } },
      { name: 'description_1', keypath: 'description_1', options: { unique: false } },
      { name: 'description_2', keypath: 'description_2', options: { unique: false } },
      { name: 'description_3', keypath: 'description_3', options: { unique: false } },
      { name: 'description_4', keypath: 'description_4', options: { unique: false } },
      { name: 'description_5', keypath: 'description_5', options: { unique: false } },
      { name: 'description_6', keypath: 'description_6', options: { unique: false } },
      { name: 'description_7', keypath: 'description_7', options: { unique: false } },
      { name: 'description_8', keypath: 'description_8', options: { unique: false } },
      { name: 'description_9', keypath: 'description_9', options: { unique: false } },
      { name: 'description_10', keypath: 'description_10', options: { unique: false } },
      { name: 'created_year', keypath: 'created_year', options: { unique: false } },
    ]
  },
  {
    store: 'update',
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'movieId', keypath: 'movieId', options: { unique: false } },
      { name: 'action', keypath: 'action', options: { unique: false } }
    ]
  }]
};
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
