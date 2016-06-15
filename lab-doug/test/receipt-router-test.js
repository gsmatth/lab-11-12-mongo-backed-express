'use strict';
//use test db for this module.  Make sure this line is before loading of server and the 'port' const
process.env.MONGO_URI = 'mongodb://localhost/test';
const expect = require('chai').expect;
const request = require('superagent-use');
const supPromise = require('superagent-promise-plugin');
const port = process.env.PORT || 3000;
const baseUrl = `http://localhost:${port}`;
const server = require('../server');
const bodyParser = require('body-parser').json();
const receiptCrud = require('../lib/receipt-crud');


request.use(supPromise);

describe('Testing RECEIPT router', function(){
  before((done) => {
    if(!server.isRunning){
      server.listen(port, () => {
        server.isRunning = true;
        console.log('server is running on port: ', port);
        done();
      });
      return;
    }
    done();
  });

  after((done) => {
    if(server.isRunning){
      server.close(() => {
        console.log('server has been shutdown');
        done();
      });
      return;
    }
    done();
  });

  describe('Testing POST with valid request', function(){
    after((done) => {
      receiptCrud.removeReceiptDocuments()
      .then(() => done())
      .catch(done);
    });

    it('should return a receipt', function(done){
      request.post(`${baseUrl}/api/receipt`)
      .send({customerLastName: 'Smith', autoMake: 'Audi', autoYear: 2010})
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.autoMake).to.equal('Audi');
        done();
      }).catch(done);
      /*in mocha, if you pass 'done' in catch, it logs the error and ends the test.*/
    });
  });

  describe('Testing GET with valid request and id', function(){
    before((done) => {
      receiptCrud.createReceipt({customerLastName: 'Wilson', autoMake: 'VW', autoYear: 2015 })
      .then(receipt => {
        // console.log('GET receipt created: ', receipt);
        this.tempReceipt = receipt;
        console.log('GET tempReceipt created: ', this.tempReceipt);
        done();
      }).catch(done);
    });
    it('should return a receipt', (done) => {
      console.log('value of tempReceipt ID in receipt-router-test Get with valid id: ', this.tempReceipt._id);
      request.get(`${baseUrl}/api/receipt/${this.tempReceipt._id}`)
      .then((res) => {
        expect(res.status).to.equal(200);
        console.log('res.body: ', res.body);
        expect(res.body.autoMake).to.equal('VW');
        done();
      }).catch(done);
    });
  });
  describe('Testing GET with INVALID request id', function(){
    before((done) => {
      receiptCrud.createReceipt({customerLastName: 'Wilson', autoMake: 'VW', autoYear: 2015 })
      .then(receipt => {
        this.tempReceipt = receipt;
        done();
      }).catch(done);
    });

    after((done) => {
      receiptCrud.removeReceiptDocuments()
      .then(() => done()).catch(done);
    });

    it('should return a 404 not found', (done) => {
      request.get(`${baseUrl}/api/receipt/${"123s456"}`)
      .then(done)
      .catch(err => {
        const res = err.response;
        expect(res.status).to.equal(404);
        expect(res.text).to.equal('not found');
        done();
      });
    });
  });
  describe('Testing PUT with valid id', function(){
    before((done) => {
      receiptCrud.createReceipt({customerLastName: 'Wilson', autoMake: 'VW', autoYear: 2015 })
      .then(receipt => {
        this.tempReceipt = receipt;
        done();
      }).catch(done);
    });

    it('should return a modified receipt object', (done) => {
      request.put(`${baseUrl}/api/receipt/${this.tempReceipt._id}`)
      .send ({customerLastName: 'Smith', autoMake: 'Audi', autoYear: 2010})
      .then(receiptCrud.putReceipt(req.params.id, reqBody))
          .then (receipt => res.send(receipt))
          .catch(err => res.sendError(err));
      });
  });


//
// describe('Testing DELETE with a valid id', function(req, res){
//   before((done) => {
//     receiptCrud.createReceipt({customerLastName: 'Wilson', autoMake: 'VW', autoYear: 2015})
//
//     .then(receipt => {
//       this.tempReceipt = receipt;
//       done();
//     }).catch(done);
//   });
//   it('should remove the document from the collection', (done) => {
//     request.del(`${baseUrl}/api/receipt/${this.tempReceipt._id}`)
//     .receiptCrud.removeReceipt(`${this.tempReceipt._id}`)
//     .then((res) => {
//       expect(res.status).to.equal(200);
//       done();
//     }).catch(done);
//   });
// });
});
