import { Component, OnInit } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'indexed-db';
  searchId = '';
  movieName = '';
  recordsNo = '';
  totalRowsNoInTable = 0;
  newName = "";
  updateRowInd = -1;
  movie = {
    name: 'Movie', type: "show", description_1: " Some movie description here",
    description_2: " Some movie description here",
    description_3: " Some movie description here",
    description_4: " Some movie description here",
    description_5: " Some movie description here",
    description_6: " Some movie description here",
    description_7: " Some movie description here",
    description_8: " Some movie description here",
    description_9: " Some movie description here",
    description_10: " Some movie description here",
    created_year: "2023",

  };
  movieListFromLocalDb: EnumMovies[] = [];
  updatesListFromLocalDb = [];
  userMessage = "";

  constructor(private dbService: NgxIndexedDBService) {

  }

  ngOnInit(): void {
    const startTime: any = new Date();
    this.userMessage = "please wait ..."
    this.getDataFromLocalDb(startTime)
  }

  getDataFromLocalDb(startTime: any, afterUpdateFromRemote: boolean = false) {
    this.dbService.getAll('movies').subscribe(
      (movieList: any) => {
        this.movieListFromLocalDb = movieList;
        console.log("====>>> getDataFromLocalDb = ", this.movieListFromLocalDb)
        if (this.movieListFromLocalDb.length === 0) {
          this.userMessage = "Local Db is empty. Please click on 'Get Data from Remote table' "
        } else {
          const endTime: any = new Date();
          afterUpdateFromRemote ?
            this.userMessage = "Update data from Remote - action completed in " + (endTime - startTime) + " milisec"
            : this.userMessage = "Get data from local DB - action completed in " + (endTime - startTime) + " milisec"
        }
      }
    )
  }
  addRecord() {
    const startTime: any = new Date();
    this.userMessage = "please wait ..."
    
    this.dbService.add('movies', this.movie).subscribe(
      (row) => {
        console.log('Record added successfully = ', row);
        this.addInUpdates(row.id, 'add')
        this.movieListFromLocalDb.push(JSON.parse(JSON.stringify(row)) as EnumMovies)
        const endTime: any = new Date();
        this.userMessage = " Add Record - action completed in " + (endTime - startTime) + " milisec"
      });


   /*  this.dbService.getAll('movies').subscribe(
      (movieList: any) => {
        movieList.sort((a: any, b: any) => { return a['id'] - b['id'] })
        this.movie.id = (movieList[movieList.length - 1]?.id | 0) + 1;
        this.dbService.add('movies', this.movie).subscribe(
          (row) => {
            console.log('Record added successfully = ', row);
            this.addInUpdates(this.movie.id, 'add')
            this.movieListFromLocalDb.push(JSON.parse(JSON.stringify(row)) as EnumMovies)
            const endTime: any = new Date();
            this.userMessage = " Add Record - action completed in " + (endTime - startTime) + " milisec"
          });
      }
    ); */
  }

  searchRecordById() {
    const startTime: any = new Date();
    console.log("===>> search for id = ", this.searchId);
    this.dbService.getByKey('movies', parseInt(this.searchId)).subscribe(movie => {
      console.log("===>>> row found = ", movie)
      const endTime: any = new Date();
      this.userMessage = " search - action completed in " + (endTime - startTime) + " milisec"

    }
    )
  }

  searchRecordByName() {
    const startTime: any = new Date();
    console.log("===>> search for id = ", this.movieName);
    this.dbService.getAllByIndex('movies', 'name', IDBKeyRange.only(this.movieName)).subscribe(movie => {
      console.log("===>>> row found = ", movie)
      const endTime: any = new Date();
      this.userMessage = " search - action completed in " + (endTime - startTime) + " milisec"
    }
    )
  }


  addBulkRecordsFromServer(data: any, startTime: any) {
    let bulk: any = []
    for (let i = 0; i < data.length; i++) {
      bulk.push(
        {
          id: parseInt(data[i].id),
          name: data[i].name,
          description_1: data[i].description_1,
          description_2: data[i].description_2,
          description_3: data[i].description_3,
          description_4: data[i].description_4,
          description_5: data[i].description_5,
          description_6: data[i].description_6,
          description_7: data[i].description_7,
          description_8: data[i].description_8,
          description_9: data[i].description_9,
          description_10: data[i].description_10,
          created_year: data[i].created_year

        }
      )
    }
    console.log("===>>> bulk of movies = ", bulk)
    this.dbService.bulkAdd('movies', bulk)
      .subscribe((res: any) => {
        console.log("===>>> Finish to add movies from Remote DB - result = ", res)
        
        //for performance, we render the dates received from server and not do another query on the local DB
        //they should be the same
        this.movieListFromLocalDb = bulk;
        // this.getDataFromLocalDb(startTime, true)

        const endTime: any = new Date();
        this.userMessage = " Get data from server - action completed in " + (endTime - startTime) + " milisec"
      });
  }

  //generate records from Client  and add them in local DB
  addBulkRecords() {
    const startTime: any = new Date();
    this.userMessage = "please wait ..."
    let bulk: any = []
    let bulkUpdate: any = []
    for (let i = 1; i <= parseInt(this.recordsNo); i++) {
      bulk.push(
        {
          id: i,
          name: 'MOVIE - ' + i,
          type: "show",
          description_1: " Some movie description here",
          description_2: " Some movie description here",
          description_3: " Some movie description here",
          description_4: " Some movie description here",
          description_5: " Some movie description here",
          description_6: " Some movie description here",
          description_7: " Some movie description here",
          description_8: " Some movie description here",
          description_9: " Some movie description here",
          description_10: " Some movie description here",
          created_year: "2023",

        },
        bulkUpdate.push({ id: i, action: 'add' })
      )
    }
    console.log("===>>> bulk of movies = ", bulk)
    this.dbService.bulkAdd('movies', bulk)
      .subscribe(res => {
        console.log("===>>> Add bulk in 'movies' store has finished - result = ", res)

        //add data in the 'udapte' store also
        this.dbService.bulkAdd('update', bulkUpdate)
          .subscribe(res => {
            console.log("===>>> Add bulk in 'update' store has finished - result = ", res)
            const endTime: any = new Date();
            this.userMessage = "Added generated data - action completed in " + (endTime - startTime) + " milisec"
          })
      });
  }

  async getRemoteData() {
    const startTime: any = new Date();
    this.userMessage = "please wait ..."
    const response = await fetch('http://127.0.0.1:5000/getData')
    const data = await response.json();
    console.log("===>>> Data from sercer = ", data)
    //first clear the local db: movie and update
    this.dbService.clear('movies').subscribe((successDeleted) => {
      console.log('Clear DB  = ', successDeleted);
      this.addBulkRecordsFromServer(data, startTime)
    });

  }

  clearDBs() {
    const startTime: any = new Date();
    this.userMessage = "please wait ..."
    this.dbService.clear('movies').subscribe((successDeleted) => {
      console.log('Clear movies DB  = ', successDeleted);
      this.dbService.clear('update').subscribe((successDeleted) => {
        console.log('Clear update DB  = ', successDeleted);
        this.movieListFromLocalDb = [];
        const endTime: any = new Date();
        this.userMessage = "Clear DBs completed in " + (endTime - startTime) + " milisec"
      })
    })
  }
  async increaseRemoteTable() {
    this.userMessage = "please wait ... "
    const response = await fetch('http://127.0.0.1:5000/addData')
    const data = await response.json();
    console.log("===>>> Remote DB has been updated with about 5k items = ", data)
    this.userMessage = "action Completed in the remoteDB"
    // this.addBulkRecordsFromServer(data, startTime)
  }


  countRows() {
    const startTime: any = new Date();
    this.userMessage = "please wait ...."
    this.dbService.count('movies').subscribe(count => {
      this.totalRowsNoInTable = count
      const endTime: any = new Date();
      this.userMessage = "Count completed in " + (endTime - startTime) + " milisec"
    })
  }

  async updateRemoteDb() {
    this.userMessage = "Please wait on update remote DB";
    const startTime: any = new Date();
    this.dbService.getAll('update').subscribe(
      (updates: any) => {
        this.updatesListFromLocalDb = updates;
        const toDelete = this.updatesListFromLocalDb.filter((row: any) => row.action === 'delete');
        const toAdd = this.updatesListFromLocalDb.filter((row: any) => row.action === 'add');
        const toUpdate = this.updatesListFromLocalDb.filter((row: any) => row.action === 'update');

        if (toDelete.length == 0 && toAdd.length == 0 && toUpdate.length == 0) {
          this.userMessage = "Nothing to update on the Remote DB"
        }
        if (toDelete.length > 0) {
          this.deleteRemoteData(toDelete, startTime);
        }

        if (toAdd.length > 0) {
          this.addRemoteData(toAdd, startTime);
        }

        if (toUpdate.length > 0) {
          this.updateRemoteData(toUpdate, startTime);
        }
      }
    )




  }

  async deleteRemoteData(body: any, startTime: any) {
    //body = {id:'1002', actions:'delete'}
    const response = await fetch('http://127.0.0.1:5000/deleteRows', {
      method: "POST",
      body: JSON.stringify(body),
    })
    const data = await response.json();
    console.log("Response server on Delete rows = ", data)
    if (data.success === 'true') { //if the rows were deleted in the remote table, we delete them from the 'update' store also
      this.dbService.bulkDelete('update', body.map((item: any) => item.id)).subscribe((result) => {
        console.log('delete rows in update store: ', result);
        this.userMessage = "action complete"
        this.userMessage = "finished 'delete' actions"
        const endTime: any = new Date();
        this.userMessage += " ---Finished 'delete' actions in " + (endTime - startTime) + " milisec"
      });
    }

  }

  async updateRemoteData(body: any, startTime: any) {
    //get coresponding values from 'movie' table
    this.dbService.bulkGet('movies', body.map((el: any) => el.id)).subscribe(async (result: any) => {
      console.log('====>>>> results: ', result);
      const response = await fetch('http://127.0.0.1:5000/updateRows', {
        method: "POST",
        body: JSON.stringify(result),
      })
      const data = await response.json();
      //we also delete the rows with action='update' from the 'update'table as they are updated in the remote already
      this.dbService.bulkDelete('update', body.map((el: any) => el.id)).subscribe((result) => {
        console.log("Remove records with action ='update' from 'update' store : ", result);
        const endTime: any = new Date();
        this.userMessage += " --- Finished 'update' actions in " + (endTime - startTime) + " milisec"
      });
    });
  }

  async addRemoteData(body: any, startTime: any) {
    //get coresponding values from 'movie' table
    this.dbService.bulkGet('movies', body.map((el: any) => el.id)).subscribe(async (result: any) => {
      console.log('====>>>> results: ', result);

      const response = await fetch('http://127.0.0.1:5000/addNewRows', {
        method: "POST",
        body: JSON.stringify(result),
      })
      const data = await response.json();
      //we also delete the rows with action='add' from the 'update'table as they are added in the remote already
      this.dbService.bulkDelete('update', body.map((el: any) => el.id)).subscribe((result) => {
        console.log("Remove records with action ='add' from 'update' store : ", result);
        const endTime: any = new Date();
        this.userMessage += " --- Finished 'add' actions in " + (endTime - startTime) + " milisec"
      });
    });
  }

  //action = add/update/delete
  addInUpdates(movieId: number, action: string) {
    this.dbService.add('update', { id: movieId, action: action }).subscribe(
      () => {
        console.log('add record in Update Db');
      });
  }

  tableHeader() {
    return Object.keys(this.movie)
  }

  valuesInRow(ind: number) {
    return Object.values(this.movieListFromLocalDb[ind])
  }

  saveUpdatedName(ind: number) {
    const startTime: any = new Date();
    this.userMessage = "please wait ..."
    console.log("Save new name " + this.newName + " for movie with index - ", this.movieListFromLocalDb[ind])
    this.dbService.update('movies', {
      ...this.movieListFromLocalDb[ind],
      name: this.newName,
    })
      .subscribe((storeData) => {
        console.log('storeData: ', storeData);
        this.movieListFromLocalDb[ind] = storeData;
        this.addInUpdates(this.movieListFromLocalDb[ind].id, 'update');
        const endTime: any = new Date();
        this.userMessage = "Update action - completed in " + (endTime - startTime) + " milisec"
        this.updateRowInd = -1
      });
  }

  updateRow(ind: number) {
    this.updateRowInd = ind;
    console.log("===>>> Update movie ", ind, "   = ", this.movieListFromLocalDb[ind])
    this.newName = this.movieListFromLocalDb[ind].name;
    console.log("===>>> old Name = ", this.newName)
  }

  deleteRow(ind: number) {
    const startTime: any = new Date();
    this.userMessage = "Please wait ..."
    const idToDelete = this.movieListFromLocalDb[ind]['id']
    console.log("delete row with id  = ", idToDelete)
    this.dbService.delete('movies', idToDelete).subscribe((allMoviesLeft: any) => {
      console.log('Updated list :', allMoviesLeft);

      //if the deletion has been made, add new record in update'
      console.log("===>>> after delete roaw, we should add it in the update?  = ", this.movieListFromLocalDb.length > allMoviesLeft.length)
      if (this.movieListFromLocalDb.length > allMoviesLeft.length) {
        this.addInUpdates(idToDelete, 'delete')
        const endTime: any = new Date();
        this.userMessage = "Delete action - completed in " + (endTime - startTime) + " milisec"
      }
      this.movieListFromLocalDb = allMoviesLeft;
    });
  }
}


interface EnumMovies {
  id: number,
  name: string,
  type: string,
  desctiption_1: string,
  desctiption_2: string,
  desctiption_3: string,
  desctiption_4: string,
  desctiption_5: string,
  desctiption_6: string,
  desctiption_7: string,
  desctiption_8: string,
  desctiption_9: string,
  desctiption_10: string,
  created_year: string
}