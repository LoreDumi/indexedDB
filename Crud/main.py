import psycopg2
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import csv


app = Flask(__name__) 
 
CORS(app, resources={r"/*": {"origins": "http://localhost:4200", "allow_headers": "Content-Type"}})

def load_data(filename):
    myList = []
    with open(filename) as items:
        data = csv.reader(items, delimiter=',')
        next(data)
        for row in data:
            add_data_in_table(row)
           # myList.append(row)
        return myList

def add_data_in_table(row):
    print('--->>>', row[1])
    qInsert =""" INSERT INTO  movies ( name, type, description_1, description_2, description_3, description_4, description_5, description_6, description_7, description_8, description_9, description_10, created_year) VALUES
                   (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )
    """
    cursor.execute( qInsert, (row[1], row[2],row[3], row[3],row[3], row[3], row[3],row[3],row[3],row[3],row[3], row[3],row[4]) )

@app.route("/getData")
def getData():
    print("====>>> get DATA")
    open_connection()
    cursor.execute(""" SELECT * FROM movies""")
    resp =  cursor.fetchall()

    formatted_items = [
        {
            'id': str(todo[0]),  # Ensure the id is a string
            'name': todo[1],
            'type': todo[2],
            'description_1': todo[3],
            'description_2': todo[4],
            'description_3': todo[5],
            'description_4': todo[6],
            'description_5': todo[7],
            'description_6': todo[8],
            'description_7': todo[9],
            'description_8': todo[10],
            'description_9': todo[11],
            'description_10': todo[12],
            'created_year': todo[13]
        }
        for todo in resp
    ]

    close_connection()
    #return resp
    #return jsonify({'documents' : formatted_items, 'checkpoint':  ''})
    return jsonify(formatted_items)


@app.route("/updateRemoteDb", methods=["POST"])
def updateTable():
    print("===>>> Add a record in the DB - ", request.data)
    return jsonify("db updated")

@app.route("/deleteRows", methods=["POST"])
def deleteRowsFromTable():
    data = request.get_json(force=True)
    print("===>>> Delete records in the DB - ", data)
    str = ""
    for item in data:
        print('row = ',item['id'])
        str= str + f"{item['id']}" + ', '
    str = str.removesuffix(', ')
    print('Ids to delete  = ', str)
    qDelete = """ DELETE FROM movies WHERE id IN ( """ + str + """ )"""
    print("qdelere = " , qDelete)
    open_connection()
    cursor.execute(qDelete)
    #resp =  cursor.fetchall()
    close_connection()
    return jsonify({'response': "rows deleted", 'success':"true"})


@app.route("/addNewRows", methods=["POST"])
def addRowsFromLocalTable():
    data = request.get_json(force=True)
    print("===>>> Add records in the DB - ", data)
    print("===>>> Add records in the DB - ", data[0]['id'])
    open_connection()
    qInsert =""" INSERT INTO  movies ( id, name, type, description_1, description_2, description_3, description_4, description_5, description_6, description_7, description_8, description_9, description_10, created_year) VALUES
                   (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s ) """
    for item in data:
        print('row = ',item['id'])
        print('row = ',item['name'])
        print('row = ',item['description_1'])
        print('row = ',item['description_2'])
        print('row = ',item['description_3'])
        cursor.execute( qInsert, [int(item['id']), item['name'], item['type'], item['description_1'], item['description_2'], item['description_3'],
                                   item['description_4'], item['description_5'], item['description_6'], item['description_7'], item['description_8'],
                                   item['description_9'], item['description_10'], item['created_year'] ] )

    # print("qdelere = " , qDelete)
    # open_connection()
    # cursor.execute(qDelete)
    #resp =  cursor.fetchall()
    close_connection()
    return jsonify({'response': "rows added", 'success':"true"})

@app.route("/addData") #before it was test - adds again the data from .csv file in the table
def pushData():
    print("=====>>> add Data" )
    open_connection()
    create_table()
    url = "https://raw.githubusercontent.com/amirtds/kaggle-netflix-tv-shows-and-movies/main/titles.csv"
    new_list = load_data('convertcsv.csv')
    close_connection()
    return {'msg':"Data added in the DB"}

def open_connection():
    #connect to DB and create a table
    global conn
    conn =  psycopg2.connect(host="localhost", dbname="electric", user="postgres", password="password", port=54321)
    global cursor 
    cursor = conn.cursor()

def close_connection():
    conn.commit()
    cursor.close()
    conn.close()

def create_table():
    cursor.execute(""" CREATE TABLE IF NOT EXISTS movies (
               id SERIAL PRIMARY KEY,
               name VARCHAR,
               type VARCHAR,
               description_1 VARCHAR,
               description_2 VARCHAR,
               description_3 VARCHAR,
               description_4 VARCHAR,
               description_5 VARCHAR,
               description_6 VARCHAR,
               description_7 VARCHAR,
               description_8 VARCHAR,
               description_9 VARCHAR,
               description_10 VARCHAR,
               created_year VARCHAR
               );
    """)


if __name__ == "__main__":
    app.run(debug=True)
    