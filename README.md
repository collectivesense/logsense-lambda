# logsense-lambda

An AWS Lambda function sending Cloudwatch Logs to LogSense

## Usage

### 1. Create function package including the dependencies
```
$ npm install
$ zip -r logsense-lambda.zip index.js node_modules

```

### 2. Create role with the correct permissions

### 3. Create new AWS Lambda function

Upload the zip file and set your customer token as `CUSTOMER_TOKEN` environment
variable.

Connect AWS Cloudwatch Logs groups that you want to send to LogSense

### 4. That's it!