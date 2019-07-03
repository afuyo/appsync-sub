'use strict';
const aws_exports = require('./aws-export').default;
// CONFIG
const AppSync = {
    "graphqlEndpoint": aws_exports.graphqlEndpoint,
    "region": aws_exports.region,
    "authenticationType": aws_exports.authenticationType,
    "apiKey": aws_exports.apiKey,
};
const ApiId = aws_exports.ApiId;

// POLYFILLS
global.WebSocket = require('ws');
global.window = global.window || {
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    WebSocket: global.WebSocket,
    ArrayBuffer: global.ArrayBuffer,
    addEventListener: function () { },
    navigator: { onLine: true }
};
global.localStorage = {
    store: {},
    getItem: function (key) {
        return this.store[key]
    },
    setItem: function (key, value) {
        this.store[key] = value
    },
    removeItem: function (key) {
        delete this.store[key]
    }
};
require('es6-promise').polyfill();
require('isomorphic-fetch');

// Require AppSync module
const AUTH_TYPE = require('aws-appsync/lib/link/auth-link').AUTH_TYPE;
const AWSAppSyncClient = require('aws-appsync').default;

// INIT
// Set up AppSync client
const client = new AWSAppSyncClient({
    url: AppSync.graphqlEndpoint,
    region: AppSync.region,
    auth: {
        type: AUTH_TYPE.API_KEY,
        apiKey: AppSync.apiKey
    }
   
});


const gql = require('graphql-tag');

const query = gql(`
query {listPartys(limit:10){items {
    informationModelObjectKind
    partyKey
    typeName
    metaBk
    metaStartEventTime
    metaChange
    partyKind
    basicDataCompleteCode
    metaLoadTime
    metaCorrection
    metaGoldenRecord
    creationDataTime
    metaSource
    persons{items {
      informationModelObjectKind
      maritalStatusCode
      partyKey
      deathIndicator
      typeName
      genderCode
      metaBk
      metaStartEventTime
      birthDateTime
      metaChange
      missingIndicator
      primaryLanguageLanguageKey
      basicDataCompleteCode
      ethnicityCode
      metaLoadTime
      metaCorrection
      metaGoldenRecord
      bloodTypeCode
      creationDataTime
      missingDateTime
      metaSource
      personnames{items {
        prefixTitleCode
        informationModelObjectKind
        description
        partyNameKind
        fullName
        partyNameKey
        typeName
        middleName
        metaStartEventTime
        metaChange
        basicDataCompleteCode
        metaLoadTime
        creationDataTime
        usageCode
        givenName
        effectivePeriod
        utilizedLanguageLanguageKey
        ownerPartyKey
        metaBk
        suffix
        defaultIndicator
        metaCorrection
        metaGoldenRecord
        surname
        metaSource
      }}
    }}
  }}}`);

const Subscription = gql(`
subscription onCreatePersonNema{
    onCreatePersonName{ 
    id
    givenName
    fullName}
  }`);

// APP CODE
client.hydrated().then(function (client) {
    // Now run a query
    client.query({ query: query })
    //client.query({ query: query, fetchPolicy: 'network-only' })   //Uncomment for AWS Lambda
        .then(function logData(data) {
            console.log('results of query: ', JSON.stringify(data));
        })
        .catch(console.error);
    // Now subscribe to results
    const observable = client.subscribe({ query: Subscription});
    const realtimeResults = function realtimeResults(data) {
        console.log('(Realtime Subscription) Subscribing posts -----------> ', data);
    };

    observable.subscribe({
        next: realtimeResults,
        complete: console.log,
        error: console.log,
    });
});