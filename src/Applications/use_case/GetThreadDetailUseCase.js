const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../Domains/likes/LikeRepository');

class GetThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    thread.comments = await Promise.all(comments.map(async (comment) => {
      const commentReplies = replies.filter((reply) => reply.commentId === comment.id);
      
      const likeCount = await this._likeRepository.getLikeCountByCommentId(comment.id);

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
        likeCount,
        replies: formattedReplies,
      };
    }));

    return thread;
  }
}

module.exports = GetThreadDetailUseCase;