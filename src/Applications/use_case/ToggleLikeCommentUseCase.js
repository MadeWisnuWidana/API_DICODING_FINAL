class ToggleLikeCommentUseCase {
  constructor({ likeRepository, threadRepository, commentRepository }) {
    this._likeRepository = likeRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;

    // 1. Verifikasi Thread dan Comment ada (fail fast)
    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);

    // 2. Cek status like
    const isLiked = await this._likeRepository.checkLikeStatus(owner, commentId);

    // 3. Logic Toggle
    if (isLiked) {
      await this._likeRepository.deleteLike(owner, commentId);
    } else {
      await this._likeRepository.addLike(owner, commentId);
    }
  }
}

module.exports = ToggleLikeCommentUseCase;