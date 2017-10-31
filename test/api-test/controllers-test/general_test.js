import chai from 'chai'
import * as generalController from '../../../api/controllers/general.js'
import * as general_helper from '../../../api/helpers/general.js'
import sinon from 'sinon'
import httpMocks from 'node-mocks-http'

process.env.NODE_ENV = 'test'


const request = httpMocks.createRequest({
        method: 'GET',
        swagger: {
          params: {
            dummyParam1: {value: 'dummyValue1'},
            dummyParam2: {value: 'dummyValue2'}
          },
        apiPath: 'api/population/countries'
        }
      })


const response = httpMocks.createResponse()

describe('testing general controller', () => {
  it('testing getParams', (done) => {
    const params = generalController.getParams(request)
    Object.keys(params).forEach(key => {
      chai.expect(request.swagger.params).to.have.property(key)
      chai.expect(request.swagger.params[key].value).to.equal(params[key])
    })
    done()
  })

  it('testing getProperties', (done) => {
    let fakeReturn = {
      key: 'population_worldpop',
      properties:
        ['afg']
    }

    sinon.stub(general_helper, 'getProperties').resolves(fakeReturn)
    sinon.stub(response, 'json').returns(fakeReturn)
    generalController.getProperties(request, response)
    .then(result => {
      chai.expect(result.key).to.equal(fakeReturn.key)
      chai.expect(result.properties).to.equal(fakeReturn.properties)
      done()
    })
  })
})
