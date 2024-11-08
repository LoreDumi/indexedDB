import { Component, OnInit } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'indexed-db';
  searchId = '';
  movieName = '';
  recordsNo = '';
  totalRowsNoInTable = 0;
  movie = {
    id: -1, name: 'Movie', type: "show", description_1: " Some movie description here",
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
  movieListFromLocalDb = [];
  updatesListFromLocalDb = [];
  userMessage = "";

  constructor(private dbService: NgxIndexedDBService) {

  }

  ngOnInit(): void {
    const startTime:any = new Date(); 
    this.userMessage = "please wait ..."
    this.getDataFromLocalDb(startTime)
  }

  getDataFromLocalDb(startTime:any, afterUpdateFromRemote:boolean = false) {
    this.dbService.getAll('movies').subscribe(
      (movieList:any) =>{
        this.movieListFromLocalDb = movieList;
        console.log("====>>> on init = ", movieList)
        console.log("====>>> on init 2= ", this.movieListFromLocalDb)
        if(this.movieListFromLocalDb.length === 0) {
          this.userMessage = "Local Db is empty. Please click on 'Get Data from Remote table' "
        }else{
          const endTime:any = new Date();
          afterUpdateFromRemote?
            this.userMessage = "Update data from Remote - action completed in "+ (endTime - startTime) + " milisec"
            :this.userMessage = "Get data from local DB - action completed in "+ (endTime - startTime) + " milisec"
        }
      }
    )
  }
  addRecord() {
    const startTime:any = new Date(); 
    this.userMessage = "please wait ..."
    this.dbService.getAll('movies').subscribe(
      (movieList: any) => {
        movieList.sort((a: any, b: any) => { return a['id'] - b['id'] })
        this.movie.id = (movieList[movieList.length - 1]?.id | 0 ) + 1;
        this.dbService.add('movies', this.movie).subscribe(
          () => {
            console.log('Record added successfully.');
            this.addInUpdates(this.movie.id, 'add')
            const endTime:any = new Date();
            this.userMessage = " Add Record - action completed in "+ (endTime - startTime) + " milisec"
          });
      }
    );
  }

  searchRecordById() {
    const startTime:any = new Date(); 
    console.log("===>> search for id = ", this.searchId);
    this.dbService.getByKey('movies', parseInt(this.searchId)).subscribe(movie => {
      console.log("===>>> row found = ", movie)
      const endTime:any = new Date();
      this.userMessage = " search - action completed in "+ (endTime - startTime) + " milisec"

    }
    )
  }
  
  searchRecordByName() {
    const startTime:any = new Date(); 
    console.log("===>> search for id = ", this.movieName);
    this.dbService.getAllByIndex('movies', 'name', IDBKeyRange.only(this.movieName)).subscribe(movie => {
      console.log("===>>> row found = ", movie)
      const endTime:any = new Date();
      this.userMessage = " search - action completed in "+ (endTime - startTime) + " milisec"
    }
    )
  }


  addBulkRecordsFromServer(data:any, startTime: any) {
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
      .subscribe((res:any) => {
        console.log("===>>> Finish to add movies from Remote DB - result = ", res)
        this.movieListFromLocalDb = res;
        this.getDataFromLocalDb(startTime, true)
      });
  }

  //generate records from Client  and add them in local DB
  addBulkRecords() {
    const startTime:any = new Date();
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
        bulkUpdate.push({ id: i,  action:'add'})
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
          const endTime:any = new Date();
          this.userMessage = "Added generated data - action completed in "+ (endTime - startTime) + " milisec"
        })
      });
  }

  async getRemoteData(){
    const startTime:any = new Date();
    this.userMessage = "please wait ..."
    const response  = await fetch('http://127.0.0.1:5000/getData')
    const data = await response.json();
      console.log("===>>> Data from sercer = ", data)
      //first clear the local db: movie and update
      this.dbService.clear('movies').subscribe((successDeleted) => {
        console.log('Clear DB  = ', successDeleted);
        this.addBulkRecordsFromServer(data, startTime)
      });
      
  }

  clearDBs(){
    this.dbService.clear('movies').subscribe((successDeleted) => {
      console.log('Clear movies DB  = ', successDeleted);
      this.dbService.clear('update').subscribe((successDeleted) => {
        console.log('Clear update DB  = ', successDeleted);
        this.movieListFromLocalDb = []
      })
    })
  }
  async increaseRemoteTable(){
    this.userMessage = "please wait ... "
    const response  = await fetch('http://127.0.0.1:5000/addData')
    const data = await response.json();
    console.log("===>>> Remote DB has been updated with about 5k items = ", data)
    this.userMessage = "action Completed in the remoteDB"
     // this.addBulkRecordsFromServer(data, startTime)
  }


  countRows() {
    const startTime:any = new Date();
    this.userMessage = "please wait ...."
    this.dbService.count('movies').subscribe(count => {
      this.totalRowsNoInTable = count
      const endTime:any = new Date();
      this.userMessage = "Count completed in "+ (endTime - startTime) + " milisec"
    })
  }

  async updateRemoteDb(){
    this.userMessage="";
    const startTime:any = new Date();
    this.dbService.getAll('update').subscribe(
      (updates:any) =>{
        this.updatesListFromLocalDb = updates;
        const toDelete = this.updatesListFromLocalDb.filter( (row:any) => row.action === 'delete' );
        const toAdd = this.updatesListFromLocalDb.filter( (row:any) => row.action === 'add' );
        const toUpdate = this.updatesListFromLocalDb.filter( (row:any) => row.action === 'update' );

        if (toDelete.length > 0){
          this.deleteData(toDelete);
        }

        if (toAdd.length > 0){
          this.addRemoteData(toAdd);
        }
      }
    )


    
    
  }

  async deleteData(body:any) {
    //body = {id:'1002', actions:'delete'}
    this.userMessage = "Please wait"
    const response  = await fetch('http://127.0.0.1:5000/deleteRows',{
      method:"POST",
      body: JSON.stringify( body ),
    })
    const data = await response.json();
    if(data.code.success === true){ //if the rows were deleted in the remote table, we delete them from the 'update' store also
      this.dbService.bulkDelete('update', body.map( (item:any) =>item.id)).subscribe((result) => {
        console.log('delete rows in update store: ', result);
        this.userMessage ="action complete"
        this.userMessage = "finished 'delete' actions"
      });
    }

  }

  async addRemoteData(body:any) {

    //get coresponding values from 'movie' table
    this.dbService.bulkGet('movies', body.map( (el:any) => el.id)).subscribe(async (result:any) => {
      console.log('====>>>> results: ', result);

      const response  = await fetch('http://127.0.0.1:5000/addNewRows',{
        method:"POST",
        body: JSON.stringify( result ),
      })
      const data = await response.json();
      //we also delete the rows with action='add' from the 'update'table as they are added in the remote already
      this.dbService.bulkDelete('update', body.map( (el:any) => el.id)).subscribe((result) => {
        console.log("Remove records with action ='add' from 'update' store : ", result);
        this.userMessage = "finished 'add' actions"
      });
    });
    
  }

  //action = add/update/delete
  addInUpdates(movieId:number, action:string){
    this.dbService.add('update', {id:movieId, action:action}).subscribe(
      () => {
        console.log('add record in Update Db');
      });
  }

  tableHeader() {
    return Object.keys(this.movie)
  }

  valuesInRow(ind:number){
    return Object.values(this.movieListFromLocalDb[ind])
  }

  deleteRow(ind:number) {
    const startTime:any = new Date();
    this.userMessage ="please wait ..."
    const idToDelete = this.movieListFromLocalDb[ind]['id']
    console.log("delete row with id  = ", idToDelete)
    this.dbService.delete('movies', idToDelete).subscribe((allMoviesLeft:any) => {
      console.log('Updated list :', allMoviesLeft);

      //if the deletion has been made, record the action in update'
      if(this.movieListFromLocalDb.length > allMoviesLeft.length) {
        this.addInUpdates(idToDelete, 'delete')
        const endTime:any = new Date();
        this.userMessage = "Delete action - completed in "+ (endTime - startTime) + " milisec"
      }
      this.movieListFromLocalDb = allMoviesLeft;
    });
  }
}
