const pool = require('../../../../../Infrastructures/database/postgres/pool');
const UsersTableTestHelper = require('../../../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../../../../Infrastructures/container');
const createServer = require('../../../../../Infrastructures/http/createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'sebuah comment',
      };
      const server = await createServer(container);

      // Setup: Login & Add Thread
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' },
      });
      const responseLogin = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret_password' },
      });
      const { data: { accessToken } } = JSON.parse(responseLogin.payload);

      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'dicoding', body: 'secret' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread: { id: threadId } } } = JSON.parse(responseThread.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
      const server = await createServer(container);

      // Setup
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' },
      });
      const responseLogin = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret_password' },
      });
      const { data: { accessToken } } = JSON.parse(responseLogin.payload);

      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'dicoding', body: 'secret' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread: { id: threadId } } } = JSON.parse(responseThread.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = { content: 'sebuah comment' };
      const server = await createServer(container);

      // Setup
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' },
      });
      const responseLogin = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret_password' },
      });
      const { data: { accessToken } } = JSON.parse(responseLogin.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-tidak-ada/comments',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment', async () => {
      // Arrange
      const server = await createServer(container);

      // Setup: Login & Add Thread & Add Comment
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' },
      });
      const responseLogin = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret_password' },
      });
      const { data: { accessToken } } = JSON.parse(responseLogin.payload);

      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'dicoding', body: 'secret' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread: { id: threadId } } } = JSON.parse(responseThread.payload);

      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'sebuah comment' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedComment: { id: commentId } } } = JSON.parse(responseComment.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when user is not owner', async () => {
      // Arrange
      const server = await createServer(container);

      // Setup User A
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'userA', password: 'passwordA', fullname: 'User A' },
      });
      const loginA = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'userA', password: 'passwordA' },
      });
      const tokenA = JSON.parse(loginA.payload).data.accessToken;

      // Setup User B
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'userB', password: 'passwordB', fullname: 'User B' },
      });
      const loginB = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'userB', password: 'passwordB' },
      });
      const tokenB = JSON.parse(loginB.payload).data.accessToken;

      // User A creates thread & comment
      const threadRes = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'thread A', body: 'body A' },
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      const threadId = JSON.parse(threadRes.payload).data.addedThread.id;

      const commentRes = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'comment A' },
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      const commentId = JSON.parse(commentRes.payload).data.addedComment.id;

      // Action: User B deletes User A's comment
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${tokenB}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
    });
  });
});
