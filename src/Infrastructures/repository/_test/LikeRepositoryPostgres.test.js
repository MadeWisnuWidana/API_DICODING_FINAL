const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const pool = require('../../database/postgres/pool');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist new like', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike('user-123', 'comment-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(1);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like from database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await LikesTableTestHelper.addLike({ id: 'like-123', owner: 'user-123', commentId: 'comment-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.deleteLike('user-123', 'comment-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('checkLikeStatus function', () => {
    it('should return true if like exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await LikesTableTestHelper.addLike({ owner: 'user-123', commentId: 'comment-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLiked = await likeRepositoryPostgres.checkLikeStatus('user-123', 'comment-123');

      // Assert
      expect(isLiked).toEqual(true);
    });

    it('should return false if like does not exist', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const isLiked = await likeRepositoryPostgres.checkLikeStatus('user-123', 'comment-123');

      // Assert
      expect(isLiked).toEqual(false);
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should return correct like count', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await LikesTableTestHelper.addLike({ id: 'like-1', owner: 'user-123', commentId: 'comment-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCount = await likeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(likeCount).toEqual(1);
    });
  });
});