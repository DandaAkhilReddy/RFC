import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function testHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Test endpoint called');
  
  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      environment: {
        hasServer: !!process.env.AZURE_SQL_SERVER,
        hasDatabase: !!process.env.AZURE_SQL_DATABASE,
        hasUser: !!process.env.AZURE_SQL_USER,
        hasPassword: !!process.env.AZURE_SQL_PASSWORD
      }
    })
  };
}

app.http('test', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'test',
  handler: testHandler
});
