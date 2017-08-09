'use strict'

const AWS = require('aws-sdk')
const Chance = require('chance')
const moment = require('moment')
const async = require('async')
const _ = require('lodash')

let projects = 'Development Staging Production Pipeline Deployment QA Testing Troubleshooting Support Release'.split(' ')
let format = 'YYYY-MM-DD'
let max = 100

let LAMBDA_FUNCTION = process.argv[2]
let REGION = process.argv[3]

if (!LAMBDA_FUNCTION || !REGION) {
  console.log('node bootstrap.js <LAMBDA_FUNCTION> <REGION>')
  process.exit()
}

const lambda = new AWS.Lambda({ region: REGION })
const chance = new Chance()

lambda.getFunction({ FunctionName: LAMBDA_FUNCTION }, (err, data) => {
  if (err) {
    console.log(`An error occurred while trying to get function '${LAMBDA_FUNCTION}' in ${REGION} > ${err.message}`)
    return process.exit()
  }
  bootstrap()
})

function payload (path, verb, body) {
  return JSON.stringify({
    path: path,
    httpMethod: verb,
    requestContext: { identity: { cognitoIdentityId: 'uuid-boostrap-user' } },
    body: body
  })
}

function postBody (task) {
  return JSON.stringify({
    taskId: task.id,
    name: 'BOOSTRAPED',
    completed: false,
    project: task.project,
    createdOn: task.createdOn,
    due: task.due
  })
}

function putBody (task) {
  return JSON.stringify({ completed: true, completedOn: task.completedOn })
}

function entry () {
  let entry = {
    id: 'bootstrap-' + chance.guid(),
    completed: chance.bool({likelihood: 70}),
    project: chance.pickone(projects)
  }
  let createdOn = moment(chance.date({year: 2016}))
  let fromNow = chance.integer({min: 1, max: 60})
  let due = moment(createdOn).add(fromNow, 'days')
  entry.createdOn = createdOn.format(format)
  entry.due = due.format(format)

  if (entry.completed) {
    let completedOn = moment(createdOn).add(chance.integer({min: 1, max: fromNow}), 'days')
    entry.completedOn = completedOn.format(format)
  }
  return entry
}

function bootstrap () {
  let tasks = _.times(max, entry)
  let completedTasks = _.filter(tasks, 'completed')
  let errors = 0
  console.log(`Creating ${max} tasks: `)
  async.each(tasks, (task, callback) => {
    lambda.invoke({ FunctionName: LAMBDA_FUNCTION, Payload: payload('/tasks', 'POST', postBody(task)) }, (err, data) => {
      if (err) { errors += 1 }
      process.stdout.write(err ? 'X' : '.')
      callback()
    })
  }, (err) => {
    console.log()
    if (err) { console.log(err.message) }
    if (errors > 0) { console.log(`Number of errors while creating tasks: ${errors}`) }
    errors = 0
    console.log('Completing some tasks: ')
    async.each(completedTasks, (task, callback) => {
      lambda.invoke({ FunctionName: LAMBDA_FUNCTION, Payload: payload(`/tasks/${task.id}`, 'PUT', putBody(task)) }, (err, data) => {
        if (err) { errors += 1 }
        process.stdout.write(err ? 'X' : '.')
        callback()
      })
    }, (err) => {
      console.log()
      if (err) { console.log(err.message) }
      if (errors > 0) { console.log(`Number of errors while completing tasks: ${errors}`) }
      console.log('Done bootstraping')
    })
  })
}
