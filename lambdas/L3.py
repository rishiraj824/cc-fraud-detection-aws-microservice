import json
import boto3
import requests
from collections import defaultdict
import ast
import os
import base64
#transactionId, status:True/False
DATABASE_NAME = "transactions"
dynamodb = boto3.resource('dynamodb')
LAMBDA_TO_TOPIC_API = 'https://t3ms686u5g.execute-api.us-east-2.amazonaws.com/dev1/addtotopic'
def lambda_handler(event, context):
    
    print('event ',event)
    try:
        records = event['records']['topic2-0']
        tid = ''
        total_amt = 0
        topicdata = []
        
        for record in records:
            value = base64.b64decode(record['value'])
            value = ast.literal_eval(value.decode('utf-8'))
            print("value ", value)
            topicdata = value['topicdata']
            print(topicdata)
            for topic in topicdata:
                tid = topic['tid']
                newStatus = topic['topicdata']["transactionstatus"]    
                response = update_db(tid, newStatus)
        
        payload = {
          "type" : "topic",
          "topicname" : "topic3",
          "topicdata": topicdata
        }
        
        send_to_topic(json.dumps(payload))
        return 
    except Exception as e:
        print("error", e)
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Some error occurred at L3'
            })
        }
        
    


def send_to_topic(payload):
    print('sending to topic')
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", LAMBDA_TO_TOPIC_API, headers=headers, data=payload)
    print(response.text)
    
def update_db(transactionId, newStatus):
    table = dynamodb.Table(DATABASE_NAME)
    print(table)
    response = table.update_item(
        Key={
            'tid': transactionId,
        },
        UpdateExpression="set transactionstatus=:s",
        ExpressionAttributeValues={
            ':s': newStatus,
        },
        ReturnValues="UPDATED_NEW"
    )
    print(response)
    return response
