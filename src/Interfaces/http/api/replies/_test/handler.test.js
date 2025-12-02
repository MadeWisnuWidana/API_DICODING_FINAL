const pool = require('../../../../../Infrastructures/database/postgres/pool');
const UsersTableTestHelper = require('../../../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../../../tests/RepliesTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../../../../Infrastructures/container');
const createServer = require('../../../../../Infrastructures/http/createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = { content: 'sebuah balasan' };
      const server = await createServer(container);

      // Setup
      await server.inject({ method: 'POST', url: '/users', payload: { username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' } });
      const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'dicoding', password: 'secret_password' } });
      const { data: { accessToken } } = JSON.parse(login.payload);

      const threadRes = await server.inject({
        method: 'POST', url: '/threads', payload: { title: 'dicoding', body: 'secret' }, headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread: { id: threadId } } } = JSON.parse(threadRes.payload);

      const commentRes = await server.inject({
        method: 'POST', url: `/threads/${threadId}/comments`, payload: { content: 'sebuah comment' }, headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedComment: { id: commentId } } } = JSON.parse(commentRes.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and delete reply', async () => {
      // Arrange
      const server = await createServer(container);

      // Setup
      await server.inject({ method: 'POST', url: '/users', payload: { username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' } });
      const login = await server.inject({ method: 'POST', url: '/authentications', payload: { username: 'dicoding', password: 'secret_password' } });
      const { data: { accessToken } } = JSON.parse(login.payload);

      const threadRes = await server.inject({
        method: 'POST', url: '/threads', payload: { title: 'dicoding', body: 'secret' }, headers: { Authorization: `Bearer ${accessToken}` },
      });
      const threadId = JSON.parse(threadRes.payload).data.addedThread.id;
      const commentRes = await server.inject({
        method: 'POST', url: `/threads/${threadId}/comments`, payload: { content: 'sebuah comment' }, headers: { Authorization: `Bearer ${accessToken}` },
      });
      const commentId = JSON.parse(commentRes.payload).data.addedComment.id;
      const replyRes = await server.inject({
        method: 'POST', url: `/threads/${threadId}/comments/${commentId}/replies`, payload: { content: 'balasan' }, headers: { Authorization: `Bearer ${accessToken}` },
      });
      const replyId = JSON.parse(replyRes.payload).data.addedReply.id;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
