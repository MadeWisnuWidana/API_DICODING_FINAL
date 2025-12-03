const ToggleLikeCommentUseCase = require('../../../../Applications/use_case/ToggleLikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const toggleLikeCommentUseCase = this._container.getInstance(ToggleLikeCommentUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await toggleLikeCommentUseCase.execute({
      threadId,
      commentId,
      owner,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;