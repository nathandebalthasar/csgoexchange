import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
  PutCommandInput,
  PutCommand,
  UpdateCommandInput,
  UpdateCommand,
  ScanCommand,
  ScanCommandInput,
  BatchWriteCommand,
  BatchWriteCommandInput,
  BatchGetCommandInput,
  BatchGetCommand,
  DeleteCommand,
  DeleteCommandInput,
} from "@aws-sdk/lib-dynamodb";

export class DynamoDB {

  public tableName: string;

  public dbClient: DynamoDBDocumentClient;

  constructor(
    tableName: string,
    client: DynamoDBClient,
  ) {
    this.dbClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName;
  }

  public async put(item: Record<string, any>) {
    return await this.dbClient.send(new PutCommand({
      TableName: this.tableName,
      Item: item,
    }));
  }

  public async query(params: QueryCommandInput) {
    return await this.dbClient.send(new QueryCommand(params));
  }

  public async batchWrite(params: BatchWriteCommandInput) {
    return await this.dbClient.send(new BatchWriteCommand(params));
  }

  public async batchGet(params: BatchGetCommandInput) {
    return await this.dbClient.send(new BatchGetCommand(params));
  }

  public async update(params: UpdateCommandInput) {
    return await this.dbClient.send(new UpdateCommand(params));
  }

  public async delete(params: DeleteCommandInput) {
    return await this.dbClient.send(new DeleteCommand(params));
  }
}
