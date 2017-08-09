'use strict'
const AWS = require('aws-sdk')
let doc = new AWS.DynamoDB.DocumentClient()
let tasksTable = process.env.TASKS_TABLE
let projectsTable = process.env.PROJECTS_TABLE

console.log('Loading function')

exports.handler = function (event, context, callback) {
  console.log('request: ' + JSON.stringify(event))
  handleHttpMethod(event, context)
}

function handleHttpMethod (event, context) {
  let httpMethod = event.httpMethod
  if (event.path.match(/^\/tasks/)) {
    if (httpMethod === 'GET') {
      return handleTasksGET(event, context)
    } else if (httpMethod === 'POST') {
      return handleTasksPOST(event, context)
    } else if (httpMethod === 'PUT') {
      return handleTasksPUT(event, context)
    } else if (httpMethod === 'DELETE') {
      return handleTasksDELETE(event, context)
    }
  } else if (event.path.match(/^\/projects/)) {
    if (httpMethod === 'GET') {
      return handleProjectsGET(event, context)
    }
  }
  return errorResponse(context, 'Unhandled http method:', httpMethod)
}

function handleProjectsGET (event, context) {
  doc.scan({ TableName: projectsTable }, (err, data) => {
    if (err) { return errorResponse(context, 'Error getting projects ', err.message) }
    return successResponse(context, {projects: data.Items})
  })
}

function handleTasksGET (event, context) {
  let params = {
    TableName: tasksTable,
    KeyConditionExpression: 'userId = :key',
    ExpressionAttributeValues: { ':key': event.requestContext.identity.cognitoIdentityId }
  }

  console.log('GET query: ', JSON.stringify(params))
  doc.query(params, (err, data) => {
    if (err) { return errorResponse(context, 'Error: ', err) }
    return successResponse(context, {tasks: data.Items})
  })
}

function handleTasksPOST (event, context) {
  let task = JSON.parse(event.body)
  if (!task || !task.taskId) { return errorResponse(context, 'Error: no taskId found') }
  task.userId = event.requestContext.identity.cognitoIdentityId
  let params = { TableName: tasksTable, Item: task }

  console.log('Inserting task', JSON.stringify(task))
  doc.put(params, (err, data) => {
    if (err) { return errorResponse(context, 'Error: could not add task', err.message) }
    updateProjectTable(task, 'added', () => successResponse(context, {task: task}))
  })
}

function handleTasksPUT (event, context) {
  let task = JSON.parse(event.body)
  let taskId = getTaskId(event.path)
  if (!task || !taskId) { return errorResponse(context, 'Error: no taskId found') }
  let params = {
    TableName: tasksTable,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      taskId: taskId
    },
    UpdateExpression: 'set #a = :val1, #b = :val2',
    ExpressionAttributeNames: {'#a': 'completed', '#b': 'completedOn'},
    ExpressionAttributeValues: {':val1': task.completed, ':val2': task.completedOn},
    ReturnValues: 'ALL_NEW'
  }

  console.log('Updating task', JSON.stringify(params))
  doc.update(params, (err, data) => {
    if (err) { return errorResponse(context, 'Error: could not update task', err.message) }
    updateProjectTable(data.Attributes, 'completed', () => successResponse(context, {task: data.Attributes}))
  })
}

function handleTasksDELETE (event, context) {
  let taskId = getTaskId(event.path)
  if (!taskId) { return errorResponse(context, 'Error: no taskId found') }
  let params = {
    TableName: tasksTable,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      taskId: taskId
    },
    ReturnValues: 'ALL_OLD'
  }

  console.log('Deleting task', JSON.stringify(params))
  doc.delete(params, (err, data) => {
    if (err) { return errorResponse(context, 'Error: could not delete task', err.message) }
    updateProjectTable(data.Attributes, 'deleted', () => successResponse(context, {task: data.Attributes}))
  })
}

function getTaskId (path) { return path.match(/tasks\/(.*)/)[1] }

function updateProjectTable (task, action, callback) {
  let expressions = []
  if (action === 'added') {
    expressions = [updateAddedCount(task, true)]
  } else if (action === 'completed') {
    expressions = [updateCompletedCount(task, true)]
  } else if (action === 'deleted') {
    expressions = [updateAddedCount(task, false)]
  }
  updateTable(expressions, callback)
}

function updateAddedCount (task, inc) {
  return {
    TableName: projectsTable,
    ExpressionAttributeNames: {'#a': 'added', '#b': 'completed'},
    ExpressionAttributeValues: {':val': inc ? 1 : -1, ':comp': inc ? 0 : task.completed ? -1 : 0},
    Key: {'projectId': task.project, 'month': task.createdOn.substr(0, 7)},
    UpdateExpression: 'ADD #a :val, #b :comp'
  }
}

function updateCompletedCount (task, inc) {
  return {
    TableName: projectsTable,
    ExpressionAttributeNames: {'#b': 'completed'},
    ExpressionAttributeValues: {':val': inc ? 1 : -1},
    Key: {'projectId': task.project, 'month': task.createdOn.substr(0, 7)},
    UpdateExpression: 'ADD #b :val'
  }
}

function updateTable (expressions, callback) {
  let params = expressions.shift()
  console.log('update projects table', params)
  doc.update(params, (err) => {
    if (err) { console.log('error updating projects table', err) }
    if (expressions.length) {
      updateTable(expressions, callback)
    } else {
      if (callback) { callback() }
    }
  })
}

function errorResponse (context, logline) {
  let response = { statusCode: 404, body: JSON.stringify({ 'Error': 'Could not execute request' }) }
  let args = Array.from(arguments).slice(1)
  console.log.apply(null, args)
  context.succeed(response)
}

function successResponse (context, body) {
  let response = { statusCode: 200, body: JSON.stringify(body), headers: { 'Access-Control-Allow-Origin': '*' } }
  console.log('response: ' + JSON.stringify(response))
  context.succeed(response)
}
