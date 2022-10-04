import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

const server = express();
dotenv.config();

MongoClient.connect(process.env.MONGO_DB)
  .then((client) => {
    const calendarDB = client.db('calendar');
    const tasksCollection = calendarDB.collection('tasks');

    server.use(express.json());
    server.use(cors());

    server.get('/tasks', (req, res) => {
      tasksCollection
        .find()
        .toArray()
        .then((results) => {
          res.json(results);
        })
        .catch((err) => res.status(500).json(err));
    });

    server.post('/tasks', (req, res) => {
      tasksCollection
        .insertOne(req.body)
        .then((results) => {
          res.json(results);
        })
        .catch((err) => res.status(500).json(err));
    });

    server.delete('/tasks/:id', (req, res) => {
      const { id } = req.params;
      console.log('my id: ', id);
      tasksCollection
        .deleteOne({ _id: new ObjectId(id) })
        .then((results) => {
          if (results.deletedCount === 0) {
            throw new Error({
              message: 'No documents matched the query. Deleted 0 documents.',
            });
          }
          res.json(results);
        })
        .catch((err) => res.status(404).json(err));
    });

    server.put('/tasks/status/:id', (req, res) => {
      const { id } = req.params;
      console.log('my id status: ', id, req.body);
      tasksCollection
        .updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: req.body.status,
            },
          }
        )
        .then((results) => {
          console.log(results);
          if (results.modifiedCount === 0) {
            console.log('error');
            throw new Error({
              message: 'No documents matched the query. Updated 0 documents.',
            });
          }
          res.json(results);
        })
        .catch((err) => res.status(404).json(err));
    });
    // server.put('/tasks', (req, res) => {
    //   tasksCollection
    //     .findOneAndUpdate(
    //       { title: 'React Hooks POST Request Example' },
    //       {
    //         $set: {
    //           title: req.body.title
    //         }
    //       },
    //       {upsert: true}
    //     )
    //     .then((result) => {
    //       console.log(result);
    //       res.json({ title: 'data was updated' });
    //     })
    //     .catch((err) => console.error(err));
    // });

    const port = process.env.PORT || 8080;
    server.listen(port, () => {
      console.log(`listening on port: ${port}`);
    });
  })
  .catch((err) => console.error(err));

export default server;
