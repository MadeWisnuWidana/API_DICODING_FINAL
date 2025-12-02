class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;
    // 1. Verifikasi thread ada
    await this._threadRepository.verifyAvailableThread(threadId);
    // 2. Verifikasi comment ada
    await this._commentRepository.checkAvailabilityComment(commentId);
    // 3. Verifikasi pemilik (otorisasi)
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    // 4. Lakukan soft delete
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
