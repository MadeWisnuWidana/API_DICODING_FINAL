const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, owner) {
    const newComment = new NewComment(useCasePayload);
    // Verifikasi dulu apakah thread-nya ada
    await this._threadRepository.verifyAvailableThread(threadId);
    // Jika ada, baru simpan komentar
    return this._commentRepository.addComment(newComment, threadId, owner);
  }
}

module.exports = AddCommentUseCase;
