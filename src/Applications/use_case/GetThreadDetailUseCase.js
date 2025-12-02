class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    thread.comments = comments.map((comment) => {
      const commentReplies = replies.filter((reply) => reply.commentId === comment.id);

      const formattedReplies = commentReplies.map((reply) => ({
        id: reply.id,
        content: reply.isDelete ? '**balasan telah dihapus**' : reply.content,
        date: reply.date,
        username: reply.username,
      }));

      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.isDelete ? '**komentar telah dihapus**' : comment.content,
        replies: formattedReplies,
      };
    });

    return thread;
  }
}

module.exports = GetThreadDetailUseCase;
