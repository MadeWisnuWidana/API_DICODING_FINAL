const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'forumapi_jwt',
    },
  },
  // Tambahkan route ini:
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getThreadHandler,
    // Tidak perlu options auth karena resource terbuka
  },
  {
    method: 'GET',
    path: '/threads',
    handler: (request, h) => h.response({ status: 'success', message: 'Rate limit test endpoint' }).code(200),
  },
];

module.exports = routes;
