import json
import boto3
import os
import base64
import requests
import ast
from collections import defaultdict

LAMBDA_TO_TOPIC_API = 'https://t3ms686u5g.execute-api.us-east-2.amazonaws.com/dev1/addtotopic'
USERS_TABLE = 'users'
TRANSACTION_TABLE = 'transaction'

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
    
    return ans

def get_transaction_if_fraud(details, transaction_amt):
    print(details['spending_limit'])
    print(transaction_amt)
    if details['spending_limit'] > transaction_amt:
        return 'approved'
    else:
        return 'declined'
    
def send_to_topic(payload):
    print('sending to topic')
    print(type(payload))
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", LAMBDA_TO_TOPIC_API, headers=headers, data=payload)
    print(response.text)

def lambda_handler(event, context):
    # TODO implement
    print('event ',event)
    try:
        transactions = []
        records = event['records']['mytopic-0']
        tid = ''
        total_amt = 0
        topicdata = defaultdict()
        
        for record in records:
            
            value = base64.b64decode(record['value'])
            value = ast.literal_eval(value.decode('utf-8'))
            print(value)
            topicdata = value['topicdata']
            tid = value['tid']
            total_amt = value['topicdata']['total']
            userid = value['topicdata']['userid']
            user_transaction_records = get_item({ 'id': userid }, USERS_TABLE)
            
            # setting user details
            # topicdata['user'] = user_transaction_records
        
            approval_status = get_transaction_if_fraud(user_transaction_records, total_amt)
            
            # setting approval status
            topicdata['transactionstatus'] = approval_status
            
            print(topicdata)
            transactions.append({
                "tid": tid,
                "topicdata": topicdata
            })
            
        
        print(transactions)
        payload = {
          "type" : "topic",
          "topicname" : "topic2",
          "topicdata":transactions
        }
        
        
        # forward to Topic 2
        send_to_topic(json.dumps(payload))
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Forwarded Successfully'
            })
        }
    except Exception as e:
        print("error", e)
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Some error occurred at L2'
            })
        }
   
    
    
