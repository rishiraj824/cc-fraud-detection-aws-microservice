import json
import boto3
import uuid
import requests
from boto3.dynamodb.conditions import Key

LAMBDA_TO_TOPIC_API = 'https://t3ms686u5g.execute-api.us-east-2.amazonaws.com/dev1/addtotopic'
USERS_TABLE = 'users'
TRANSACTION_TABLE = 'transactions'

def store_in_db(payload, TABLE_NAME):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(TABLE_NAME)
    print(payload)
    response = table.put_item(
        Item=payload
    )
    print(response)
    
    return response

def get_item(payload, TABLE_NAME):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(TABLE_NAME)
    response = table.get_item(
        Key=payload
    )
    if 'Item' in response:
        return response['Item']
    else:
        return None
        
def get_user_index(email):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(USERS_TABLE)
    response = table.query(
        IndexName='email-index',
        KeyConditionExpression=Key('email').eq(email)
    )
    print(response)
    if 'Items' in response:
        return response['Items'][0]
    else:
        return None

def send_to_topic(payload):
    print('sending to topic')
    print(type(payload))
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", LAMBDA_TO_TOPIC_API, headers=headers, data=payload)
    print(response.text)
    # return r
    
def lambda_handler(event, context):
    print('event' , event)
    type = event['type']
    if type == 'transaction':
        tid = event['tid']
        print('tid ', tid)
        userDetails = {
            "tid": tid
        }
        user_details = get_item(userDetails, TRANSACTION_TABLE)
        return {
            'statusCode': 200,
            'body': json.dumps({
                'transactionstatus': user_details['transactionstatus']
            })
        }
    
    topic = event['topicname']
    data = event['topicdata']
    if topic == 'mytopic':
        tid = str(uuid.uuid4())
        print('tid ', tid)
        event['tid'] = tid
        email = event['topicdata']['email']
        user = get_user_index(email)
        if user is None:
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Email not found'
                })
            }
        event['topicdata']['userid'] = user['id']
        userDetails = {
            "tid": tid,
            "transactionstatus": "pending",
            "userid" : user['id']
        }
        store_in_db(userDetails, TRANSACTION_TABLE)
        
    send_to_topic(json.dumps(event))
    
    print('done')
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': 'Forwarded Successfully',
            'tid': event['tid']
        })
    }
