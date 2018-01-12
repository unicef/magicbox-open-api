``
module.exports = {
  azure: {
    storage_account: 'storage_account_name',
    key1: 'azure_storage_key',
    directory: 'aggregations'
  },
  auth0: {
    auth_domain: 'AUTH0_DOMAIN',
    client_id: 'AUTH0_CLIENTID',
    callback_url: 'http://localhost:8000/api/v1/token/'
    client_secret: 'client_secret',
    auth_url: 'AUTH_URL',
    // callback_url: 'http://magicbox-open-api.azurewebsites.net/api/v1/token/'
    callback_url: 'http://localhost:8000/api/v1/token/',
    redirect_uri: 'http://localhost:8000/',
    roles: {
      'unicef.org': 'admin',
      'projectconnect.world': 'proco',
    },
  },
  mobility: {
      path: 'mobility/',
      default_country: 'colombia',
      default_database: 'santiblanko',
      default_source: 'telefonica',
      default_admin_level: 2
  },
  mosquito: {
      val_type: 'mean',
      source: 'The global distribution of the arbovirus vectors Aedes aegypti and Ae. albopictus',
      source_url: 'https://elifesciences.org/content/4/e08347',
      path: 'mosquito/',
      default_source: 'simon_hay',
      default_database: 'gadm2-8'
  },
  population: {
    val_type: 'sum',
    source: 'worldpop.org.uk',
    source_url: 'http://www.worldpop.org.uk',
    path: 'population/',
    default_source: 'worldpop',
    default_database: 'gadm2-8'
  },
  'geo-properties': {
    path: '../geo-properties/'
  },
  cases: {
    path: 'cases/',
    zika: {
      source: 'Paho',
      source_url: 'http://www.paho.org/hq/index.php?option=com_content&view=article&id=12390&Itemid=42090&lang=en',
      path: 'zika/paho/'
    }
  },
  logger: {
    key: 'mixpanel_token'
  },
  db: {
    user: 'DB_USER',
    host: 'DB_HOST',
    database: 'DB_NAME',
    password: 'DB_PASSWORD',
    port: 'DB_PORT',
  },
  max_query_result: 100000000
};
