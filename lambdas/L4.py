import json
import boto3
from decimal import Decimal
from collections import defaultdict
import ast
import os
import base64
from elasticsearch import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

DATABASE_NAME = "users"
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DATABASE_NAME)

def put_into_elasticsearch(tid, payload):
    client = boto3.client("es")

    host = "search-task3-3uzzsv32ju4thn7fkefwctkrga.us-east-2.es.amazonaws.com"
    region = "us-east-2"

    service = "es"
    credentials = boto3.Session().get_credentials()
    awsauth = AWS4Auth('<API_KEY>', '<SECRET-KEY>', region, service)

    es = Elasticsearch(
        hosts = [{'host': host, 'port': 443}],
        http_auth = awsauth,
        use_ssl = True,
        verify_certs = True,
        connection_class = RequestsHttpConnection
    )

     # Prepare the document to be put
    document = {
        "tid" : tid,
        "transaction": payload
    }
    
    es.index(index="transactions", doc_type="Transaction", id=tid, body=document)

    # Verify that the document was successfully indexed
    check = es.get(index="transactions", doc_type="Transaction", id=tid)
    print(check)
    print("Done!")


def lambda_handler(event, context):
    
    
    print('event ',event)
    try:
        records = event['records']['topic3-0']
        total_amt = 0
        topicdata = defaultdict()
        
        
        for record in records:
            value = base64.b64decode(record['value'])
            value = ast.literal_eval(value.decode('utf-8'))
            print("value ", value)
            topicdata = value['topicdata']
            for topic in topicdata:
                tid = topic['tid']
                userid = topic['topicdata']['userid']   
                amount = topic["topicdata"]["total"]
                
                put_into_elasticsearch(tid, topic['topicdata'])
                
                print("Sending", userid)
                userDeets = getUserDetails(userid)
                print("userdeets",userDeets)
                if "totalExpense" in userDeets["Item"]:
                    totalAmount = int(userDeets["Item"]["totalExpense"]) + amount
                else:
                    totalAmount = amount
                    
                # averageExpense = totalAmount//numberOfTransactions
                updateResponse = update_db(userid, int(totalAmount))
                
                userDeets = getUserDetails(userid)
                print("After", userDeets)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Saved successsfully'
            })
        }
    except Exception as e:
        print("error", e)
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Some error occurred at L4'
            })
        }
    


# def getNumber(userId):
#     transactionsTable = table.get_item(Key={'userid': userId})
#     try:
#         response = transactionsTable.get_item(Key={'userid': userId})
#     except ClientError as e:
#         print(e.response['Error']['Message'])
#     else:
#         return response["Item"]
def getUserDetails(userId):
    try:
        response = table.get_item(Key={'id': userId})
    except:
        print("Error")
    else:
        return response
def update_db(userId, totalExpense):
    response = table.update_item(
        Key={
            'id': userId,
        },
        # UpdateExpression="set totalExpense=:s, averageExpense=:a",
        UpdateExpression="set totalExpense=:s",
        ExpressionAttributeValues={
            ':s': totalExpense,
            # ':a': averageExpense
        },
        ReturnValues="UPDATED_NEW"
    )
    print(response)
    return response
