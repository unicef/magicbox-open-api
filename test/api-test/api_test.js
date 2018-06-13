import chaiHttp from 'chai-http'
import server from '../../server.js'
import chai from 'chai'
const should = chai.should()
let source = 'The global distribution of the arbovirus vectors'
source += ' Aedes aegypti and Ae. albopictus'

const source_url = 'https://elifesciences.org/content/4/e08347'

process.env.NODE_ENV = 'test'

chai.use(chaiHttp);

describe('testing mobility API', () => {
  it('it should GET list of objects', (done) => {
    chai.request(server)
    .get('/api/v1/mobility/countries/')
    .end((err, res) => {
      res.should.have.status(200)
      res.body.should.be.a('array')
      done()
    })
  })
})

describe('testing population API', () => {
      it('it should GET list of countries', (done) => {
        chai.request(server)
            .get('/api/v1/population/countries/')
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('key').eql('population_worldpop')
                res.body.should.have.property('properties')
                res.body.properties.should.be.a('array')
                res.body.properties[0].should.equal('afg')
              done()
            })
      })


      it('it should GET population of AFG', (done) => {
        const firstValue = {admin_id: 'afg_1_12_129_gadm2-8',
                        value: 74459.9892636929,
                        ID_0: 1,
                        ISO: 'AFG',
                        NAME_0: 'Afghanistan',
                        ID_1: 12,
                        NAME_1: 'Hirat',
                        ID_2: 129,
                        NAME_2: 'Zinda Jan',
                        HASC_2: 'AF.HR.ZJ',
                        CCN_2: 0,
                        CCA_2: null,
                        TYPE_2: 'Wuleswali',
                        ENGTYPE_2: 'District',
                        NL_NAME_2: null,
                        VARNAME_2: null
                      }

        chai.request(server)
            .get('/api/v1/population/countries/afg')
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('key').eql('population')
                res.body.should.have.property('source').eql('worldpop')
                res.body.should.have.property('data')
                res.body.data.should.be.a('object')
                res.body.data.should.have.property('source').eql('worldpop')
                res.body.data.should.have.property('raster').eql('popmap15adj')
                res.body.data.should.have.property('values')
                res.body.data.values.should.be.a('array')
                chai.expect(res.body.data.values[0]).to.deep.equal(firstValue)
              done()
            })
      })
  })


  describe('testing mosquito API', () => {
        it('it should GET list of mosquito kinds', (done) => {
          chai.request(server)
              .get('/api/v1/mosquito/kinds/')
              .end((err, res) => {
                  res.should.have.status(200)
                  res.body.should.be.a('object')
                  res.body.should.have.property('key').eql('mosquito')
                  res.body.should.have.property('properties')
                  res.body.properties.should.be.a('array')
                  res.body.properties[0].should.equal('aegypti')
                done()
              })
        })


        it('it should GET mosquito prevalence of kind specified', (done) => {
          const afg_mosquito = {afg:
                         [{country: 'afg',
                             data_source: 'simon_hay',
                             shapefile: 'gadm2-8',
                             admin_level: '2',
                             sum: 0.12469,
                             sq_km: 376427,
                             density: 3.312461645949945e-7,
                             raster: 'aegypti'}]
                          }

          chai.request(server)
              .get('/api/v1/mosquito/kinds/aegypti')
              .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('key').eql('mosquito')
                res.body.should.have.property('kind').eql('aegypti')
                res.body.should.have.property('source').eql(source)
                res.body.should.have.property('source_url').eql(source_url)
                res.body.should.have.property('data')
                res.body.data.should.be.a('object')
                chai.expect(res.body.data).to.deep.equal(afg_mosquito)
                done()
              })
        })

        it('it should GET list of countries', (done) => {
          chai.request(server)
              .get('/api/v1/mosquito/kinds/aegypti/countries/')
              .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('key').eql('mosquito_aegypti')
                res.body.should.have.property('properties')
                res.body.properties.should.be.a('array')
                res.body.properties[0].should.equal('afg')
                done()
              })
        })


        it('it should GET mosquito prevalence in a country of specified kind',
        (done) => {
          const afg_mosquito = {admin_id: 'afg_1_16_170_gadm2-8',
                            value: 0.134451949145065,
                            ID_0: 1,
                            ISO: 'AFG',
                            NAME_0: 'Afghanistan',
                            ID_1: 16,
                            NAME_1: 'Kapisa',
                            ID_2: 170,
                            NAME_2: 'Nijrab',
                            HASC_2: 'AF.KP.NI',
                            CCN_2: 0,
                            CCA_2: null,
                            TYPE_2: 'Wuleswali',
                            ENGTYPE_2: 'District',
                            NL_NAME_2: null,
                            VARNAME_2: null
                          }

          chai.request(server)
              .get('/api/v1/mosquito/kinds/aegypti/countries/afg')
              .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('key').eql('mosquito')
                res.body.should.have.property('kind').eql('aegypti')
                res.body.should.have.property('source').eql(source)
                res.body.should.have.property('source_url').eql(source_url)
                res.body.should.have.property('data')
                res.body.data.should.be.a('object')
                res.body.data.should.have.property('source').eql('simon_hay')
                res.body.data.should.have.property('raster').eql('aegypti')
                res.body.data.should.have.property('values')
                res.body.data.values.should.be.a('array')
                chai.expect(res.body.data.values[0]).to.deep.equal(afg_mosquito)
                done()
              })
        })
  })
