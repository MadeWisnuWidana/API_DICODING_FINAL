const ToggleLikeCommentUseCase = require('../ToggleLikeCommentUseCase');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrate the add like action correctly when like not exists', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockLikeRepository.checkLikeStatus = jest.fn(() => Promise.resolve(false)); // Belum like
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      likeRepository: mockLikeRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.checkLikeStatus).toBeCalledWith(useCasePayload.owner, useCasePayload.commentId);
    expect(mockLikeRepository.addLike).toBeCalledWith(useCasePayload.owner, useCasePayload.commentId);
  });

  it('should orchestrate the delete like action correctly when like exists', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    // Mocking
    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockLikeRepository.checkLikeStatus = jest.fn(() => Promise.resolve(true)); // Sudah like
    mockLikeRepository.deleteLike = jest.fn(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      likeRepository: mockLikeRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.checkLikeStatus).toBeCalledWith(useCasePayload.owner, useCasePayload.commentId);
    expect(mockLikeRepository.deleteLike).toBeCalledWith(useCasePayload.owner, useCasePayload.commentId);
  });
});