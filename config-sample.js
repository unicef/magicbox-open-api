module.exports = {
  azure: {
    storage_account: 'storage_account_name',
    key1: 'azure_storage_key',
    directory: 'aggregations'
  },
  auth0: {
    auth_domain: 'auth0_domain',
    client_id: 'auth0_client_id',
    // callback_url: 'http://magicbox-open-api.azurewebsites.net/api/v1/token/'
    callback_url: 'http://localhost:8000/api/v1/token/'
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
  }
};
