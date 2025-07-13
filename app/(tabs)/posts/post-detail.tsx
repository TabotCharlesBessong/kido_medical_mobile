import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, Image, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchSinglePost, clearCurrentPost, clearPostsError, createComment, likePost, unlikePost, addOptimisticComment, toggleOptimisticLike, deletePost, removeOptimisticPost, updatePost } from '@/redux/slice/postsSlice';
import { Post, Comment, Like } from '@/constants/types/post';
import { CustomText, AppButton, AuthInputField } from '@/components';
import { COLORS } from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';

const PostDetailScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { postId } = useLocalSearchParams<{ postId: string }>();

  const { currentPost, isLoading, error } = useSelector((state: RootState) => state.posts);
  const authUser = useSelector((state: RootState) => state.auth.user); // Current logged-in user

  const [commentInput, setCommentInput] = useState('');
  const [isEditing, setIsEditing] = useState(false); // State for editing post content
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);


  useEffect(() => {
    if (postId) {
      dispatch(fetchSinglePost(postId));
    }
    return () => {
      dispatch(clearCurrentPost()); // Clear current post when unmounting
      dispatch(clearPostsError());
    };
  }, [dispatch, postId]);

  useEffect(() => {
    if (error) {
      Alert.alert(t('common.error'), error);
      dispatch(clearPostsError());
    }
  }, [error, dispatch, t]);

  useEffect(() => {
    if (currentPost && isEditing) {
      setEditedTitle(currentPost.title);
      setEditedDescription(currentPost.description);
    }
  }, [currentPost, isEditing]);


  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !postId || !authUser?.id) return;

    const newComment: Comment = { // Optimistic comment object
      id: `optimistic-comment-${Date.now()}`,
      userId: authUser.id,
      user: authUser, // Include user object for display
      postId: postId,
      content: commentInput,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addOptimisticComment({ postId, comment: newComment })); // Optimistic update
    setCommentInput(''); // Clear input immediately
    scrollViewRef.current?.scrollToEnd({ animated: true }); // Scroll to end to show new comment

    try {
      const resultAction = await dispatch(createComment({ postId, content: newComment.content }));
      if (createComment.rejected.match(resultAction)) {
        Alert.alert(t('common.error'), resultAction.payload || t('posts.commentFailed'));
        // Re-fetch post or manually remove optimistic comment if API call fails
        dispatch(fetchSinglePost(postId));
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('posts.commentFailed'));
      dispatch(fetchSinglePost(postId));
    }
  };

  const handleLikeToggle = async () => {
    if (!currentPost || !authUser?.id) return;

    const userLiked = currentPost.likes?.some(like => like.userId === authUser.id);
    const like: Like | undefined = userLiked ? undefined : { // Create a dummy like for optimistic update
        id: `optimistic-like-${Date.now()}`,
        userId: authUser.id,
        postId: currentPost.id,
        createdAt: new Date().toISOString(),
        user: authUser
    };

    dispatch(toggleOptimisticLike({ postId: currentPost.id, userId: authUser.id, liked: !userLiked, like }));

    try {
        if (userLiked) {
            await dispatch(unlikePost(currentPost.id)).unwrap();
        } else {
            await dispatch(likePost(currentPost.id)).unwrap();
        }
    } catch (err: any) {
        Alert.alert(t('common.error'), err.message || t('posts.likeFailed'));
        // Revert optimistic update if API fails
        dispatch(toggleOptimisticLike({ postId: currentPost.id, userId: authUser.id, liked: !userLiked, like }));
    }
  };

  const handleEditPost = async () => {
    if (!currentPost) return;

    if (isEditing) { // If currently in editing mode, this button is "Save"
      Alert.alert(
        t('posts.saveChangesTitle'),
        t('posts.saveChangesMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.save'), onPress: async () => {
            try {
              const resultAction = await dispatch(updatePost({
                postId: currentPost.id,
                payload: { title: editedTitle, description: editedDescription }
              })).unwrap();
              Alert.alert(t('common.success'), t('posts.postUpdatedSuccess'));
              setIsEditing(false); // Exit editing mode
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || t('posts.updateFailed'));
            }
          }},
        ]
      );
    } else { // Not in editing mode, this button is "Edit"
      setIsEditing(true);
    }
  };

  const handleDeletePost = () => {
    if (!currentPost) return;

    Alert.alert(
      t('posts.deletePostTitle'),
      t('posts.deletePostMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: async () => {
          dispatch(removeOptimisticPost(currentPost.id)); // Optimistic delete
          try {
            await dispatch(deletePost(currentPost.id)).unwrap();
            Alert.alert(t('common.success'), t('posts.postDeletedSuccess'));
            // @ts-ignore
            router.replace('/(tabs)/'); // Go back to posts list
          } catch (err: any) {
            Alert.alert(t('common.error'), err.message || t('posts.deleteFailed'));
            // If delete fails, you might want to re-fetch all posts to restore it in UI
            dispatch(fetchSinglePost(currentPost.id)); // Try to re-fetch if optimistic delete fails
          }
        }},
      ]
    );
  };

  if (isLoading && !currentPost) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>{t('common.loadingPost')}</CustomText>
      </View>
    );
  }

  if (!currentPost) {
    return (
      <View style={styles.emptyContainer}>
        <CustomText type="body1" style={styles.emptyText}>{t('posts.postNotFound')}</CustomText>
        <AppButton title={t('common.goBack')} onPress={() => router.back()} />
      </View>
    );
  }

  const isMyPost = currentPost.userId === authUser?.id;
  const userLiked = currentPost.likes?.some(like => like.userId === authUser?.id);

  return (
    <KeyboardAvoidingView
      style={styles.fullScreenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} ref={scrollViewRef}>
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <FontAwesome name="user-circle" size={30} color={COLORS.gray} style={styles.userAvatar} />
              <CustomText type="body3" style={styles.userName}>
                {currentPost.user?.firstname} {currentPost.user?.lastname} {isMyPost && `(${t('posts.myPost')})`}
              </CustomText>
            </View>
            <CustomText type="body5" style={styles.postTime}>
              {formatDistanceToNow(parseISO(currentPost.createdAt), { addSuffix: true })}
            </CustomText>
          </View>

          {isEditing ? (
            <>
              <AuthInputField
                name="editedTitle"
                value={editedTitle}
                onChangeText={setEditedTitle}
                label={t('posts.titleLabel')}
                containerStyle={styles.editInputField}
              />
              <AuthInputField
                name="editedDescription"
                value={editedDescription}
                onChangeText={setEditedDescription}
                label={t('posts.descriptionLabel')}
                containerStyle={styles.editInputField}
                multiline
                numberOfLines={5}
              />
            </>
          ) : (
            <>
              <CustomText type="h3" style={styles.postTitle}>{currentPost.title}</CustomText>
              {currentPost.image && <Image source={{ uri: currentPost.image }} style={styles.postImage} />}
              <CustomText type="body2" style={styles.postDescription}>{currentPost.description}</CustomText>
            </>
          )}

          <View style={styles.postActionsDetail}>
            <TouchableOpacity onPress={handleLikeToggle} style={styles.actionButton}>
              <FontAwesome name={userLiked ? "heart" : "heart-o"} size={24} color={userLiked ? COLORS.danger : COLORS.gray} />
              <CustomText type='body2' style={styles.actionText}>{currentPost.likesCount || 0}</CustomText>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <FontAwesome name="comment-o" size={24} color={COLORS.gray} />
              <CustomText type='body2' style={styles.actionText}>{currentPost.commentsCount || 0}</CustomText>
            </View>
          </View>

          {isMyPost && authUser?.role === 'DOCTOR' && (
            <View style={styles.myPostActions}>
              <AppButton
                title={isEditing ? t('common.save') : t('common.edit')}
                onPress={handleEditPost}
                backgroundColor={isEditing ? COLORS.primary : COLORS.secondary}
                textColor={isEditing ? COLORS.white : COLORS.dark}
                containerStyle={styles.myActionButton}
                loading={isLoading}
              />
              {!isEditing && ( // Show delete only when not editing
                <AppButton
                  title={t('common.delete')}
                  onPress={handleDeletePost}
                  backgroundColor={COLORS.danger}
                  containerStyle={styles.myActionButton}
                  loading={isLoading}
                />
              )}
            </View>
          )}
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <CustomText type="h3" style={styles.commentsHeader}>{t('posts.comments')}</CustomText>
          {currentPost.comments && currentPost.comments.length > 0 ? (
            currentPost.comments.map(comment => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <FontAwesome name="user-circle" size={20} color={COLORS.gray} style={styles.commentAvatar} />
                  <CustomText type="body4" style={styles.commentUserName}>
                    {comment.user?.firstname} {comment.user?.lastname}
                  </CustomText>
                  <CustomText type="body5" style={styles.commentTime}>
                    {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
                  </CustomText>
                </View>
                <CustomText type="body4" style={styles.commentContent}>{comment.content}</CustomText>
              </View>
            ))
          ) : (
            <CustomText type='body2' style={styles.noCommentsText}>{t('posts.noCommentsYet')}</CustomText>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInputField}
          value={commentInput}
          onChangeText={setCommentInput}
          placeholder={t('posts.writeCommentPlaceholder')}
          placeholderTextColor={COLORS.gray}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleCommentSubmit}
        />
        <TouchableOpacity onPress={handleCommentSubmit} style={styles.sendCommentButton}>
          <FontAwesome name="send" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.gray,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: 10,
  },
  userName: {
    color: COLORS.dark,
    fontWeight: 'bold',
  },
  postTime: {
    color: COLORS.gray,
    fontSize: 12,
  },
  postTitle: {
    color: COLORS.dark,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  postDescription: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  postActionsDetail: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 15,
    marginTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionText: {
    marginLeft: 10,
    color: COLORS.gray,
    fontSize: 18,
  },
  myPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 15,
  },
  myActionButton: {
    width: '45%',
    height: 40,
    borderRadius: 20,
  },
  editInputField: {
    marginBottom: 15,
    width: '100%',
    backgroundColor: COLORS.background, // Make it stand out during edit
  },
  commentsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentsHeader: {
    color: COLORS.dark,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 10,
  },
  commentCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    marginRight: 8,
  },
  commentUserName: {
    color: COLORS.dark,
    fontWeight: 'bold',
    marginRight: 'auto', // Push time to the right
  },
  commentTime: {
    color: COLORS.gray,
    fontSize: 10,
  },
  commentContent: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  noCommentsText: {
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 10,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  commentInputField: {
    flex: 1,
    minHeight: 45,
    maxHeight: 120,
    backgroundColor: COLORS.background,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    marginRight: 10,
  },
  sendCommentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});